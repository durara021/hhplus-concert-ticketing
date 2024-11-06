import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'TOKEN_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
          db: 1, // TOKEN 데이터 전용 DB
        });
      },
    },
    {
      provide: 'QUEUE_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
          db: 2, // QUEUE 데이터 전용 DB
        });
      },
    },
    {
      provide: 'CONCERT_CACHING_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6380,
        });
      },
    },
  ],
  exports: ['TOKEN_CLIENT', 'QUEUE_CLIENT', 'CONCERT_CACHING_CLIENT'],
})
export class RedisModule {}
