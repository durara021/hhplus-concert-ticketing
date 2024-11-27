import { Injectable } from "@nestjs/common";
import { AccountEntity, InBoxEntity } from "../../infra/entities";
import { AccountResponseModel } from "../models";
import { EntityManager } from "typeorm";
import { OutBoxEntity } from "../../infra/entities/outbox.entity";

interface AccountRepositoryInterface{
    saveOutBox(outboxEntity: OutBoxEntity, manager: EntityManager): Promise<void>
    saveInBox(outboxEntity: InBoxEntity, manager: EntityManager): Promise<void>
    update(accountEntity: AccountEntity, manager: EntityManager): Promise<number>
    findById(accountEntity: AccountEntity, manager: EntityManager): Promise<AccountResponseModel>
    updateOutBox(outboxEntity: OutBoxEntity, manager: EntityManager): Promise<void>
}

@Injectable()
export abstract class AbstractAccountRepository implements AccountRepositoryInterface{
    abstract saveOutBox(outboxEntity: OutBoxEntity, manager: EntityManager): Promise<void>
    abstract saveInBox(outboxEntity: InBoxEntity, manager: EntityManager): Promise<void>
    abstract update(accountEntity: AccountEntity, manager: EntityManager): Promise<number>
    abstract findById(accountEntity: AccountEntity, manager: EntityManager): Promise<AccountResponseModel>
    abstract updateOutBox(outboxEntity: OutBoxEntity, manager: EntityManager): Promise<void>
}