import { EntityManager } from "typeorm";
import { PaymentEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { AbstractPaymentRepository } from "../../domain/repository.interfaces";
import { PaymentResponseModel } from "../../domain/models";

@Injectable()
export class PaymentRepository implements AbstractPaymentRepository {
  
  async record(paymentEntity: PaymentEntity, manager: EntityManager): Promise<PaymentResponseModel> {
    return PaymentResponseModel.of(await manager.save(paymentEntity));
  }
  
}
