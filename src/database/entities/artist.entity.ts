import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Track } from './track.entity';
import { Album } from './album.entity';

@Entity('artists')
export class Artist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.artist)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'artist_name' })
    name: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ default: false })
    verified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Track, (track) => track.artist)
    tracks: Track[];

    @OneToMany(() => Album, (album) => album.artist)
    albums: Album[];
}
