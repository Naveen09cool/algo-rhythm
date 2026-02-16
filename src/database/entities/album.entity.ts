import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Artist } from './artist.entity';
import { AlbumTrack } from './album-track.entity';

@Entity('albums')
export class Album {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Artist, (artist) => artist.albums)
    @JoinColumn({ name: 'artist_id' })
    artist: Artist;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'cover_image_url', nullable: true })
    coverImageUrl: string;

    @Column({ name: 'release_date', type: 'date' })
    releaseDate: Date;

    @Column()
    genre: string;

    @Column({ name: 'total_duration', type: 'int', default: 0 })
    totalDuration: number;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => AlbumTrack, (at) => at.album)
    tracks: AlbumTrack[];
}
