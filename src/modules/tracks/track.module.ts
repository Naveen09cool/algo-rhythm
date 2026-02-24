import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track, Artist, Album, AlbumTrack, TrackFile } from '../../database/entities';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { S3ConfigService } from '../../configurations/s3.config';

@Module({
    imports: [TypeOrmModule.forFeature([Track, Artist, Album, AlbumTrack, TrackFile])],
    controllers: [TrackController],
    providers: [TrackService, S3ConfigService],
    exports: [TrackService],
})
export class TrackModule { }
