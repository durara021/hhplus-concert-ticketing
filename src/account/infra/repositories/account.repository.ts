import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { AccountEntity } from "../entities/account.entity";
import { AbstractAccountRepository } from "../../domain/repository.interfaces";
import { AccountResponseModel } from "../../../account/domain/models";

@Injectable()
export class AccountRepository implements AbstractAccountRepository {

  async update(accountEntity: AccountEntity, manager: EntityManager): Promise<AccountResponseModel> {
    await manager.update(AccountEntity,
      {userId: accountEntity.userId},
      {balance: accountEntity.balance}
    );

    return AccountResponseModel.of(await manager.findOne(AccountEntity, {where: {userId: accountEntity.userId}}));
  }

  async point(accountEntity:AccountEntity, manager: EntityManager): Promise<AccountResponseModel> {
    return AccountResponseModel.of(await manager.findOne(AccountEntity, {where : {userId: accountEntity.userId}}));
  }
}
