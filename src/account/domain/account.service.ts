import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AccountEntity, AccountHistoryEntity, InBoxEntity } from '../infra/entities';
import { AbstractAccountRepository, AbstractAccountHistoryRepository } from './repository.interfaces';
import { AbstractAccountService } from './service.interfaces/account.service.interface';
import { AccountRequestModel } from './models';
import { AccountResponseCommand } from '../app/commands/account.response.command';
import { OutBoxEntity } from '../infra/entities/outbox.entity';
import { ClientKafka } from '@nestjs/microservices';
import { AbstractAccountEventRepository } from './repository.interfaces/account.event.repository.interface';

@Injectable()
export class AccountService implements AbstractAccountService{
  
  constructor(
    private readonly accountRepository: AbstractAccountRepository,
    private readonly accountHistoryRepository: AbstractAccountHistoryRepository,
    private readonly accountEventRepository: AbstractAccountEventRepository,
    private readonly dataSource: DataSource,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async point(accountModel: AccountRequestModel): Promise<AccountResponseCommand> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const currentAccount = await this.accountRepository.account(AccountEntity.of(accountModel), manager);
      if(!currentAccount) throw new NotFoundException("계좌 정보를 찾을 수 없습니다.");
      return AccountResponseCommand.of(currentAccount);
    });
  }

  //포인트 충전/사용
  async updateBalance(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand> {
    const executeUpdate = async (manager: EntityManager): Promise<AccountResponseCommand> => {
      //현재 계좌 조회
      const currentAccount = await this.accountRepository.account(AccountEntity.of(accountModel), manager);
      if(!currentAccount) throw new NotFoundException("계좌 정보를 찾을 수 없습니다.");

      if(accountModel.stat === 'use' && currentAccount.balance < accountModel.amount) throw new Error('사용 가능한 포인트가 부족합니다.');
      if(accountModel.stat === 'charge') {
        accountModel.updateBalance(accountModel.amount + currentAccount.balance);
      } else {
        const MAX_RETRIES = 3; // 최대 재시도 횟수
        let retryCount = 0; // 현재 재시도 횟수
        while (retryCount < MAX_RETRIES) {
          try {
            const outBoxEntity: OutBoxEntity = OutBoxEntity.of({
              payload: JSON.stringify(accountModel)
            });
            await this.accountEventRepository.saveOutBox(outBoxEntity, manager);
            accountModel.updateBalance(currentAccount.balance - accountModel.amount);
            const inboxEntity: InBoxEntity = InBoxEntity.of(outBoxEntity);
            inboxEntity.updatePayload(JSON.stringify(accountModel));
            inboxEntity.updateStatus('processed');
            await this.accountEventRepository.saveInBox(inboxEntity, manager);
          } catch(error) {
            retryCount++;
            console.error(
              `Retry attempt ${retryCount}/${MAX_RETRIES} failed. Error: ${error}`
            );
            if (retryCount === MAX_RETRIES) {
                      // 이벤트 발행
              this.kafkaClient.emit(
                'payment.fail',
                {
                    eventId: accountModel.eventId,
                    userId : accountModel.userId,
                },
              );
            }
            await this.delay(1000); // 재시도 전에 1초 대기 (필요 시 조정 가능)
          }
        }
      }
      
      //포인트 업데이트
      const updateResult = await this.accountRepository.update(AccountEntity.of(accountModel), manager);
      
      //이력 추가
      if(!updateResult) throw new ConflictException();
      await this.accountHistoryRepository.record(AccountHistoryEntity.of(accountModel), manager);
      
      
      return AccountResponseCommand.of(accountModel);
    }
    return manager ? executeUpdate(manager) : this.dataSource.transaction(executeUpdate);
  }


  // 이력 및 현재 금액 조회
  async rollBack(accountModel: AccountRequestModel, manager?:EntityManager): Promise<void> {
    const MAX_RETRIES = 3; // 최대 재시도 횟수
    let retryCount = 0; // 현재 재시도 횟수
    while (retryCount < MAX_RETRIES) {
      try {
        const eventResult = await this.accountEventRepository.outBoxfindById(OutBoxEntity.of({id: accountModel.eventId}), manager);
        if(!eventResult) throw new Error('아직 처리되지 않은것으로 예상됨..');

        const rollBackInfo = await this.accountEventRepository.inBoxfindById(InBoxEntity.of({id: accountModel.eventId}), manager);
        const payload = JSON.parse(rollBackInfo.payload);
        this.updateBalance(AccountRequestModel.of({
          userId: parseInt(payload.userId),
          amount: parseInt(payload.amount),
          stat: 'charge'
        }));
      } catch (error) {
        retryCount++;
        console.error(
          `Retry attempt ${retryCount}/${MAX_RETRIES} failed. Error: ${error}`
        );
        if (retryCount === MAX_RETRIES) {
                  // 이벤트 발행
          this.kafkaClient.emit(
            'payment.fail',
            {
                eventId: accountModel.eventId,
                userId : accountModel.userId,
            },
          );
        }
        await this.delay(1000); // 재시도 전에 1초 대기 (필요 시 조정 가능)
      }
    }
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

  // 간단한 delay 함수 추가
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}

