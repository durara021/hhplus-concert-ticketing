import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { ConcertModule } from './concert/concert.module';
import { PaymentModule } from './payment/payment.module';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalExceptionFilter } from './common/exceptionFilter/exception.filter';
import { baseDBConfig } from './db.config';
import { UserTokenModule } from './userToken/userTocken.module';
//import { AuthorizationGuard } from './common/guard/pres/authorization.controller';
import { RedisModule } from './common/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Redis from 'ioredis';

@Module({
  imports: [
    AccountModule, ConcertModule, PaymentModule,
    ReservationModule, UserTokenModule, RedisModule, 
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
          store: store as unknown as CacheStorage,
          ttl: 5 * 60000, // 5 minutes (milliseconds)
        };
      },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nestjs-client',
            brokers: ['localhost:9094'], // Kafka 브로커 주소
          },
          consumer: {
            groupId: 'nestjs-group', // 고유한 그룹 ID
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
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