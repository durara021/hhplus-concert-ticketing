import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/domain/user.service';
import { AbstractUserRepository } from '../../user/domain/repository.interfaces';
import { UserEntity } from '../../user/infra/entity.interfaces';
import { EntityManager } from 'typeorm';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: AbstractUserRepository;
  let mockEntityManager: EntityManager;

  beforeEach(async () => {
    // 리포지토리 메서드 모킹
    mockUserRepository = {
      user: jest.fn(),  // 유저 조회 메서드 모킹
    };

    // EntityManager 모킹
    mockEntityManager = {} as EntityManager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AbstractUserRepository,
          useValue: mockUserRepository,  // 모킹된 리포지토리 제공
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('user 실패 케이스', () => {
    it('유저가 존재하지 않을 경우 NotFoundException을 던져야 한다', async () => {
      const userId = 1;

      // user 메서드가 null을 반환하도록 모킹하여 유저가 없는 상황을 시뮬레이션
      mockUserRepository.user = jest.fn().mockResolvedValue(null);

      // 유저가 없는 경우 NotFoundException이 발생하는지 확인
      await expect(userService.user(userId, mockEntityManager)).rejects.toThrow(NotFoundException);
    });

    it('유저가 존재할 경우 유저 정보를 반환해야 한다', async () => {
      const userEntity = new UserEntity({id: 1});

      // user 메서드가 유저 엔티티를 반환하도록 모킹
      mockUserRepository.user = jest.fn().mockResolvedValue(userEntity);

      // 유저 조회 메서드 호출 및 결과 확인
      const result = await userService.user(1, mockEntityManager);

      expect(mockUserRepository.user).toHaveBeenCalledWith(expect.any(UserEntity), mockEntityManager);
      expect(result).toEqual(userEntity);
    });
  });
});
