import { Test, TestingModule } from '@nestjs/testing';
import { AbstractReservationService } from '../../reservation/domain/service.interfaces';
import { AbstractReservationRepository } from '../../reservation/domain/repository.interfaces';
import { DataSource, EntityManager } from 'typeorm';
import { ReservationRequestModel } from '../../reservation/domain/models';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReservationService } from '../../reservation/domain/reservation.service';
import { ReservationResponseCommand } from '../../reservation/app/commands';

describe('ReservationService', () => {
  let service: AbstractReservationService;
  let reservationRepository: AbstractReservationRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AbstractReservationService, useClass:ReservationService },
        {
          provide: AbstractReservationRepository,
          useValue: {
            reservedItem: async () => null, // 기본적으로 예약된 아이템이 없도록 설정
            reserve: async () => { throw new Error('임시 예약 실패'); },
            updateStatus: async () => null, // 상태 변경 실패 상황
            reservedItems: async () => [], // 예약된 아이템 조회 실패
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

    service = module.get<AbstractReservationService>(AbstractReservationService);
    reservationRepository = module.get<AbstractReservationRepository>(AbstractReservationRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('이미 예약된 아이템일 때 에러를 던져야 한다.', async () => {
    const model = new ReservationRequestModel({mainCategory:1, subCategory: 1, minorCategory: 1});
    reservationRepository.reservedItem = async () => ReservationResponseCommand.of(model);

    await expect(service.reserve(model)).rejects.toThrow('이미 예약된 아이템입니다.');
  });

  it('임시 예약이 실패할 경우 에러를 던져야 한다.', async () => {
    const model = new ReservationRequestModel({mainCategory:1, subCategory: 1, minorCategory: 1});
    reservationRepository.reservedItem = async () => null;  // 예약되지 않은 상태로 설정

    await expect(service.reserve(model)).rejects.toThrow('임시 예약 실패');
  });

  it('예약된 아이템이 없을 때 NotFoundException을 던져야 한다.', async () => {
    const model = new ReservationRequestModel({mainCategory:1, subCategory: 1, minorCategory: 1});

    await expect(service.reservation(model)).rejects.toThrow(NotFoundException);
  });

  it('상태 변경이 실패하면 에러를 던져야 한다.', async () => {
    const model = new ReservationRequestModel({mainCategory:1, subCategory: 1, minorCategory: 1});
    
    await expect(service.UpdateStatus(model)).rejects.toThrow(ConflictException);
  });

  it('예약된 아이템 조회가 실패하면 빈배열을 반환해야 한다.', async () => {
    const model = new ReservationRequestModel({mainCategory:1, subCategory: 1, minorCategory: 1});

    await expect((await service.reservedItems(model)).minorCategories).toEqual([]);
  });

});
