import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Artist } from './artist.entity';
import { Playlist } from './playlist.entity';

export enum UserSubscriptionTier {
    FREE = 'free',
    PREMIUM = 'premium',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ name: 'password_hash', nullable: false })
    passwordHash: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({
        type: 'enum',
        enum: UserSubscriptionTier,
        default: UserSubscriptionTier.FREE,
        name: 'subscription_tier',
    })
    subscriptionTier: UserSubscriptionTier;

    @Column({ default: false })
    isArtist: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Artist, (artist) => artist.user)
    artist: Artist;

    @OneToMany(() => Playlist, (playlist) => playlist.user)
    playlists: Playlist[];
}
