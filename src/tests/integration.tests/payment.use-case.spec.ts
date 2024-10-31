import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PaymentUsecase } from '../../payment/app/payment.use-case';
import { AbstractPaymentService } from '../../payment/domain/service.interfaces';
import { AbstractPaymentRepository } from '../../payment/domain/repository.interfaces';
import { PaymentEntity } from '../../payment/infra/entities';
import { ReservationEntity } from '../../reservation/infra/entities';
import { PaymentModule } from '../../payment/payment.module';
import { PaymentRepository } from '../../payment/infra/payment.repositories/payment.repository';
import { PaymentService } from '../../payment/domain/payment.service';
import { baseDBConfig } from '../../db.config';
import { PaymentRequestCommand } from '../../payment/app/commands'
import { AccountEntity, AccountHistoryEntity } from '../../account/infra/entities';
import { AbstractAccountService } from '../../account/domain/service.interfaces';
import { AccountService } from '../../account/domain/account.service';
import { AccountHistoryRepository, AccountRepository } from '../../account/infra/repositories';
import { AbstractAccountHistoryRepository, AbstractAccountRepository } from '../../account/domain/repository.interfaces';
import { AbstractReservationService } from '../../reservation/domain/service.interfaces';
import { ReservationService } from '../../reservation/domain/reservation.service';
import { ReservationRepository } from '../../reservation/infra/repositories/reservation.repository';
import { AbstractReservationRepository } from '../../reservation/domain/repository.interfaces';
import { AbstractQueueService } from '../../queue/domain/service.interfaces';
import { QueueService } from '../../queue/domain/queue.service';
import { QueueRepository } from '../../queue/infra/repositories/queue.repository';
import { AbstractQueueRepository } from '../../queue/domain/repository.interfaces';
import { QueueEntity } from '../../queue/infra/entities';

describe('PaymentUsecase', () => {
  let paymentUsecase: PaymentUsecase;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let repository: Repository<ReservationEntity>;
  let accountRepository: Repository<AccountEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PaymentModule,
        TypeOrmModule.forRoot({
          ...baseDBConfig,
          entities: [ PaymentEntity, AccountEntity, AccountHistoryEntity, ReservationEntity, QueueEntity ],
        }),
        TypeOrmModule.forFeature([ PaymentEntity, AccountEntity, AccountHistoryEntity, ReservationEntity, QueueEntity ]),
      ],
      providers: [
        PaymentUsecase,
        { provide: AbstractAccountService, useClass: AccountService },
        { provide: AbstractAccountRepository, useClass: AccountRepository },
        { provide: AbstractAccountHistoryRepository, useClass: AccountHistoryRepository },
        { provide: AbstractReservationService, useClass: ReservationService },
        { provide: AbstractReservationRepository, useClass: ReservationRepository },
        { provide: AbstractPaymentService, useClass: PaymentService },
        { provide: AbstractPaymentRepository, useClass: PaymentRepository },
        { provide: AbstractQueueService, useClass: QueueService },
        { provide: AbstractQueueRepository, useClass: QueueRepository },
      ],
    }).compile();

    paymentUsecase = module.get<PaymentUsecase>(PaymentUsecase);
    dataSource = module.get<DataSource>(DataSource);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // QueryRunner 생성 및 연결
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    repository = queryRunner.manager.getRepository(ReservationEntity);
    accountRepository = queryRunner.manager.getRepository(AccountEntity);

    await queryRunner.query('TRUNCATE TABLE payment');
    await queryRunner.query('TRUNCATE TABLE account');
    await queryRunner.query('TRUNCATE TABLE reservation');
  });

  afterAll(async () => {
    // QueryRunner 연결 해제
    await queryRunner.release();
    await dataSource.destroy();
  });

  it('결재', async () => {
    // account테이블에 1번 user 추가
    await repository.save(ReservationEntity.of({ mainCategory: 1, subCategory: 1, minorCategory: 1, status: 'temp', userId: 1 }));
    await accountRepository.save(AccountEntity.of({ userId: 1, balance: 100000, id: 1 }));

    const promises = Array.from({ length: 1 }).map(async (_, idx) => {
      await paymentUsecase.pay(PaymentRequestCommand.of({ reservationId: 1, amount: 10000, userId: 1}));
    });

    await Promise.all(promises);

  }, 1000);

});
