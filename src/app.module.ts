import { Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReservationModule } from './reservation/reservation.module';
import { ConcertModule } from './concert/concert.module';
import { PaymentModule } from './payment/payment.module';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
   import { GlobalExceptionFilter } from './common/exceptionFilter/exception.filter';
import { baseDBConfig } from './db.config';
import { UserTokenModule } from './userToken/userTocken.module';
//import { AuthorizationGuard } from './common/guard/pres/authorization.controller';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    AccountModule, ConcertModule, PaymentModule,
    ReservationModule, UserTokenModule, RedisModule,
    TypeOrmModule.forRoot({
      ...baseDBConfig
    }),
    EventEmitterModule.forRoot(), // 이벤트 이미터 모듈을 전역으로 등록
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 설정 (다른 모듈에서도 ConfigService를 사용할 수 있음)
    }),
  ],
  //controllers: [AppController],
  providers: [
    /*{
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 전역 필터로 등록
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard, // SessionGuard를 전역으로 등록
    }*/
  ],
})
export class AppModule /*implements NestModule*/ {
  /*configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)  // 전역적으로 미들웨어 적용
      .forRoutes('*');  // 모든 경로에 적용
  }*/
}