import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './pres/account.controller';
import { AccountUsecase } from './app/account.use-case';
import { AbstractAccountService } from './domain/service.interfaces';
import { AccountService } from './domain/account.service';
import { AccountEntity, AccountHistoryEntity } from './infra/entities';
import { AbstractAccountHistoryRepository, AbstractAccountRepository } from './domain/repository.interfaces';
import { AccountHistoryRepository, AccountRepository } from './infra/repositories';

@Module({
  imports: [ TypeOrmModule.forFeature([AccountEntity, AccountHistoryEntity]), ],
  controllers: [AccountController],
  providers: [
    AccountUsecase, 
    { provide: AbstractAccountService, useClass: AccountService },
    { provide: AbstractAccountRepository, useClass: AccountRepository },
    { provide: AbstractAccountHistoryRepository, useClass: AccountHistoryRepository },
  ],
  exports: [AbstractAccountService]
})
export class AccountModule {}
