import { Injectable } from '@nestjs/common';

interface UserTokenServiceInterface{
  create(userId: number): Promise<string>
}

@Injectable()
export abstract class AbstractUserTokenService implements UserTokenServiceInterface{
    abstract create(userId: number): Promise<string>
}
