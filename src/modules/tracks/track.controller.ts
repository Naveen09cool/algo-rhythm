import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Body,
    BadRequestException,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrackService } from './track.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadTrackDto } from './dto';

@Controller('tracks')
export class TrackController {
    constructor(private readonly trackService: TrackService) { }

    @Post('upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('audio/')) {
                    return callback(
                        new BadRequestException('Only audio files are allowed'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @HttpCode(HttpStatus.CREATED)
    async uploadTrack(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadTrackDto: UploadTrackDto,
    ) {
        if (!file) {
            throw new BadRequestException('No audio file provided');
        }

        const result = await this.trackService.uploadTrack(
            user.id,
            uploadTrackDto,
            file,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Track uploaded successfully',
            data: {
                trackId: result.track.id,
                title: result.track.title,
                genre: result.track.genre,
                duration: result.track.duration,
                s3Url: result.s3Url,
            },
        };
    }

    @Get('my-uploads')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async getMyTracks(@CurrentUser() user: any) {
        const tracks = await this.trackService.getArtistTracks(user.id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Tracks retrieved successfully',
            data: tracks,
        };
    }
}
