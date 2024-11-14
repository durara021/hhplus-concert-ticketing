import { Injectable } from '@nestjs/common';
import { ConcertEntity, ConcertTicketRequestEntity } from '../infra/entities';
import {
  AbstractConcertRepository, AbstractConcertPlanRepository, AbstractConcertTicketRepository,
} from './repository.interfaces';
import { AbstractConcertService } from './service.interfaces';
import { ConcertRequestModel,  } from './models';
import { DataSource, EntityManager } from 'typeorm';
import { ConcertResponseCommand } from '../app/commands';

@Injectable()
export class ConcertService implements AbstractConcertService{

  constructor(
    private readonly concertRepository: AbstractConcertRepository,
    private readonly concertPlanRepository: AbstractConcertPlanRepository,
    private readonly concertTicketRepository: AbstractConcertTicketRepository,
    private readonly dataSource: DataSource,
  ) {}
 
  // 콘서트 예약 가능일 조회
  async reservableDates(model:ConcertRequestModel): Promise<ConcertResponseCommand> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {

      const concertModel = ConcertEntity.of(model);

      // 콘서트 정보 조회
      const concertInfo = await this.concertRepository.findById(concertModel, manager);
      const concertPlanInfos = await this.concertPlanRepository.find(concertModel, manager);
      
      concertInfo.updateReservableDates(
        concertPlanInfos
          .filter(concertPlanInfo => concertPlanInfo.concertId === model.concertId)
          .map(concertPlan => ({ date: concertPlan.concertDate, isReservable: concertPlan.isReservatable }))
      );

      return ConcertResponseCommand.of(concertInfo);
    });
  }
  
  // 콘서트 예약 가능 티켓 조회
  async reservableSeats(model:ConcertRequestModel): Promise<ConcertResponseCommand> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {

      const concertEntity = ConcertEntity.of(model);
      // 콘서트 검증
      await this.concertRepository.findById(concertEntity);

      // 콘서트일정 조회
      const concertPlanInfo = await this.concertPlanRepository.findById(concertEntity);

      // 콘서트좌석 조회
      const concertTicketInfos = await this.concertTicketRepository.find(ConcertTicketRequestEntity.of(model), manager);

      concertPlanInfo.updateReservableTickets(
        concertTicketInfos
          .filter(concertTicketInfo => concertTicketInfo.concertPlanId === concertPlanInfo.concertPlanId)
          .map(concertTicket => ({ seat: concertTicket.concertSeatNum, isReservable: concertTicket.status === 'availabe' ? true : false }))
      );
      return ConcertResponseCommand.of(concertPlanInfo);
    });
  }

}
