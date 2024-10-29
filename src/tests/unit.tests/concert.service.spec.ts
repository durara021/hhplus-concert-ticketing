import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ConcertService } from '../../concert/domain/concert.service';
import { AbstractConcertRepository, AbstractConcertPlanRepository } from '../../concert/domain/repository.interfaces';
import { ConcertRequestModel, ConcertResponseModel } from '../../concert/domain/models';

describe('ConcertService', () => {
  let service: ConcertService;
  let concertRepository: AbstractConcertRepository;
  let concertPlanRepository: AbstractConcertPlanRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: AbstractConcertRepository,
          useValue: {
            info: async () => null, // 콘서트 정보 조회 실패를 위한 기본 설정
          },
        },
        {
          provide: AbstractConcertPlanRepository,
          useValue: {
            planInfos: async () => [], // 콘서트 계획 정보 조회 실패를 위한 기본 설정
            planInfo: async () => null, // 단일 일정 정보 조회 실패를 위한 기본 설정
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

    service = module.get<ConcertService>(ConcertService);
    concertRepository = module.get<AbstractConcertRepository>(AbstractConcertRepository);
    concertPlanRepository = module.get<AbstractConcertPlanRepository>(AbstractConcertPlanRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('dates 실패 케이스', () => {
    it('콘서트 정보가 없을 때 NotFoundException을 던져야 합니다.', async () => {
      const model = new ConcertRequestModel({concertId: 1});

      await expect(service.dates(model)).rejects.toThrow(NotFoundException);
    });

    it('콘서트 계획 정보가 없을 때 NotFoundException을 던져야 합니다.', async () => {
      const model = new ConcertRequestModel({concertId: 1, concertPlanId:2});
      concertRepository.info = async () => (ConcertResponseModel.of(model));

      await expect(service.dates(model)).rejects.toThrow(NotFoundException);
    });
  });

  describe('availableSeats 실패 케이스', () => {
    it('모든 좌석이 이미 예약된 경우 예약 가능 좌석이 빈 배열이어야 합니다.', async () => {
      const model = new ConcertRequestModel({capacity:30, concertSeats: Array.from({ length: 30 }, (_, i) => i + 1)});
      const result = await service.availableSeats(model);

      expect(result.concertSeats).toEqual([]); // 빈 배열을 반환하는지 확인
    });
  });

  describe('planInfo 실패 케이스', () => {
    it('일정 정보가 없을 때 NotFoundException을 던져야 합니다.', async () => {
      const model = new ConcertRequestModel({concertId:1});

      await expect(service.planInfo(model)).rejects.toThrow(NotFoundException);
    });
  });
});
