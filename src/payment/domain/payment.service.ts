import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../infra/entities';
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

  async record(model: PaymentRequestModel, manager?:EntityManager): Promise<PaymentResponseCommand>{
    //결재이력 기록
    const executeRecord = async (manager: EntityManager): Promise<PaymentResponseCommand> => {
      return PaymentResponseCommand.of(await this.paymentRepository.record(PaymentEntity.of(model), manager));
    }
    return manager ? executeRecord(manager) : this.dataSource.transaction(executeRecord);
  }

}
