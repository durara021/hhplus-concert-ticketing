import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../infra/entity.interfaces';
import { EntityManager } from 'typeorm';

interface UserServiceInterface {
  user(userId: number, manager: EntityManager): Promise<UserEntity>
}
@Injectable()
export abstract class AbstractUserService implements UserServiceInterface{
  
  abstract user(userId: number, manager: EntityManager): Promise<UserEntity>
}