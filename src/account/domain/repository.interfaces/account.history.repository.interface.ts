import { Injectable } from "@nestjs/common";
import { AccountHistoryEntity } from "../../infra/entities";
import { AccountResponseModel } from "../models";
import { EntityManager } from "typeorm";

interface AccountRepositoryHistoryInterface{
    save(accountHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel>;
    findBy(accountHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel[]>;
}

@Injectable()
export abstract class AbstractAccountHistoryRepository implements AccountRepositoryHistoryInterface{
    abstract save(accountHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel>;
    abstract findBy(accountHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel[]>;
}