import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity.interfaces';

interface UserServiceInterface {
  user(userId: number): Promise<UserEntity>
}
@Injectable()
export abstract class AbstractUserService implements UserServiceInterface{
  abstract user(userId: number): Promise<UserEntity>
}