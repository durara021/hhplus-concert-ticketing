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
import { ReservationEntity } from './reservation/infra/entities';
import { ConcertEntity, ConcertPlanEntity } from './concert/infra/entities';
import { PaymentEntity } from './payment/infra/entities';
import { AccountEntity, AccountHistoryEntity } from './account/infra/entities';
import { SessionEntity } from './session/infra/entities';
import { QueueEntity } from './queue/infra/entities';

@Module({
  imports: [
    ReservationModule, ConcertModule, PaymentModule,
    AccountModule, SessionModule, QueueModule, CommonModule,
    TypeOrmModule.forRoot({
      type: 'mysql',  // 사용하려는 데이터베이스 유형 (예: mysql, sqlite 등)
      host: 'localhost', // 데이터베이스 호스트
      port: 3306,        // 포트 번호
      username: 'root',  // 데이터베이스 사용자 이름
      password: 'qwe124!@$', // 데이터베이스 비밀번호
      database: 'ticketing',  // 사용할 데이터베이스 이름
      //entities: [ __dirname + '/entitiy/*.entity{.ts,.js}' ],  // 엔티티 배열
      entities: [ ReservationEntity, ConcertEntity, ConcertPlanEntity, PaymentEntity, AccountEntity, AccountHistoryEntity, SessionEntity, QueueEntity ],  // 엔티티 배열
      synchronize: true, // 개발 시 자동으로 스키마를 동기화 (생산 환경에서는 false로 설정 권장)
      extra: {
        connectionLimit: 20,
      },
      logging: true
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
