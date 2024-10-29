import { Test, TestingModule } from '@nestjs/testing';
import { AccountUsecase } from '../../account/app/account.use-case';
import { AbstractAccountService } from '../../account/domain/service.interfaces/account.service.interface';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { AccountPostResponseDto as ResPostDto } from '../../account/pres/dto';
import { AccountEntity, AccountHistoryEntity } from '../../account/infra/entities';
import { AccountModule } from '../../account/account.module';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractAccountRepository } from '../../account/domain/repository.interfaces';
import { AccountRepository } from '../../account/infra/repositories';
import { AccountService } from '../../account/domain/account.service';

describe('AccountUsecase - charge', () => {
  let accountUsecase: AccountUsecase;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  // AccountService 모킹 (jest를 사용하여 함수 모킹)
  const mockAccountService = {
    point: jest.fn(),   // 포인트 조회 모킹
    charge: jest.fn(),  // 포인트 충전 모킹
    update: jest.fn(),  // 업데이트 모킹
    record: jest.fn(),  // 기록 추가 모킹
  };

  // DataSource 모킹 (트랜잭션 처리 모킹)
  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AccountModule, 
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'qwe124!@$',
          database: 'concert_ticketing',
          entities: [ AccountEntity, AccountHistoryEntity ],
          synchronize: true,
          extra: {
            connectionLimit: 100,
          },
          //logging: true,
        }),
      ],
      providers: [
        AccountUsecase,
        { provide: AbstractAccountService, useClass: AccountService },
        { provide: AbstractAccountRepository, useClass: AccountRepository },
        { provide: DataSource, useValue: mockDataSource }, 
      ],
    }).compile();

    accountUsecase = module.get<AccountUsecase>(AccountUsecase);

    dataSource = module.get<DataSource>(getDataSourceToken());

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // QueryRunner 생성
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // 테스트 전 데이터 초기화
    //await queryRunner.query('DELETE FROM reservation');
  });
  
  afterAll(async () => {
    await queryRunner.release();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('포인트를 충전하고 ResPostDto를 반환해야 한다', async () => {
    const id = 100;
    const userId = 1;
    const amount = 100;

    // 모킹된 포인트 조회 및 업데이트 결과
    const mockPoint = { userId, balance: 500 };  // 초기 잔액
    const mockNewBalance = 600;                  // 충전 후 잔액
    const mockRecordResult: AccountHistoryEntity = {
      id,
      userId,
      amount,
      stat: 'charge',      // 상태: 충전
      regDate: new Date(), // 기록 일자
    };

    // accountService 및 dataSource 동작 모킹 (비동기 함수 처리)
    mockAccountService.point.mockResolvedValue(mockPoint); // 포인트 조회 모킹
    mockAccountService.charge.mockResolvedValue(mockNewBalance); // 충전 후 잔액 모킹
    mockAccountService.update.mockResolvedValue(undefined); // 잔액 업데이트 모킹
    mockAccountService.record.mockResolvedValue(mockRecordResult); // 기록 저장 모킹
    mockDataSource.transaction.mockImplementation(async (callback: any) => {
      return await callback();  // 트랜잭션 처리 모킹
    });

    // 기대되는 응답 DTO
    const expectedResponse = new ResPostDto({userId: mockRecordResult.userId, amount: mockRecordResult.amount, stat: mockRecordResult.stat, regDate: mockRecordResult.regDate});

    // 실제 charge 메서드 실행
    const result:ResPostDto = await accountUsecase.charge({ userId, amount });

    // 각 모킹된 메서드들이 호출되었는지 검증
    expect(mockAccountService.point).toHaveBeenCalledWith(expect.objectContaining({ userId }));
    expect(mockAccountService.charge).toHaveBeenCalledWith(expect.objectContaining({ balance: mockPoint.balance }));
    expect(mockAccountService.update).toHaveBeenCalledWith(expect.anything(), expect.any(EntityManager));
    expect(mockAccountService.record).toHaveBeenCalledWith(expect.anything(), expect.any(EntityManager));

    // 반환된 결과가 예상 응답과 동일한지 확인
    expect(result).toEqual(expectedResponse);
    
  });
});
