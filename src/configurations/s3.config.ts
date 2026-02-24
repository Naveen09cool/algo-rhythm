import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3ConfigService {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    getS3Client(): S3Client {
        return this.s3Client;
    }

    getBucketName(): string {
        if (!process.env.AWS_S3_BUCKET_NAME) {
            throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
        }
        return process.env.AWS_S3_BUCKET_NAME;
    }
}
