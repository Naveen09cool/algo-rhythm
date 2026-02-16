import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PlaylistTrack } from './playlist-track.entity';

@Entity('playlists')
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.playlists)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_public', default: false })
    isPublic: boolean;

    @Column({ name: 'cover_image_url', nullable: true })
    coverImageUrl: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => PlaylistTrack, (pt) => pt.playlist)
    tracks: PlaylistTrack[];
}
