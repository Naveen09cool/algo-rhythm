import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Track, Artist, Album, AlbumTrack, TrackFile, TrackFileFormat } from '../../database/entities';
import { S3ConfigService } from '../../configurations/s3.config';
import { UploadTrackDto } from './dto';

@Injectable()
export class TrackService {
    constructor(
        @InjectRepository(Track)
        private readonly trackRepository: Repository<Track>,
        @InjectRepository(Artist)
        private readonly artistRepository: Repository<Artist>,
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>,
        @InjectRepository(AlbumTrack)
        private readonly albumTrackRepository: Repository<AlbumTrack>,
        @InjectRepository(TrackFile)
        private readonly trackFileRepository: Repository<TrackFile>,
        private readonly s3ConfigService: S3ConfigService,
    ) { }

    async uploadTrack(
        userId: string,
        uploadTrackDto: UploadTrackDto,
        file: Express.Multer.File,
    ): Promise<{ track: Track; s3Url: string }> {
        // Check if user is an artist
        const artist = await this.artistRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!artist) {
            throw new BadRequestException('User is not registered as an artist');
        }

        // Check if artist is verified
        if (!artist.verified) {
            throw new ForbiddenException('Only verified artists can upload tracks');
        }

        // Validate file
        if (!file) {
            throw new BadRequestException('No audio file provided');
        }

        if (!file.mimetype.startsWith('audio/')) {
            throw new BadRequestException('Uploaded file must be an audio file');
        }

        // Check if album exists and belongs to the artist (if albumId is provided)
        if (uploadTrackDto.albumId) {
            const album = await this.albumRepository.findOne({
                where: { id: uploadTrackDto.albumId, artist: { id: artist.id } },
            });

            if (!album) {
                throw new NotFoundException(
                    'Album not found or does not belong to the artist',
                );
            }
        }

        try {
            // Upload file to S3
            const s3Key = this.generateS3Key(artist.id, file.originalname);
            const s3Url = await this.uploadToS3(file.buffer, s3Key, file.mimetype);

            // Create track record
            const track = this.trackRepository.create({
                title: uploadTrackDto.title,
                genre: uploadTrackDto.genre,
                duration: uploadTrackDto.duration,
                artist: artist,
            });

            const savedTrack = await this.trackRepository.save(track);

            // Create track file record
            const trackFile = this.trackFileRepository.create({
                track: savedTrack,
                fileUrl: s3Url,
                filePath: s3Key,
                fileSize: file.size,
                mimeType: file.mimetype,
                format: this.getFormatFromMimetype(file.mimetype),
                bitrate: 128, // Default bitrate
            });

            await this.trackFileRepository.save(trackFile);

            // If albumId is provided, add track to album
            if (uploadTrackDto.albumId) {
                const album = await this.albumRepository.findOne({
                    where: { id: uploadTrackDto.albumId },
                });

                if (album) {
                    const albumTrack = this.albumTrackRepository.create({
                        album,
                        track: savedTrack,
                    });

                    await this.albumTrackRepository.save(albumTrack);

                    // Update album duration
                    await this.updateAlbumDuration(album.id);
                }
            }

            return {
                track: savedTrack,
                s3Url,
            };
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Failed to upload track: ' + error.message,
            );
        }
    }

    private generateS3Key(artistId: string, originalFilename: string): string {
        const timestamp = Date.now();
        const filename = originalFilename.replace(/\s+/g, '-');
        return `tracks/${artistId}/${timestamp}-${filename}`;
    }

    private async uploadToS3(
        fileBuffer: Buffer,
        s3Key: string,
        mimeType: string,
    ): Promise<string> {
        try {
            const s3Client = this.s3ConfigService.getS3Client();
            const bucketName = this.s3ConfigService.getBucketName();

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: mimeType,
            });

            await s3Client.send(command);

            // Return the S3 URL
            return `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to upload file to S3: ' + error.message,
            );
        }
    }

    private async updateAlbumDuration(albumId: string): Promise<void> {
        const albumTracks = await this.albumTrackRepository.find({
            where: { album: { id: albumId } },
            relations: ['track'],
        });

        const totalDuration = albumTracks.reduce(
            (sum, at) => sum + (at.track.duration || 0),
            0,
        );

        await this.albumRepository.update(albumId, {
            totalDuration,
        });
    }

    private getFormatFromMimetype(mimetype: string): TrackFileFormat {
        if (mimetype.includes('ogg')) {
            return TrackFileFormat.OGG;
        } else if (mimetype.includes('aac') || mimetype.includes('mp4')) {
            return TrackFileFormat.AAC;
        }
        return TrackFileFormat.OGG; // default
    }

    async getArtistTracks(userId: string): Promise<Track[]> {
        // Check if user is an artist
        const artist = await this.artistRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!artist) {
            throw new BadRequestException('User is not registered as an artist');
        }

        // Get all tracks for this artist
        const tracks = await this.trackRepository.find({
            where: { artist: { id: artist.id } },
            relations: ['artist', 'files'],
            order: { createdAt: 'DESC' },
        });

        return tracks;
    }
}
