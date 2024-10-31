import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { AccountUsecase } from '../../account/app/account.use-case';
import { AbstractAccountService } from '../../account/domain/service.interfaces/account.service.interface';
import { AbstractAccountHistoryRepository, AbstractAccountRepository } from '../../account/domain/repository.interfaces';
import { AccountEntity, AccountHistoryEntity,  } from '../../account/infra/entities';
import { AccountModule } from '../../account/account.module';
import { AccountHistoryRepository, AccountRepository } from '../../account/infra/repositories';
import { AccountService } from '../../account/domain/account.service';
import { baseDBConfig } from '../../db.config';
import { AccountRequestCommand } from '../../account/app/commands';

describe('AccountUsecase', () => {
  let accountUsecase: AccountUsecase;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let repository: Repository<AccountEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AccountModule,
        TypeOrmModule.forRoot({
          ...baseDBConfig,
          entities: [AccountEntity, AccountHistoryEntity],
        }),
        TypeOrmModule.forFeature([AccountEntity, AccountHistoryEntity]),
      ],
      providers: [
        AccountUsecase,
        { provide: AbstractAccountService, useClass: AccountService },
        { provide: AbstractAccountRepository, useClass: AccountRepository },
        { provide: AbstractAccountHistoryRepository, useClass: AccountHistoryRepository },
      ],
    }).compile();

    accountUsecase = module.get<AccountUsecase>(AccountUsecase);
    dataSource = module.get<DataSource>(DataSource);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // QueryRunner 생성 및 연결
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    repository = queryRunner.manager.getRepository(AccountEntity);

    await queryRunner.query('TRUNCATE TABLE account');
    await queryRunner.query('TRUNCATE TABLE account_history');
  });

  afterAll(async () => {
    // QueryRunner 연결 해제
    await queryRunner.release();
    await dataSource.destroy();
  });

  it('포인트를 충전', async () => {
    // account테이블에 1번 user 추가
    await repository.save(AccountEntity.of({ userId: 1, balance: 0, }));

    const chargeTestPoint = AccountRequestCommand.of({ userId: 1, amount: 10 });

    let balance = 0;
    const promises = Array.from({ length: 100 }).map(async (_, index) => {
      console.time(`charge-promise-${index}`);
      const result = await accountUsecase.charge(chargeTestPoint);
      balance += result.amount;
      console.timeEnd(`charge-promise-${index}`);
    });
    console.time(`charge-promise-all`);
    await Promise.all(promises);
    console.timeEnd(`charge-promise-all`);

    expect(balance).toEqual((await accountUsecase.point(new AccountRequestCommand({userId: 1}))).balance);
  }, 10000);

});
