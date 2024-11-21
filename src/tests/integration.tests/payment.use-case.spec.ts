// payment.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PaymentUsecase } from '../../payment/app/payment.use-case';
import { AccountController } from '../../account/pres/account.controller';
import { ReservationController } from '../../reservation/pres/reservation.controller'; 
import { Transport } from '@nestjs/microservices';
import { PaymentRequestCommand } from '../../payment/app/commands';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ReservationEntity } from '../../reservation/infra/entities';
import { AccountEntity } from '../../account/infra/entities';

describe('Kafka Integration Test', () => {
  let app: INestApplication;
  let paymentUsecase: PaymentUsecase;
  let accountController: AccountController;
  let reservationController: ReservationController;

  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let reservationRepository: Repository<ReservationEntity>;
  let accountRepository: Repository<AccountEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    paymentUsecase = module.get<PaymentUsecase>(PaymentUsecase);
    accountController = module.get<AccountController>(AccountController);
    reservationController = module.get<ReservationController>(ReservationController);

    // 메시지 수신 여부 확인을 위한 배열 추가
    (accountController as any).receivedMessages = [];
    (reservationController as any).receivedMessages = [];

    // 오버라이드하여 메시지 저장
    jest.spyOn(accountController, 'handlePaymentEvent').mockImplementation(async (message) => {
      (accountController as any).receivedMessages.push(message);
    });

    jest.spyOn(reservationController, 'handlePaymentEvent').mockImplementation(async (message) => {
      (reservationController as any).receivedMessages.push(message);
    });

    // 마이크로서비스 연결
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'nestjs-kafka-client',
          brokers: ['localhost:9094'],
        },
        consumer: {
          groupId: 'nestjs-consumer-group',
        },
      },
    });

    await app.startAllMicroservices();
    await app.init();

    // KafkaProducerService의 onModuleInit 호출
    await paymentUsecase.onModuleInit();

    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    reservationRepository = queryRunner.manager.getRepository(ReservationEntity);
    accountRepository = queryRunner.manager.getRepository(AccountEntity);

    // 데이터 초기화
    await queryRunner.query('TRUNCATE TABLE payment');
    await queryRunner.query('TRUNCATE TABLE account');
    await queryRunner.query('TRUNCATE TABLE reservation');
    await queryRunner.query('TRUNCATE TABLE outbox');
    await queryRunner.query('TRUNCATE TABLE inbox');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send and receive a Kafka message', async () => {
    const testMessage = {
      userId: 1,
      reservationId: 1,
      amount: 10000,
    };

    // 데이터 삽입
    await reservationRepository.save(
      ReservationEntity.of({
        mainCategory: 1,
        subCategory: 1,
        minorCategory: 1,
        status: 'temp',
        userId: 1,
      }),
    );
  
    await accountRepository.save(
      AccountEntity.of({
        userId: 1,
        balance: 100000,
      }),
    );

    // 컨슈머가 준비될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 메시지 발행
    await paymentUsecase.save(PaymentRequestCommand.of(testMessage));

    // 메시지 처리 대기
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedAccount = await accountRepository.findOneBy({ userId: 1 });
    const updatedReservation = await reservationRepository.findOneBy({ userId: 1 });
    
    // 결과 검증
    expect(updatedAccount?.balance).toBe(90000); // 잔액 감소 확인
    expect(updatedReservation?.status).toBe('confirmed'); // 예약 상태 변경 확인
  });
});
