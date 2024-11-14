import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ReservationRequestEntity, ReservationEntity } from '../infra/entities';
import { AbstractReservationRepository } from './repository.interfaces';
import { AbstractReservationService } from './service.interfaces/reservation.service.interface';
import { ReservationRequestModel } from './models';
import { ReservationResponseCommand } from '../app/commands';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ReservationService implements AbstractReservationService{

  constructor(
    private readonly reservationRepository: AbstractReservationRepository,
    private readonly dataSource: DataSource,
  ) {}

  
  async reserve(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeReserve = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
        //예약 확인
        model.updateStatus('available');
        const item = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
        
        if(!item) throw new NotFoundException("이미 예약된 아이템입니다.");
        
        //임시 예약
        model.updateStatus('temp');
        model.updateVersion(item.version);
        await this.reservationRepository.reserve(ReservationEntity.of(model), manager)

        return ReservationResponseCommand.of(item);
    }
    return manager ? executeReserve(manager) : this.dataSource.transaction(executeReserve);
  }

  //예약 조회
  async reservation(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeReservation = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
      const result = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
      if(!result) throw new NotFoundException('예약된 아이템이 존재하지 않습니다.');
      return ReservationResponseCommand.of(result);
    }
    return manager ? executeReservation(manager) : this.dataSource.transaction(executeReservation);
  }
  
  //상태 확정
  async book(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeUpdateStatus = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
      //예약 확인
      model.updateStatus('temp');
      const item = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
      
      if(!item) throw new NotFoundException("예약된 아이템이 없습니다..");

      model.updateVersion(item.version);
      model.updateStatus('confimed');
      const updateResult = await this.reservationRepository.updateStatus(ReservationEntity.of(model), manager);
      if(updateResult < 1 ) throw new InternalServerErrorException("이미 예약 완료된 아이템입니다.");
      return ReservationResponseCommand.of(item);
    }
    return manager ? executeUpdateStatus(manager) : this.dataSource.transaction(executeUpdateStatus);
  }
  
  //예약된 아이템 조회
  async reservedItems(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeReservedItems = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
      // 예약된 좌석 조회
      const results = await this.reservationRepository.reservedItems(ReservationRequestEntity.of(model), manager);

      model.updateMinorCategories(results.map(result => result.minorCategory));
      return ReservationResponseCommand.of(model);
    }
    return manager ? executeReservedItems(manager) : this.dataSource.transaction(executeReservedItems);
  }
  
}
