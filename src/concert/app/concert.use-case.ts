import { Injectable } from '@nestjs/common';
import { ConcertGetResponseDto as ResGetDto } from "../pres/dto";
import { AbstractReservationService } from '../../reservation/domain/service.interfaces';
import { ConcertRequestCommand } from './commands'; 
import { ConcertRequestModel } from '../domain/models';
import { ReservationRequestModel } from '../../reservation/domain/models';
import { AbstractConcertService } from '../domain/service.interfaces';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ConcertUsecase {

    constructor(
        private readonly concertService: AbstractConcertService,
        private readonly reservationService: AbstractReservationService,
        private readonly dataSource: DataSource,
    ) {}

    //콘서트 예약가능일 조회
    async dates(command: ConcertRequestCommand): Promise<ResGetDto> {
        return ResGetDto.of(await this.concertService.dates(ConcertRequestModel.of(command)));
    }

    //콘서트 예약가능좌석 조회
    async seats(command: ConcertRequestCommand): Promise<ResGetDto> {
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            //콘서트 일정 검증
            const planInfo = await this.concertService.planInfo(ConcertRequestModel.of(command), manager);

            //콘서트 일정의 예약 가능한 자리 조회
            const reservationRequestModel = new ReservationRequestModel({mainCategory: 1, subCategory: planInfo.id});
            
            const seats = (await this.reservationService.reservedItems(reservationRequestModel, manager)).minorCategories;
            const concertModel = ConcertRequestModel.of(planInfo);
            concertModel.updateSeats(seats);
            const availableSeats = await this.concertService.availableSeats(concertModel);
            
            return ResGetDto.of(availableSeats);
        });
    }
}
