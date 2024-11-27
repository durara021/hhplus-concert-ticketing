import { Injectable } from '@nestjs/common';
import { AccountRequestModel } from '../models';
import { AccountResponseCommand } from '../../app/commands/account.response.command';
import { EntityManager } from 'typeorm';

interface AccountServiceInterface {
  updateBalance(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand>
  point(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand> 
  history(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand[]> 
  rollBack(accountModel: AccountRequestModel, manager?:EntityManager): Promise<void> 
}

@Injectable()
export abstract class AbstractAccountService implements AccountServiceInterface {
  abstract updateBalance(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand>
  abstract point(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand> 
  abstract history(accountModel: AccountRequestModel, manager?:EntityManager): Promise<AccountResponseCommand[]> 
  abstract rollBack(accountModel: AccountRequestModel, manager?:EntityManager): Promise<void> 
}