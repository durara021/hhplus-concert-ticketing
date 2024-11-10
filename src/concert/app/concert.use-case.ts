import { Injectable } from '@nestjs/common';
import { ConcertGetResponseDto } from "../pres/dto";
import { ConcertRequestCommand } from './commands'; 
import { ConcertRequestModel } from '../domain/models';
import { AbstractConcertService } from '../domain/service.interfaces';

@Injectable()
export class ConcertUsecase {

    constructor(
        private readonly concertService: AbstractConcertService,
    ) {}

    //콘서트 예약가능일 조회
    async reservableDates(command: ConcertRequestCommand): Promise<ConcertGetResponseDto[]> {
        const model = ConcertRequestModel.of(command);
        const concertInfos = await this.concertService.reservableDates(model);
        return ConcertGetResponseDto.of(concertInfos);
    }

    //콘서트 예약가능좌석 조회
    async seats(command: ConcertRequestCommand): Promise<ConcertGetResponseDto> {
        //콘서트/콘서트 일정 일정 검증
        return ConcertGetResponseDto.of(await this.concertService.reservableSeats(ConcertRequestModel.of(command)));
    }
}
