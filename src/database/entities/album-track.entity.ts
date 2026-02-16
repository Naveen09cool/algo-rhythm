import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Album } from './album.entity';
import { Track } from './track.entity';

@Entity('album_tracks')
export class AlbumTrack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Album, (album) => album.tracks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'album_id' })
    album: Album;

    @ManyToOne(() => Track, (track) => track.albumTracks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'track_id' })
    track: Track;

    @Column({ name: 'track_number', type: 'int' })
    trackNumber: number;

    @Column({ name: 'disc_number', type: 'int', default: 1 })
    discNumber: number;

    @CreateDateColumn({ name: 'added_at' })
    addedAt: Date;
}
