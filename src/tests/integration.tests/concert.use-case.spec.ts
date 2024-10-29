import { Test, TestingModule } from '@nestjs/testing';
import { ConcertUsecase } from '../../concert/app/concert.use-case';
import { AbstractConcertService } from '../../concert/domain/service.interfaces';
import { AbstractReservationService } from '../../reservation/domain/service.interfaces';
import { DataSource } from 'typeorm';
import { ConcertRequestCommand } from '../../concert/app/commands';
import { NotFoundException } from '@nestjs/common';

describe('ConcertUsecase', () => {
  let concertUsecase: ConcertUsecase;
  let mockConcertService: jest.Mocked<AbstractConcertService>;
  let mockReservationService: jest.Mocked<AbstractReservationService>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    mockConcertService = {
      info: jest.fn(),
      planInfos: jest.fn(),
      planInfo: jest.fn(),
      availableSeats: jest.fn(),
    } as jest.Mocked<AbstractConcertService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertUsecase,
        {
          provide: AbstractConcertService,
          useValue: mockConcertService,
        },
        {
          provide: AbstractReservationService,
          useValue: mockReservationService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    concertUsecase = module.get<ConcertUsecase>(ConcertUsecase);
  });

  // 콘서트 예약가능일 조회 실패 테스트
  describe('dates', () => {
    it('콘서트 정보가 없을 경우 NotFoundException을 발생시켜야 한다', async () => {
      const command = new ConcertRequestCommand();

      // Mock 설정: 콘서트 정보가 없는 경우
      mockConcertService.info.mockResolvedValueOnce(null);

      await expect(concertUsecase.dates(command)).rejects.toThrow(NotFoundException);
    });
  });

  // 콘서트 예약가능좌석 조회 실패 테스트
  describe('seats', () => {
    it('콘서트 일정 정보가 없을 경우 NotFoundException을 발생시켜야 한다', async () => {
      const command = new ConcertRequestCommand();

      // Mock 설정: 콘서트 일정 정보가 없는 경우
      mockConcertService.planInfo.mockResolvedValueOnce(null);

      await expect(concertUsecase.seats(command)).rejects.toThrow(NotFoundException);
    });
  });
});
