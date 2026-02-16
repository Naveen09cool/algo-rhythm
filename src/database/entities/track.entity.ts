import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Artist } from './artist.entity';
import { TrackFile } from './track-file.entity';
import { PlaylistTrack } from './playlist-track.entity';
import { AlbumTrack } from './album-track.entity';

export enum AiVerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

@Entity('tracks')
export class Track {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Artist, (artist) => artist.tracks)
    @JoinColumn({ name: 'artist_id' })
    artist: Artist;

    @Column()
    title: string;

    @Column({ type: 'int', default: 0 })
    duration: number; // in seconds

    @Column({ name: 'ai_verified', default: false })
    aiVerified: boolean;

    @Column({
        type: 'enum',
        enum: AiVerificationStatus,
        default: AiVerificationStatus.PENDING,
        name: 'ai_verification_status'
    })
    aiVerificationStatus: AiVerificationStatus;

    @Column()
    genre: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => TrackFile, (file) => file.track)
    files: TrackFile[];

    @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.track)
    playlistTracks: PlaylistTrack[];

    @OneToMany(() => AlbumTrack, (albumTrack) => albumTrack.track)
    albumTracks: AlbumTrack[];
}
