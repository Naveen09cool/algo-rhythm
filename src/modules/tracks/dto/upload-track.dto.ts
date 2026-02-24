import { IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class UploadTrackDto {
    @IsString()
    title: string;

    @IsString()
    genre: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    duration: number; // in seconds

    @IsOptional()
    @IsUUID()
    albumId?: string; // Optional: if artist wants to add track to an album
}
