import { Controller, Get, Post, Body, Patch, Delete, NotFoundException, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);
    // Stateless: return token to client; do not store token server-side
    return result;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  findOne(@CurrentUser() user: any) {
    return this.userService.findOne(String(user.id));
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  update(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(String(user.id), updateUserDto);
  }

  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  remove(@CurrentUser() user: any) {
    return this.userService.remove(String(user.id));
  }
}
