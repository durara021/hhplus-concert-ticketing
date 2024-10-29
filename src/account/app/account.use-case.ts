import { Injectable } from '@nestjs/common';
import { AccountGetResponseDto as ResGetDto, AccountPostResponseDto as ResPostDto } from "../pres/dto";
import { AbstractAccountService } from '../domain/service.interfaces/account.service.interface';
import { AccountCommand } from './commands/account.request.command';
import { AccountRequestModel } from '../domain/models';

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountService: AbstractAccountService,

  ) {}

  // 포인트 충전
  async charge(accountCommand: AccountCommand): Promise<ResPostDto> {

    const accountModel = AccountRequestModel.of(accountCommand);
    accountModel.updateStatus('charge');

    // 모델을 DTO로 변환하여 반환
    return ResPostDto.of(await this.accountService.updateBalance(accountModel));

  }

  // 포인트 조회
  async point(accountCommand: AccountCommand): Promise<ResGetDto> {

    // Command를 Model로 변환
    const point = await this.accountService.point(AccountRequestModel.of(accountCommand));

    // 모델을 DTO로 변환하여 반환
    return ResGetDto.of(point);

  }

}
