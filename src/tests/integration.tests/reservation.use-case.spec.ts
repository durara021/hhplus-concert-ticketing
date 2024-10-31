import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ReservationUsecase } from '../../reservation/app/reservation.use-case';
import { AbstractReservationService } from '../../reservation/domain/service.interfaces'; 
import { AbstractReservationRepository } from '../../reservation/domain/repository.interfaces';
import { ReservationEntity } from '../../reservation/infra/entities';
import { ReservationModule } from '../../reservation/reservation.module';
import { ReservationRepository } from '../../reservation/infra/repositories/reservation.repository';
import { ReservationService } from '../../reservation/domain/reservation.service';
import { baseDBConfig } from '../../db.config';
import { ReservationRequestCommand } from '../../reservation/app/commands';

describe('ReservationUsecase', () => {
  let reservationUsecase: ReservationUsecase;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let repository: Repository<ReservationEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ReservationModule,
        TypeOrmModule.forRoot({
          ...baseDBConfig,
          entities: [ReservationEntity],
        }),
        TypeOrmModule.forFeature([ReservationEntity]),
      ],
      providers: [
        ReservationUsecase,
        { provide: AbstractReservationService, useClass: ReservationService },
        { provide: AbstractReservationRepository, useClass: ReservationRepository },
      ],
    }).compile();

    reservationUsecase = module.get<ReservationUsecase>(ReservationUsecase);
    dataSource = module.get<DataSource>(DataSource);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // QueryRunner 생성 및 연결
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    repository = queryRunner.manager.getRepository(ReservationEntity);

    await queryRunner.query('TRUNCATE TABLE reservation');
  });

  afterAll(async () => {
    // QueryRunner 연결 해제
    await queryRunner.release();
    await dataSource.destroy();
  });

  it('임시 예약', async () => {
    // account테이블에 1번 user 추가
    await repository.save(ReservationEntity.of({ mainCategory: 1, subCategory: 1, minorCategory: 1, status: 'available' }));

    const promises = Array.from({ length: 10 }).map(async (_, idx) => {
      await reservationUsecase.reserve(ReservationRequestCommand.of({ mainCategory: 1, subCategory: 1, minorCategory: 1, userId: idx+1}))
    });

    await Promise.all(promises);

  }, 1000);

});
