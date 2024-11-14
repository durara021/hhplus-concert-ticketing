import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentResponseCommand } from '../../payment/app/commands';
import { AbstractAccountService } from 'src/account/domain/service.interfaces';
import { AccountRequestModel } from 'src/account/domain/models';

@Injectable()
export class EventListener {
    constructor(
        private readonly httpService: HttpService,
        private readonly accountService: AbstractAccountService,
    ) {}
    @OnEvent('seat.reserved')
    async handleSeatReserved(event: PaymentResponseCommand) {
        console.log(`SeatReservedEvent received: ${event.reservationId}`);

        // 외부 API 호출
        this.httpService.post('https://api.example.com/reservations', event);

        // 메시지 발행
        // await this.kafkaService.produce('seat-topic', event);

        // 이력 데이터 저장
        await this.accountService.history(AccountRequestModel.of(event));
  }
}
