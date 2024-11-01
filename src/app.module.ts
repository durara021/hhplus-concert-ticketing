import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './reservation/reservation.module';
import { ConcertModule } from './concert/concert.module';
import { PaymentModule } from './payment/payment.module';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { SessionService } from './session/domain/session.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queue/queue.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/exceptionFilter/exception.filter';
import { baseDBConfig } from './db.config';

@Module({
  imports: [
    ReservationModule, ConcertModule, PaymentModule,
    AccountModule, SessionModule, QueueModule, CommonModule, 
    TypeOrmModule.forRoot({
      ...baseDBConfig
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SessionService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 전역 필터로 등록
    },
    /*{
      provide: APP_GUARD,
      useClass: SessionGuard, // SessionGuard를 전역으로 등록
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
