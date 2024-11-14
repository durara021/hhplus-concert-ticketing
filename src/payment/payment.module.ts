import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './pres/payment.controller';
import { PaymentUsecase } from './app/payment.use-case';
import { AbstractPaymentService } from './domain/service.interfaces';
import { PaymentService } from './domain/payment.service';
import { PaymentEntity } from './infra/entities';
import { AbstractPaymentRepository } from './domain/repository.interfaces';
import { PaymentRepository } from './infra/payment.repositories/payment.repository';
import { ReservationModule } from '../reservation/reservation.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [ TypeOrmModule.forFeature([PaymentEntity]), ReservationModule, AccountModule ],
  controllers: [PaymentController],
  providers: [
    PaymentUsecase, 
    { provide: AbstractPaymentService, useClass: PaymentService },
    { provide: AbstractPaymentRepository, useClass: PaymentRepository }
  ],
  exports: [AbstractPaymentService]
})
export class PaymentModule {}
