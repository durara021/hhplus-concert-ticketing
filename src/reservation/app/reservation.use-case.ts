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

    //임시 예약
    async book(command: ReservationRequestCommand): Promise<void> {
        //임시 예약
        await this.reservationService.book(ReservationRequestModel.of(command));
    }

    //임시 예약
    async rollBack(command: ReservationRequestCommand): Promise<void> {
        //임시 예약
        await this.reservationService.rollBack(ReservationRequestModel.of(command));
    }

}
