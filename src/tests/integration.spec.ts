import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { ConcertModule } from '../concert/concert.module';
import { PaymentModule } from '../payment/payment.module';
import { QueueModule } from '../queue/queue.module';
import { ReservationModule } from '../reservation/reservation.module';
import { SessionModule } from '../session/session.module';
import { CommonModule } from '../common/common.module';
import { ReservationUsecase } from '../reservation/app/reservation.use-case';
import { AbstractReservationService } from '../reservation/domain/service.interfaces';
import { ReservationService } from '../reservation/domain/reservation.service';
import { DataSource, QueryRunner } from 'typeorm';
import { AbstractReservationRepository } from '../reservation/domain/repository.interfaces';
import { ReservationRepository } from '../reservation/infra/repositories/reservation.repository';
import { ReservationEntity } from '../reservation/infra/entities';
import { ConcertEntity, ConcertPlanEntity } from '../concert/infra/entities';
import { PaymentEntity } from '../payment/infra/entities';
import { AccountEntity, AccountHistoryEntity } from '../account/infra/entities';
import { SessionEntity } from '../session/infra/entities';
import { QueueEntity } from '../queue/infra/entities';
import { AccountUsecase } from 'src/account/app/account.use-case';
import { AbstractAccountService } from 'src/account/domain/service.interfaces';
import { AbstractAccountRepository } from 'src/account/domain/repository.interfaces';
import { AccountRepository } from 'src/account/infra/repositories';
import { AccountService } from 'src/account/domain/account.service';
import { PaymentUsecase } from 'src/payment/app/payment.use-case';
import { AbstractPaymentService } from 'src/payment/domain/payemnt.service.interfaces';
import { AbstractPaymentRepository } from 'src/payment/domain/repository.interfaces';
import { PaymentService } from 'src/payment/domain/payment.service';
import { PaymentRepository } from 'src/payment/infra/payment.repositories/payment.repository';

describe('통합 테스트', () => {
  let reservationUsecase: ReservationUsecase;
  let accountUseCase: AccountUsecase;
  let paymentUseCase: PaymentUsecase;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ReservationModule, ConcertModule, PaymentModule,
        AccountModule, SessionModule, QueueModule, CommonModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'tester',
          password: 'qwe124!@$',
          database: 'hhplusserverconstruction',
          entities: [ ReservationEntity, ConcertEntity, ConcertPlanEntity, PaymentEntity, AccountEntity, AccountHistoryEntity, SessionEntity, QueueEntity ],
          synchronize: true,
          extra: {
            connectionLimit: 100,
          },
          //logging: true,
        }),
      ],
      providers: [
        ReservationUsecase, 
        { provide: AbstractReservationService, useClass: ReservationService },
        { provide: AbstractReservationRepository, useClass: ReservationRepository },
        AccountUsecase,
        { provide: AbstractAccountService, useClass: AccountService },
        { provide: AbstractAccountRepository, useClass: AccountRepository },
        PaymentUsecase,
        { provide: AbstractPaymentService, useClass: PaymentService },
        { provide: AbstractPaymentRepository, useClass: PaymentRepository },
      ],
    }).compile();

    reservationUsecase = module.get<ReservationUsecase>(ReservationUsecase);
    accountUseCase = module.get<AccountUsecase>(AccountUsecase);

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

  it('예약 동시성 테스트', async () => {
    const tests = [];
    for (let i = 1; i <= 5; i++) {
      const test = reservationUsecase.reserve({ mainCategory: 1, subCategory: 1, minorCategory: 1, userId: i });
      tests.push(test);
    }
    
    await Promise.all(tests);
    const result = await queryRunner.query('SELECT COUNT(1) as count FROM reservation WHERE mainCategory = 1 AND subCategory = 1 AND minorCategory = 1');
    expect(result[0].count).toBe(1);
  });

  it('충전 동시성 테스트', async () => {
    const tests = [];
    for (let i = 1; i <= 5; i++) {
      const test = await accountUseCase.charge({ userId: 1, amount: 1000 });
      tests.push(test);
    }
    
    await Promise.all(tests);
    const result = await queryRunner.query('SELECT balance FROM account WHERE userId = 1');
    expect(result[0].balance).toBe(5000);
  });

  it('결재 동시성 테스트', async () => {
    const tests = [];
    for (let i = 1; i <= 3; i++) {
      const test = paymentUseCase.pay({ userId:1, amount:1000, reservationId: 1 });
      tests.push(test);
    }
    
    await Promise.all(tests);
    const result = await queryRunner.query('SELECT COUNT(1) as count FROM reservation WHERE mainCategory = 1 AND subCategory = 1 AND minorCategory = 1');
    expect(result[0].count).toBe(2000);
  });
});
