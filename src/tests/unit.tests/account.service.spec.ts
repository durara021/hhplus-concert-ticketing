import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../../account/domain/account.service';
import { DataSource, EntityManager } from 'typeorm';
import { AbstractAccountRepository, AbstractAccountHistoryRepository } from '../../account/domain/repository.interfaces';
import { AccountRequestModel, AccountResponseModel } from '../../account/domain/models';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: AbstractAccountRepository;
  let accountHistoryRepository: AbstractAccountHistoryRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AbstractAccountRepository,
          useValue: {
            point: async () => null,  // point 메서드가 null을 반환하도록 설정
            update: async () => { throw new Error('잔액 업데이트 실패'); },
          },
        },
        {
          provide: AbstractAccountHistoryRepository,
          useValue: {
            record: async () => { throw new ConflictException('이력 기록 실패'); },
            history: async () => null,
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: async (cb: (manager: EntityManager) => Promise<any>) => cb({} as EntityManager),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get<AbstractAccountRepository>(AbstractAccountRepository);
    accountHistoryRepository = module.get<AbstractAccountHistoryRepository>(AbstractAccountHistoryRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('point 실패 케이스', () => {
    it('계좌 정보가 없을 때 NotFoundException을 던져야 합니다.', async () => {
      const accountModel = new AccountRequestModel({userId:1});

      await expect(service.point(accountModel)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBalance 실패 케이스', () => {
    it('잔액이 부족할 때 에러를 던져야 합니다.', async () => {
      const accountModel = new AccountRequestModel({amount:100, status:'use'});

      const currentAccount = new AccountResponseModel({ balance: 50 });  // 잔액이 부족한 상황 설정
      accountRepository.point = async () => currentAccount;  // 모킹하여 잔액이 낮은 상태로 설정

      await expect(service.updateBalance(accountModel)).rejects.toThrow('사용 가능한 포인트가 부족합니다.');
    });

    it('잔액 업데이트가 실패하면 에러를 던져야 합니다.', async () => {
      const accountModel = new AccountRequestModel({amount:100, status: 'charge'});

      accountRepository.point = async () => new AccountResponseModel({ balance: 50 });  // 정상 잔액 조회 설정

      await expect(service.updateBalance(accountModel)).rejects.toThrow('잔액 업데이트 실패');
    });

    it('이력 기록이 실패하면 ConflictException을 던져야 합니다.', async () => {
      const accountModel = new AccountRequestModel({amount:100, status:'charge'});

      accountRepository.point = async () => new AccountResponseModel({ balance: 50 });  // 정상 잔액 조회 설정
      accountRepository.update = async () => new AccountResponseModel({ balance: 150 });  // 정상 업데이트 설정

      await expect(service.updateBalance(accountModel)).rejects.toThrow(ConflictException);
    });
  });

  describe('history 실패 케이스', () => {
    it('이력이 존재하지 않을 때 NotFoundException을 던져야 합니다.', async () => {
      const accountModel = new AccountRequestModel({});

      await expect(service.history(accountModel)).rejects.toThrow(NotFoundException);
    });
  });
});