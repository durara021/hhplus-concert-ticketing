import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './reservation/reservation.module';
import { ConcertModule } from './concert/concert.module';
import { PaymentModule } from './payment/payment.module';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { SessionService } from './session/domain/session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queue/queue.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/exceptionFilter/exception.filter';
import { baseDBConfig } from './db.config';
import { redisStore } from 'cache-manager-redis-yet';
import Redis from 'ioredis';

@Module({
  imports: [
    ReservationModule, ConcertModule, PaymentModule,
    AccountModule, SessionModule, QueueModule, CommonModule, 
    TypeOrmModule.forRoot({
      ...baseDBConfig
    }),
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 5 * 60000, // 5 minutes (milliseconds)
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, SessionService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 전역 필터로 등록
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
    /*{
      provide: APP_GUARD,
      useClass: SessionGuard, // SessionGuard를 전역으로 등록
    }*/
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule /*implements NestModule*/ {
  /*configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)  // 전역적으로 미들웨어 적용
      .forRoutes('*');  // 모든 경로에 적용
  }*/
}