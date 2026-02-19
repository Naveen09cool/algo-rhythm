import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArtistDto {
    @IsString()
    @IsNotEmpty()
    artistName: string;

    @IsString()
    @IsOptional()
    bio?: string;
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, { message: 'Password must be stronger' })
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateArtistDto)
    artist?: CreateArtistDto;
}
