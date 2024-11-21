import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { AbstractPaymentService } from '../domain/service.interfaces';
import { PaymentPostResponseDto as ResPostDto } from '../pres/dto';
//import { AbstractAccountService } from "../../account/domain/service.interfaces";
//import { AbstractReservationService } from "../../reservation/domain/service.interfaces";
import { PaymentRequestCommand } from "./commands";
//import { AccountRequestModel } from '../../account/domain/models';
//import { ReservationRequestModel } from '../../reservation/domain/models';
import { PaymentRequestModel } from "../domain/models";

@Injectable()
export class PaymentUsecase implements OnModuleInit {

    constructor(
        private readonly paymentService: AbstractPaymentService,
        //private readonly accountService: AbstractAccountService,
        //private readonly reservationService: AbstractReservationService,
        //private readonly kafkaClient: KafkaClient,
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka

    ) {}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async save(command: PaymentRequestCommand): Promise<ResPostDto>{
        //return await this.dataSource.transaction(async (manager: EntityManager) => {
        //결제 이력 기록
        const saveResult = await this.paymentService.save(PaymentRequestModel.of(command));

        // 이벤트 발행
        this.kafkaClient.emit(
            'payment.success',
            {
                eventId: command.reservationId,
                amount: command.amount,
                userId : command.userId,
            },
        );
  
            //예약 확정
            //const reservationReqModel = ReservationRequestModel.of({ id: command.reservationId, status: 'confirmed' });
            //const bookResult = await this.reservationService.book(reservationReqModel, manager);

            //계좌 point 차감
            //await this.accountService.updateBalance(AccountRequestModel.of({ userId: command.userId, amount: command.amount, stat:'use' }), manager);

        return ResPostDto.of(saveResult);
        //});
    }
}
