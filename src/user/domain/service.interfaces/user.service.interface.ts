import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../infra/entities';
import { EntityManager } from 'typeorm';

interface UserServiceInterface {
  user(userId: number, manager: EntityManager): Promise<UserEntity>
}
@Injectable()
export abstract class AbstractUserService implements UserServiceInterface{
  
  abstract user(userId: number, manager: EntityManager): Promise<UserEntity>
}