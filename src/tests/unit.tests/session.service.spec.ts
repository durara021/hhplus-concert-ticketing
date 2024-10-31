import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AbstractSessionService } from '../../session/domain/service.interfaces/session.service.interface';
import { SessionService } from '../../session/domain/session.service';
import { AbstractSessionRepository } from '../../session/domain/repository.interfaces';

describe('SessionService 실패 케이스', () => {
  let service: AbstractSessionService;
  let sessionRepository: AbstractSessionRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AbstractSessionService, useClass: SessionService },
        {
          provide: AbstractSessionRepository,
          useValue: {
            create: jest.fn(),
            session: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb: (manager: EntityManager) => Promise<any>) => cb({} as EntityManager)),
          },
        },
      ],
    }).compile();

    service = module.get<AbstractSessionService>(AbstractSessionService);
    sessionRepository = module.get<AbstractSessionRepository>(AbstractSessionRepository);
    dataSource = module.get<DataSource>(DataSource);
  });
  describe('create 실패 케이스', () => {
    it('UUID 중복으로 인한 ConflictException이 3번 시도 후 발생해야 합니다.', async () => {
      sessionRepository.create = jest.fn().mockRejectedValue(new ConflictException());
      
      await expect(service.create(1, {} as EntityManager)).rejects.toThrow(
        'UUID가 중복되어 세션을 생성할 수 없습니다.'
      );
      expect(sessionRepository.create).toHaveBeenCalledTimes(4); // 1회 + 3번 재시도
    });
  });

  describe('session 실패 케이스', () => {
    it('존재하지 않는 세션 UUID 조회 시 null을 반환해야 합니다.', async () => {
      sessionRepository.session = jest.fn().mockResolvedValue(null);
      
      const result = await service.session('non-existent-uuid');
      
      expect(result).toBeNull();
      expect(sessionRepository.session).toHaveBeenCalled();
    });
  });
  
  describe('updateStatus 실패 케이스', () => {
    it('UUID에 해당하는 세션이 없어서 상태 업데이트에 실패할 경우 에러가 발생해야 합니다.', async () => {
      sessionRepository.updateStatus = jest.fn().mockResolvedValue(null);

      await expect(service.updateStatus('non-existent-uuid', {} as EntityManager)).rejects.toThrow();
      expect(sessionRepository.updateStatus).toHaveBeenCalled();
    });
  });

});
