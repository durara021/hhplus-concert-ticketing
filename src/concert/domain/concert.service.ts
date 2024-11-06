import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ConcertEntity, ConcertPlanRequestEntity, ConcertTicketEntity } from '../infra/entities';
import { AbstractConcertRepository, AbstractConcertPlanRepository, AbstractConcertTicketRepository } from './repository.interfaces';
import { AbstractConcertService } from './service.interfaces';
import { ConcertPlanResponseModel, ConcertRequestModel, ConcertResponseModel } from './models';
import { ConcertResponseCommand } from '../app/commands';
import { ConcertTicketModel } from './models/concertTicket/concertTicket.model';

@Injectable()
export class ConcertService implements AbstractConcertService{

  constructor(
    private readonly concertRepository: AbstractConcertRepository,
    private readonly concertPlanRepository: AbstractConcertPlanRepository,
    private readonly concertTicketRepository: AbstractConcertTicketRepository,
    private readonly dataSource: DataSource,
  ) {}
 
  // 콘서트 예약 가능일 조회
  async reservableDates(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand[]> {
    const executeDates = async (manager: EntityManager): Promise<ConcertResponseCommand[]> => {

      let concertInfos: ConcertResponseModel[], concertPlans: ConcertPlanResponseModel[], concertTickets: ConcertTicketModel[];
      if(model.concertId) {
        concertInfos.push(await this.concertRepository.info(manager, ConcertEntity.of(model)));
        if(!concertInfos.length) throw new NotFoundException("콘서트 정보를 조회할 수 없습니다.");

        concertPlans = await this.concertPlanRepository.planInfos(manager, ConcertPlanRequestEntity.of(model));
        if(!concertPlans.length) throw new NotFoundException("콘서트 일정을 조회할 수 없습니다.");

        model.updateConcertPlanIds(concertPlans.map(concertPlan => concertPlan.concertPlanId));
        concertTickets = await this.concertTicketRepository.ticketInfos(manager, ConcertTicketEntity.of(model));
        if(!concertTickets.length) throw new NotFoundException("콘서트 티켓을 조회할 수 없습니다.");

      } else {
        [ concertInfos, concertPlans, concertTickets ] = await Promise.all([
          this.concertRepository.infos(manager),
          this.concertPlanRepository.planInfos(manager),
          this.concertTicketRepository.ticketInfos(manager),
        ]);
      }


      concertPlans.forEach(concertPlan =>{
        concertPlan.updateIsReservatable(
          concertTickets
            .filter(concertTicket => concertTicket.concertPlanId === concertPlan.concertId && concertTicket.status === 'available')
            .length ? true : false
        )
      });
      
      concertInfos.forEach(concertInfo => {
        concertInfo.updateReservableDates(
          concertPlans
            .filter(concertPlan => concertPlan.concertId === concertInfo.concertId && concertPlan.isReservatable)
            .map(concertPlan => ({ date: concertPlan.concertDate, isReservable: concertPlan.isReservatable }))
        )
      });

      return ConcertResponseCommand.of(concertInfos);
    }
    return manager ? executeDates(manager) : this.dataSource.transaction(executeDates);
  }

  // 콘서트 정보 조회(단건)
  async reservableSeats(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand> {
    const executeDates = async (manager: EntityManager): Promise<ConcertResponseCommand> => {

      const concertInfo = await this.concertRepository.info(manager, ConcertEntity.of(model));
      if(!concertInfo) throw new NotFoundException("콘서트 정보를 조회할 수 없습니다.");

      const concertPlan = await this.concertPlanRepository.planInfo(manager, ConcertEntity.of(model));
      if(!concertPlan) throw new NotFoundException("콘서트 일정을 조회할 수 없습니다.");

      const concertTickets = await this.concertTicketRepository.ticketInfos(manager, ConcertTicketEntity.of(model));
      if(!concertTickets.length) throw new NotFoundException("콘서트 좌석을 조회할 수 없습니다.");


      concertPlan.updateReservableTickets(
        concertTickets
          .filter(concertTicket => concertTicket.concertPlanId === concertPlan.concertPlanId)
          .map(concertTicket => ({ seat: concertTicket.concertSeatNum, isReservable: concertTicket.status === 'availabe' ? true : false }))
      );
      return ConcertResponseCommand.of(concertPlan);
    }
    return manager ? executeDates(manager) : this.dataSource.transaction(executeDates);
  }

}
