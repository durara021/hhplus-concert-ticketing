import { Injectable, NotFoundException } from '@nestjs/common';
import { ConcertEntity, ConcertPlanEntity, ConcertPlanRequestEntity, ConcertTicketRequestEntity } from '../infra/entities';
import {
  AbstractConcertRepository, AbstractConcertPlanRepository, AbstractConcertTicketRepository,
  AbstractConcertCasheRepository, AbstractConcertPlanCasheRepository, AbstractConcertTicketCasheRepository
} from './repository.interfaces';
import { AbstractConcertService } from './service.interfaces';
import { ConcertPlanResponseModel, ConcertRequestModel, ConcertResponseModel, ConcertTicketModel } from './models';
import { DataSource, EntityManager } from 'typeorm';
import { ConcertResponseCommand } from '../app/commands';

@Injectable()
export class ConcertService implements AbstractConcertService{

  constructor(
    private readonly concertRepository: AbstractConcertRepository,
    private readonly concertPlanRepository: AbstractConcertPlanRepository,
    private readonly concertTicketRepository: AbstractConcertTicketRepository,
    private readonly concertCasheRepository: AbstractConcertCasheRepository,
    private readonly concertPlanCasheRepository: AbstractConcertPlanCasheRepository,
    private readonly concertTicketCasheRepository: AbstractConcertTicketCasheRepository,
    private readonly dataSource: DataSource,
  ) {}
 
  // 콘서트 예약 가능일 조회
  async reservableDates(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand[]> {
    const executeDates = async (manager: EntityManager): Promise<ConcertResponseCommand[]> => {

      let concerts: ConcertResponseModel[], concertPlans: ConcertPlanResponseModel[], concertTickets: ConcertTicketModel[];
      if(model.concertId) {
        const concertModel = ConcertEntity.of(model);

        // 캐쉬에서 검색
        const concertCasheInfo = await this.concertCasheRepository.info(concertModel);
        if(concertCasheInfo) {
          concerts.push(concertCasheInfo);
        } else {
          // 캐쉬에 데이터가 없는 경우
          const concertInfos = await this.concertRepository.infos(manager);
          if(!concertInfos) {
            throw new NotFoundException("콘서트 정보를 조회할 수 없습니다.");
          } else {
            await this.concertCasheRepository.saveInfos(ConcertEntity.of(concertInfos));
            concerts.push(concertInfos.find(info => info.concertId === model.concertId));
          }
        }

        const concertPlanModel = ConcertPlanRequestEntity.of(model);
        const concertPlanCasheInfo = await this.concertPlanCasheRepository.planInfo(concertPlanModel);
        if(concertPlanCasheInfo) {
          concertPlans.push(concertPlanCasheInfo);
        } else {
          const concertPlanInfos = await this.concertPlanRepository.planInfos(manager);
          if(!concertPlanInfos) {
            throw new NotFoundException("콘서트 정보를 조회할 수 없습니다.");
          } else {
            await this.concertPlanCasheRepository.savePlanInfos(ConcertPlanEntity.of(concertPlanInfos));
            concertPlans.push(concertPlanInfos.find(planInfo => planInfo.concertId === model.concertId));
          }
        }

      } else {
        [ concerts, concertPlans, ] = await Promise.all([
          this.concertCasheRepository.infos(),
          this.concertPlanCasheRepository.planInfos(),
        ]);
        if(!concerts.length) {
          const concertInfos = await this.concertRepository.infos(manager);
          concerts = concertInfos;
          this.concertCasheRepository.saveInfos(ConcertEntity.of(concertInfos));
        }
        if(!concertPlans.length) {
          const concertPlanInfos = await this.concertPlanRepository.planInfos(manager);
          concertPlans = concertPlanInfos;
          this.concertPlanCasheRepository.savePlanInfos(ConcertPlanEntity.of(concertPlanInfos));
        }
      }

      concertPlans.forEach(concertPlan =>{
        concertPlan.updateIsReservatable(
          concertTickets
            .filter(concertTicket => concertTicket.concertPlanId === concertPlan.concertId && concertTicket.status === 'available')
            .length ? true : false
        )
      });
      
      concerts.forEach(concert => {
        concert.updateReservableDates(
          concertPlans
            .filter(concertPlan => concertPlan.concertId === concert.concertId && concertPlan.isReservatable)
            .map(concertPlan => ({ date: concertPlan.concertDate, isReservable: concertPlan.isReservatable }))
        )
      });

      return ConcertResponseCommand.of(concerts);
    }
    return manager ? executeDates(manager) : this.dataSource.transaction(executeDates);
  }
  
  // 콘서트 예약 가능 티켓 조회
  async reservableSeats(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand> {
    const executeDates = async (manager: EntityManager): Promise<ConcertResponseCommand> => {

      let concertInfo = await this.concertCasheRepository.info(ConcertEntity.of(model));
      if(!concertInfo) {
        const concertInfos = await this.concertRepository.infos(manager);
        await this.concertCasheRepository.saveInfos(ConcertEntity.of(concertInfos));
        concertInfo = concertInfos.find(info => info.concertId === model.concertId);
        if(!concertInfo) throw new NotFoundException("콘서트 정보를 조회할 수 없습니다.");
      }
      
      let concertPlan = await this.concertPlanCasheRepository.planInfo(ConcertEntity.of(model));
      if(!concertPlan) {
        const concertPlanInfos = await this.concertPlanRepository.planInfos(manager);
        await this.concertPlanCasheRepository.savePlanInfos(ConcertPlanEntity.of(concertPlanInfos));
        concertPlan = concertPlanInfos.find(planInfo => planInfo.concertPlanId === model.concertPlanId);
        if(!concertPlan) throw new NotFoundException("콘서트 일정 정보를 조회할 수 없습니다.");
      }

      const concertTickets = await this.concertTicketRepository.ticketInfos(manager, ConcertTicketRequestEntity.of(model));

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
