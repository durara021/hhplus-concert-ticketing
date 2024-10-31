import { Injectable } from '@nestjs/common';
import { ReservationPostResponseDto as ResPostDto } from "../pres/dto";
import { AbstractReservationService } from '../domain/service.interfaces/reservation.service.interface';
import { ReservationRequestCommand } from './commands';
import { ReservationRequestModel } from '../domain/models';

@Injectable()
export class ReservationUsecase {

    constructor(
        private readonly reservationService: AbstractReservationService,
    ) {}

    //임시 예약
    async reserve(command: ReservationRequestCommand): Promise<ResPostDto> {
        //임시 예약
        const reserveResult = await this.reservationService.reserve(ReservationRequestModel.of(command));

        return ResPostDto.of(reserveResult);
    }
}
