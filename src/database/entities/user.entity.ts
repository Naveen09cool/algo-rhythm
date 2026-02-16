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

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column()
    username: string;

    @Column({
        type: 'enum',
        enum: UserSubscriptionTier,
        default: UserSubscriptionTier.FREE,
        name: 'subscription_tier',
    })
    subscriptionTier: UserSubscriptionTier;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Artist, (artist) => artist.user)
    artist: Artist;

    @OneToMany(() => Playlist, (playlist) => playlist.user)
    playlists: Playlist[];
}
