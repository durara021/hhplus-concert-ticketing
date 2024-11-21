import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './domain/reservation.service';
import { ReservationController } from './pres/reservation.controller';
import { ConcertModule } from '../concert/concert.module';
import { AbstractReservationService } from './domain/service.interfaces';
import { AbstractReservationRepository } from './domain/repository.interfaces';
import { ReservationRepository } from './infra/repositories/reservation.repository';
import { OutBoxEntity, ReservationEntity } from './infra/entities';
import { ReservationUsecase } from './app/reservation.use-case';
import { RedisModule } from '../common/redis/redis.module';
import { KafkaModule } from '../common/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationEntity, OutBoxEntity])
    , forwardRef(() => ConcertModule), RedisModule, KafkaModule,
  ],
  controllers: [ ReservationController ],
  providers: [
    ReservationUsecase,
    { provide: AbstractReservationRepository, useClass: ReservationRepository },
    { provide: AbstractReservationService, useClass: ReservationService }
  ],
  exports: [AbstractReservationService]
})
export class ReservationModule {}
