import { Injectable } from "@nestjs/common";
import { PaymentEntity } from "../../infra/entities/payment.entity"; 
import { PaymentResponseModel } from "../../domain/models";
import { EntityManager } from "typeorm";
interface PaymentRepositoryInterface{
    record(paymentEntity: PaymentEntity, manager?:EntityManager): Promise<PaymentResponseModel>
}

@Injectable()
export abstract class AbstractPaymentRepository implements PaymentRepositoryInterface{
    abstract record(paymentEntity: PaymentEntity, manager?:EntityManager): Promise<PaymentResponseModel>
}