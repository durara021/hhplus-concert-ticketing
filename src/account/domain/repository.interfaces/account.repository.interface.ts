import { Injectable } from "@nestjs/common";
import { AccountEntity } from "../../infra/entities";
import { AccountResponseModel } from "../models";
import { EntityManager } from "typeorm";

interface AccountRepositoryInterface{
    update(accountEntity: AccountEntity, manager: EntityManager): Promise<number>
    account(accountEntity: AccountEntity, manager: EntityManager): Promise<AccountResponseModel>
}

@Injectable()
export abstract class AbstractAccountRepository implements AccountRepositoryInterface{
    abstract update(accountEntity: AccountEntity, manager: EntityManager): Promise<number>
    abstract account(accountEntity: AccountEntity, manager: EntityManager): Promise<AccountResponseModel>
}