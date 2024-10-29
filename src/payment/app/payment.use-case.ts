import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { AbstractPaymentService } from '../domain/payemnt.service.interfaces';
import { PaymentPostResponseDto as ResPostDto } from '../pres/dto';
import { AbstractAccountService } from "../../account/domain/service.interfaces";
import { AbstractQueueService } from "../../queue/domain/service.interfaces";
import { AbstractReservationService } from "../../reservation/domain/service.interfaces";
import { PaymentRequestCommand } from "./commands";
import { AccountRequestModel } from '../../account/domain/models';
import { PaymentRequestModel } from '../../payment/domain/models';
import { ReservationRequestModel } from '../../reservation/domain/models';
import { QueueRequestModel } from '../../queue/domain/models';

@Injectable()
export class PaymentUsecase {

    constructor(
        private readonly paymentService: AbstractPaymentService,
        private readonly accountService: AbstractAccountService,
        private readonly reservationService: AbstractReservationService,
        private readonly queueService: AbstractQueueService,
        private readonly dataSource: DataSource,
    ) {}

    async pay(command: PaymentRequestCommand): Promise<ResPostDto>{
        //예약 확정
        await this.dataSource.transaction(async (manager: EntityManager) => {
            const reservationReqModel = ReservationRequestModel.of(command);
            reservationReqModel.updateStatus('confirmed');
            await this.reservationService.reserve(reservationReqModel, manager);
        });

        //계좌 point 차감
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            //계좌 point 차감
            await this.accountService.updateBalance(AccountRequestModel.of({userId: command.userId, amount: command.amount, status:'use'}), manager);

            //결제 이력 기록
            const recordResult = await this.paymentService.record(PaymentRequestModel.of(command), manager);
            await this.queueService.updateStatus(QueueRequestModel.of(command), manager);
            
            return ResPostDto.of(recordResult);
        });
        
    }
}
