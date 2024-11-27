import { Injectable } from "@nestjs/common";
import { PaymentEntity } from "../../infra/entities/payment.entity"; 
import { PaymentResponseModel } from "../../domain/models";
import { EntityManager } from "typeorm";
import { OutBoxEntity } from "../../infra/entities";

interface PaymentRepositoryInterface{
    saveRecord(paymentEntity: PaymentEntity, manager?:EntityManager): Promise<PaymentResponseModel>
    saveOutBox(outBoxEntity: OutBoxEntity, manager?:EntityManager): Promise<void>
}

@Injectable()
export abstract class AbstractPaymentRepository implements PaymentRepositoryInterface{
    abstract saveRecord(paymentEntity: PaymentEntity, manager?:EntityManager): Promise<PaymentResponseModel>
    abstract saveOutBox(outBoxEntity: OutBoxEntity, manager?:EntityManager): Promise<void>
}