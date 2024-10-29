import { Test, TestingModule } from '@nestjs/testing';
import { SessionUsecase } from '../../session/app/session.use-case';
import { AbstractUserService } from '../../user/domain/service.interfaces/user.service.interface';
import { AbstractSessionService } from '../../session/domain/service.interfaces/session.service.interface';
import { DataSource, EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// SessionUsecase의 create 메서드에 대한 실패 테스트 케이스를 정의합니다.
describe('SessionUsecase - create (Failure Cases)', () => {
  let sessionUsecase: SessionUsecase;
  let userService: AbstractUserService;
  let sessionService: AbstractSessionService;
  let dataSource: DataSource;

  // 각 테스트 케이스 실행 전에 필요한 의존성들을 설정합니다.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionUsecase,
        {
          provide: AbstractUserService,
          useValue: {
            user: jest.fn(),
          },
        },
        {
          provide: AbstractSessionService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    sessionUsecase = module.get<SessionUsecase>(SessionUsecase);
    userService = module.get<AbstractUserService>(AbstractUserService);
    sessionService = module.get<AbstractSessionService>(AbstractSessionService);
    dataSource = module.get<DataSource>(DataSource);
  });

  // 사용자가 존재하지 않을 경우 NotFoundException이 발생하는지 테스트합니다.
  it('should throw NotFoundException if user is not found', async () => {
    // Given: 사용자가 존재하지 않는 상황을 설정합니다.
    const userId = 1;
    (userService.user as jest.Mock).mockResolvedValue(null);
    (dataSource.transaction as jest.Mock).mockImplementation(async (cb: (manager: EntityManager) => Promise<any>) => {
      const manager = {} as EntityManager;
      return cb(manager);
    });

    // When & Then: create 메서드를 호출했을 때 NotFoundException이 발생하는지 확인합니다.
    await expect(sessionUsecase.create(userId)).rejects.toThrow(NotFoundException);
  });

  // 세션 생성이 실패할 경우 에러가 발생하는지 테스트합니다.
  it('should throw an error if session creation fails', async () => {
    // Given: 사용자는 존재하지만 세션 생성이 실패하는 상황을 설정합니다.
    const userId = 1;
    const mockUser = { id: userId };
    (userService.user as jest.Mock).mockResolvedValue(mockUser);
    (sessionService.create as jest.Mock).mockRejectedValue(new Error('Session creation failed'));
    (dataSource.transaction as jest.Mock).mockImplementation(async (cb: (manager: EntityManager) => Promise<any>) => {
      const manager = {} as EntityManager;
      return cb(manager);
    });

    // When & Then: create 메서드를 호출했을 때 'Session creation failed' 에러가 발생하는지 확인합니다.
    await expect(sessionUsecase.create(userId)).rejects.toThrow('Session creation failed');
  });
});
