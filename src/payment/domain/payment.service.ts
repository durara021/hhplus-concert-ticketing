import { Injectable } from '@nestjs/common';
import { PaymentEntity, OutBoxEntity } from '../infra/entities';
import { AbstractPaymentRepository } from './repository.interfaces';
import { AbstractPaymentService } from './service.interfaces';
import { PaymentRequestModel } from './models';
import { PaymentResponseCommand } from '../app/commands';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PaymentService implements AbstractPaymentService{
  
  constructor(
    private readonly paymentRepository: AbstractPaymentRepository,
    private readonly dataSource: DataSource,

  ) {}

  async save(model: PaymentRequestModel, manager?:EntityManager): Promise<PaymentResponseCommand>{

    const executeRecord = async (manager: EntityManager): Promise<PaymentResponseCommand> => {

      //결재이력 기록
      const recordResult = PaymentResponseCommand.of(await this.paymentRepository.saveRecord(PaymentEntity.of(model), manager));

      // 아웃박스 기록
      await this.paymentRepository.saveOutBox(OutBoxEntity.of({
        topic: 'payment.success',
        payload: JSON.stringify(model),
        eventId: model.reservationId,
        status: 'send',
        worker: 'payment',
      }), manager);

      return recordResult;
    }

    const result = manager ? executeRecord(manager) : this.dataSource.transaction(executeRecord);

    return result;
    
  }

}
