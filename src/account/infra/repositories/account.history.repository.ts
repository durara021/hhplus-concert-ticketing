import { EntityManager, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AbstractAccountHistoryRepository } from "../../domain/repository.interfaces";
import { AccountHistoryEntity } from "../entities";
import { AccountResponseModel } from "../../../account/domain/models";

@Injectable()

export class AccountHistoryRepository implements AbstractAccountHistoryRepository {

  async record(accoutHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel> {
    return AccountResponseModel.of(await manager.save(accoutHistoryEntity));
  }

  async history(accoutHistoryEntity: AccountHistoryEntity, manager: EntityManager): Promise<AccountResponseModel[]> {
    return AccountResponseModel.of(await manager.find(AccountHistoryEntity, {where: {userId: accoutHistoryEntity.userId}}));
  }
}
