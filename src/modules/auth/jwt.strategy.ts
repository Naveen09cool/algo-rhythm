import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        const extractor = (req: Request) => {
            if (!req) return null;
            // Prefer session-stored jwt
            // @ts-ignore
            if (req.session && req.session.jwt) return req.session.jwt;
            const auth = req.headers?.authorization;
            if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
            return null;
        };

        const opts: StrategyOptions = {
            jwtFromRequest: ExtractJwt.fromExtractors([extractor as any]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'defaultJwtSecret',
        };
        super(opts);
    }

    async validate(payload: any) {
        return { id: payload.sub, email: payload.email, isArtist: payload.isArtist };
    }
}
