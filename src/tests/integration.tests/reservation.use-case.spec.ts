import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConcertUsecase } from '../../concert/app/concert.use-case';
import { AbstractConcertService } from '../../concert/domain/service.interfaces';
import { AbstractReservationService } from '../../reservation/domain/service.interfaces';
import { ConcertRequestCommand } from '../../concert/app/commands';
import { ReservationRequestCommand } from '../../reservation/app/commands';

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

  // ReservationUsecase 실패 테스트 추가
  describe('ReservationUsecase - 실패 케이스', () => {
    let reservationUsecase: any; // ReservationUsecase 모듈 추가 필요

    it('예약 가능 여부 확인 실패 시 ConflictException을 발생시켜야 한다', async () => {
      const command = new ReservationRequestCommand(); // ReservationRequestCommand 가정

      // Mock 설정: 예약 가능한 아이템이 없는 경우
      mockReservationService.isAvailableItem.mockRejectedValueOnce(new ConflictException('이미 예약된 아이템입니다.'));

      await expect(reservationUsecase.reserve(command)).rejects.toThrow(ConflictException);
    });
  });
});
