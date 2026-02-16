import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Track } from './track.entity';

export enum TrackFileFormat {
    OGG = 'ogg',
    AAC = 'aac',
}

@Entity('track_files')
export class TrackFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Track, (track) => track.files)
    @JoinColumn({ name: 'track_id' })
    track: Track;

    @Column({
        type: 'enum',
        enum: TrackFileFormat,
        default: TrackFileFormat.OGG,
    })
    format: TrackFileFormat;

    @Column({ type: 'int', default: 128 })
    bitrate: number;

    @Column({ name: 'file_url' })
    fileUrl: string;

    @Column({ name: 'file_size', type: 'bigint' })
    fileSize: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
