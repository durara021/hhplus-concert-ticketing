import { Injectable } from '@nestjs/common';
import { ConcertGetResponseDto } from "../pres/dto";
import { ConcertPlanGetResponseDto } from '../pres/dto/concertPlan/concertPlan.get.response.dto';
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
        private readonly dataSource: DataSource,
    ) {}

    //콘서트 예약가능일 조회
    async reservableDates(command: ConcertRequestCommand): Promise<ConcertGetResponseDto[]> {
        const model = ConcertRequestModel.of(command);
        const concertInfos = this.concertService.
        return ConcertGetResponseDto.of(concertInfos);
    }

    //콘서트 예약가능좌석 조회
    async seats(command: ConcertRequestCommand): Promise<ConcertGetResponseDto> {
        //콘서트/콘서트 일정 일정 검증
        return ConcertGetResponseDto.of(await this.concertService.availableSeats(ConcertRequestModel.of(command)));
    }
}
