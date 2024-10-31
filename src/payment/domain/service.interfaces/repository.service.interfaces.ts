import { Injectable } from "@nestjs/common";
import { PaymentEntity } from "../../infra/entities";
import { PaymentRequestModel } from "../models";
import { PaymentResponseCommand } from "../../app/commands";
import { EntityManager } from "typeorm";

interface PaymentServiceInterface{
    record(model: PaymentRequestModel, manager:EntityManager): Promise<PaymentResponseCommand>
}

@Injectable()
export abstract class AbstractPaymentService implements PaymentServiceInterface{
    abstract record(model: PaymentRequestModel, manager:EntityManager): Promise<PaymentResponseCommand>
}