import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './configurations/database.module';
import { UserModule } from './modules/user/user.module';
import { TrackModule } from './modules/tracks/track.module';
import { PlaybackModule } from './modules/playback/playback.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    TrackModule,
    PlaybackModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
