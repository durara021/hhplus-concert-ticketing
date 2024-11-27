import { Injectable } from '@nestjs/common';
import { AccountGetResponseDto as ResGetDto, AccountPostResponseDto as ResPostDto } from "../pres/dto";
import { AbstractAccountService } from '../domain/service.interfaces/account.service.interface';
import { AccountRequestCommand } from './commands/account.request.command';
import { AccountRequestModel } from '../domain/models';

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountService: AbstractAccountService,
    //private readonly distributedLockProvider: DistributedLockProvider
  ) {}

  // 포인트 충전
  async charge(accountCommand: AccountRequestCommand): Promise<ResPostDto> {

    const accountModel = AccountRequestModel.of(accountCommand);
    accountModel.updateStat('charge');

    // 모델을 DTO로 변환하여 반환
    return ResPostDto.of(await this.accountService.updateBalance(accountModel));

  }
    
  // 포인트 충전
  async use(accountCommand: AccountRequestCommand): Promise<ResPostDto> {

    const accountModel = AccountRequestModel.of(accountCommand);
    accountModel.updateStat('use');

    // 모델을 DTO로 변환하여 반환
    return ResPostDto.of(await this.accountService.updateBalance(accountModel));

  }

  // 포인트 충전
  async rollBack(accountCommand: AccountRequestCommand): Promise<void> {

    const accountModel = AccountRequestModel.of(accountCommand);
    await this.accountService.rollBack(accountModel);

  }
  
  /*
     // 포인트 충전
  async charge(accountCommand: AccountRequestCommand): Promise<ResPostDto> {
    const accountModel = AccountRequestModel.of(accountCommand);
    accountModel.updateStat('charge');

    const resourceId = uuidv4(); // 잠금을 위한 사용자 ID를 리소스 ID로 설정
    const timeout = 10000; // 락 타임아웃 (예: 10초)

    // 락 획득 시도
    const lockAcquired = await this.distributedLockProvider.acquireLock(resourceId, timeout);

    if (!lockAcquired) {
      throw new InternalServerErrorException('포인트 충전 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    try {
      // 모델을 업데이트하고 DTO로 변환하여 반환
      const updatedBalance = await this.accountService.updateBalance(accountModel);
      return ResPostDto.of(updatedBalance);
    } finally {
      // 작업 완료 후 락 해제
      await this.distributedLockProvider.releaseLock(resourceId);
    }
    
  }
  */

  // 포인트 조회
  async point(accountCommand: AccountRequestCommand): Promise<ResGetDto> {

    // Command를 Model로 변환
    const point = await this.accountService.point(AccountRequestModel.of(accountCommand));

    // 모델을 DTO로 변환하여 반환
    return ResGetDto.of(point);

  }

}
