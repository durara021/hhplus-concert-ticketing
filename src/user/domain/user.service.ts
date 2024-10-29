import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../infra/entity.interfaces';
import { AbstractUserRepository } from './repository.interfaces';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class UserService {

  constructor(
    private readonly userRepository: AbstractUserRepository,
    private readonly dataSource: DataSource,
  ) {}

  //유저 확인
  async user(userId: number, manager?: EntityManager): Promise<UserEntity> {
    const executeUser = async (manager: EntityManager): Promise<UserEntity> => {
      const userEntity = UserEntity.of({id:userId});
      const user = this.userRepository.user(userEntity, manager);
      
      if(!user) throw new NotFoundException("유저를 찾을 수 없습니다.");
      return user;
    }
    return manager ? executeUser(manager) : this.dataSource.transaction(executeUser);
  }

}