import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities';
import { Artist } from '../../database/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, username, artist: artistData } = createUserDto;

    // Check if a user with this email already exists
    const existingUser = await this.userRepository.findOne({ where: [{ email }, { username }] });
    if (existingUser) {
      throw new ConflictException('A user with this email or username already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Use a transaction to ensure atomicity when creating user + artist
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the user
      const user = this.userRepository.create({
        email,
        passwordHash,
        username,
        isArtist: !!artistData,
      });
      const savedUser = await queryRunner.manager.save(user);

      // If artist data is provided, create the artist profile
      let savedArtist: Artist | null = null;
      if (artistData) {
        const artist = new Artist();
        artist.user = savedUser;
        artist.name = artistData.artistName;
        if (artistData.bio) {
          artist.bio = artistData.bio;
        }
        savedArtist = await queryRunner.manager.save(artist);
      }

      await queryRunner.commitTransaction();

      // Return the response without sensitive data
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return {
        message: 'User registered successfully',
        user: {
          ...userWithoutPassword,
          ...(savedArtist && {
            artist: {
              id: savedArtist.id,
              name: savedArtist.name,
              bio: savedArtist.bio,
              verified: savedArtist.verified,
            },
          }),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Re-throw NestJS HTTP exceptions as-is
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to register user');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['artist'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user data without sensitive information
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      message: 'User details retrieved successfully',
      user: {
        ...userWithoutPassword,
        ...(user.artist && {
          artist: {
            id: user.artist.id,
            name: user.artist.name,
            bio: user.artist.bio,
            verified: user.artist.verified,
          },
        }),
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Find the user first
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingEmail) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Check if username is being updated and if it's already taken
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({ where: { username: updateUserDto.username } });
      if (existingUsername) {
        throw new ConflictException('Username is already in use');
      }
    }

    // Only allow updating username and email
    const updateData: any = {};
    if (updateUserDto.username) {
      updateData.username = updateUserDto.username;
    }
    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update. Only username and email can be updated');
    }

    // Update the user
    await this.userRepository.update({ id }, updateData);

    // Fetch updated user data with artist relation
    const updatedUser = await this.userRepository.findOne({ where: { id }, relations: ['artist'] });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Return updated user data without sensitive information
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return {
      message: 'User updated successfully',
      user: {
        ...userWithoutPassword,
        ...(updatedUser.artist && {
          artist: {
            id: updatedUser.artist.id,
            name: updatedUser.artist.name,
            bio: updatedUser.artist.bio,
            verified: updatedUser.artist.verified,
          },
        }),
      },
    };
  }

  async remove(id: string) {
    // Find the user first
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use a transaction to ensure atomicity when deleting user + artist
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete artist if user is an artist
      if (user.isArtist) {
        await queryRunner.manager.delete(Artist, { user: { id: user.id } });
      }

      // Delete the user
      await queryRunner.manager.delete(User, { id });

      await queryRunner.commitTransaction();

      return {
        message: 'User and associated data deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to delete user');
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Find user by email with artist relation
    const user = await this.userRepository.findOne({ where: { email }, relations: ['artist'] });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user data without sensitive information
    const { passwordHash, ...userWithoutPassword } = user;

    // Create JWT token
    const payload = { sub: user.id, email: user.email, isArtist: user.isArtist };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        ...userWithoutPassword,
        ...(user.artist && {
          artist: {
            id: user.artist.id,
            name: user.artist.name,
            bio: user.artist.bio,
            verified: user.artist.verified,
          },
        }),
      },
    };
  }
}
