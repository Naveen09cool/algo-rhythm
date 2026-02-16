import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Track } from './track.entity';

@Entity('playlist_tracks')
export class PlaylistTrack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Playlist, (playlist) => playlist.tracks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playlist_id' })
    playlist: Playlist;

    @ManyToOne(() => Track, (track) => track.playlistTracks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'track_id' })
    track: Track;

    @Column({ type: 'int' })
    position: number;

    @CreateDateColumn({ name: 'added_at' })
    addedAt: Date;
}
