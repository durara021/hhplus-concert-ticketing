import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AccountEntity, AccountHistoryEntity } from '../infra/entities';
import { AbstractAccountRepository, AbstractAccountHistoryRepository } from './repository.interfaces';
import { AbstractAccountService } from './service.interfaces/account.service.interface';
import { AccountRequestModel } from './models';
import { AccountResponseCommand } from '../app/commands/account.response.command';

@Injectable()
export class AccountService implements AbstractAccountService{
  
  constructor(
    private readonly accountRepository: AbstractAccountRepository,
    private readonly accountHistoryRepository: AbstractAccountHistoryRepository,
    private readonly dataSource: DataSource,
  ) {}
  
  async point(accountModel: AccountRequestModel): Promise<AccountResponseCommand> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const currentAccount = await this.accountRepository.point(AccountEntity.of(accountModel), manager);
      if(!currentAccount) throw new NotFoundException("계좌 정보를 찾을 수 없습니다.");
      return AccountResponseCommand.of(currentAccount);
    });
  }

  //포인트 충전/사용
  async updateBalance(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand> {
    const executeUpdate = async (manager: EntityManager): Promise<AccountResponseCommand> => {
      //현재 계좌 조회
      const currentAccount = await this.accountRepository.point(AccountEntity.of(accountModel), manager);
      if(!currentAccount) throw new NotFoundException("계좌 정보를 찾을 수 없습니다.");

      if(accountModel.status === 'use' && currentAccount.balance < accountModel.amount) throw new Error('사용 가능한 포인트가 부족합니다.');
      if(accountModel.status === 'charge') {
        accountModel.updateBalance(accountModel.amount + currentAccount.balance);
      } else {
        accountModel.updateBalance(currentAccount.balance - accountModel.amount);
      }
      
      //포인트 업데이트
      const updateResult = await this.accountRepository.update(AccountEntity.of(accountModel), manager);
      
      //이력 추가
      await this.accountHistoryRepository.record(AccountHistoryEntity.of(accountModel), manager);
      
      return AccountResponseCommand.of(updateResult);
    }
    return manager ? executeUpdate(manager) : this.dataSource.transaction(executeUpdate);
  }

  // 이력 및 현재 금액 조회
  async history(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand[]> {
    const executehistory = async (manager: EntityManager): Promise<AccountResponseCommand[]> => {
      const historyResult = await this.accountHistoryRepository.history(AccountHistoryEntity.of(accountModel), manager);
      if(!historyResult) throw new NotFoundException("계좌이력이 없습니다.");

      return AccountResponseCommand.of(historyResult);
    }
    return manager ? executehistory(manager) : this.dataSource.transaction(executehistory);
  }

}
