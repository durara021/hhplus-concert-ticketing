import { Injectable, NotFoundException } from '@nestjs/common';
import { ConcertEntity, ConcertPlanEntity } from '../infra/entities';
import { AbstractConcertRepository, AbstractConcertPlanRepository } from './repository.interfaces';
import { AbstractConcertService } from './service.interfaces';
import { ConcertRequestModel, ConcertResponseModel } from './models';
import { ConcertResponseCommand } from '../app/commands';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ConcertService implements AbstractConcertService{

  constructor(
    private readonly concertRepository: AbstractConcertRepository,
    private readonly concertPlanRepository: AbstractConcertPlanRepository,
    private readonly dataSource: DataSource,
  ) {}

  // 콘서트 정보 조회
  async dates(model: ConcertRequestModel, manager?:EntityManager): Promise<ConcertResponseCommand> {
    const executeDates = async (manager: EntityManager): Promise<ConcertResponseCommand> => {
      //콘서트 정보 조회
      const concertInfo = await this.concertRepository.info(ConcertEntity.of(model), manager);
      if (!concertInfo) {
        throw new NotFoundException('콘서트 정보가 조회되지 않습니다.');
      }

      // 콘서트 계획 정보 조회
      const concertPlans = await this.concertPlanRepository.planInfos(ConcertPlanEntity.of(model), manager);
      if (!concertPlans || concertPlans.length === 0) {
        throw new NotFoundException('콘서트 일정을 찾을 수 없습니다.');
      }

      const responseModel = ConcertResponseModel.of(model);
      responseModel.updateConcertDates(concertPlans.filter(concertPlan=> concertPlan.capacity > concertPlan.current).map(concertPlan=>concertPlan.concertDate));
      return ConcertResponseCommand.of(concertInfo);
    }
    return manager ? executeDates(manager) : this.dataSource.transaction(executeDates);
  }

  // 예약 가능한 좌석 조회
  async availableSeats(model: ConcertRequestModel): Promise<ConcertResponseCommand> {
    
    const allItems = Array.from({ length: model.capacity }, (_, i) => i + 1);
    const availableItems = allItems.filter(item => !model.concertSeats.includes(item));
    model.updateSeats(availableItems);

    return ConcertResponseCommand.of(model);
  }

  // 콘서트 일정 정보 조회(단일)
  async planInfo(model: ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand> {
    const executeplanInfo = async (manager: EntityManager): Promise<ConcertResponseCommand> => {
      // 콘서트 일정 정보 조회(단일)
      const planInfo = await this.concertPlanRepository.planInfo(ConcertPlanEntity.of(model), manager);
      if(!planInfo) throw new NotFoundException("해당 콘서트에 대한 일정이 존재하지 않습니다.");
      
      return ConcertResponseCommand.of(planInfo);
    }
    return manager ? executeplanInfo(manager) : this.dataSource.transaction(executeplanInfo);
  }
  
}
