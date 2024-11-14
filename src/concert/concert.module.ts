import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/common/redis/redis.module';
import { ConcertController } from './pres/concert.controller';
import { ConcertUsecase } from './app/concert.use-case';
import { AbstractConcertService } from './domain/service.interfaces';
import { ConcertService } from './domain/concert.service';
import { ConcertEntity, ConcertPlanEntity, ConcertTicketEntity } from './infra/entities';
import {
  AbstractConcertRepository, AbstractConcertPlanRepository, AbstractConcertTicketRepository,
} from './domain/repository.interfaces';
import { ConcertRepository, ConcertPlanRepository, ConcertTicketRepository, } from './infra/repositories';
import { ReservationModule } from '../reservation/reservation.module';

@Module({
  imports: [ TypeOrmModule.forFeature([ ConcertEntity, ConcertPlanEntity, ConcertTicketEntity ]), forwardRef(() => ReservationModule), RedisModule ],
  controllers: [ConcertController],
  providers: [
    ConcertUsecase, 
    { provide: AbstractConcertRepository, useClass: ConcertRepository },
    { provide: AbstractConcertPlanRepository, useClass: ConcertPlanRepository },
    { provide: AbstractConcertTicketRepository, useClass: ConcertTicketRepository },
    { provide: AbstractConcertService, useClass: ConcertService },
  ],
  exports: [AbstractConcertService],
})
export class ConcertModule {}
