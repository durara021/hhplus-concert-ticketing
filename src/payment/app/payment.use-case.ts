import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataSource, EntityManager } from "typeorm";
import { AbstractPaymentService } from '../domain/service.interfaces';
import { PaymentPostResponseDto as ResPostDto } from '../pres/dto';
import { AbstractAccountService } from "../../account/domain/service.interfaces";
import { AbstractReservationService } from "../../reservation/domain/service.interfaces";
import { PaymentRequestCommand } from "./commands";
import { AccountRequestModel } from '../../account/domain/models';
import { ReservationRequestModel } from '../../reservation/domain/models';

@Injectable()
export class PaymentUsecase {

    constructor(
        private readonly paymentService: AbstractPaymentService,
        private readonly accountService: AbstractAccountService,
        private readonly reservationService: AbstractReservationService,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,        
    ) {}

    async pay(command: PaymentRequestCommand): Promise<ResPostDto>{
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            //예약 확정
            const reservationReqModel = ReservationRequestModel.of({ id: command.reservationId, status: 'confirmed' });
            const bookResult = await this.reservationService.book(reservationReqModel, manager);

            //계좌 point 차감
            await this.accountService.updateBalance(AccountRequestModel.of({ userId: command.userId, amount: command.amount, stat:'use' }), manager);

            // 이벤트 발행
            this.eventEmitter.emit(
                'user.created', reservationReqModel
            );

            return ResPostDto.of(bookResult);
        });
    }
}
