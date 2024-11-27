import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AccountUsecase } from '../app/account.use-case';
import { AccountGetResponseDto, AccountPatchRequestDto, AccountPostResponseDto } from './dto';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccountRequestCommand } from '../app/commands/account.request.command';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('계좌 API') 
@Controller('accounts')
export class AccountController {
  
  public receivedMessages: any[] = []; // 메시지 저장 배열

  constructor(
    private readonly accountUsecase: AccountUsecase,
  ) {}

  @Patch('/points')
  @ApiOperation({ summary: '금액 충전' }) 
  @ApiParam({ name: 'userId', description: '유저 id' })
  @ApiBody({ description: '충전 금액' })
  @ApiCreatedResponse({
    description: '성공',
    type: AccountPostResponseDto,
  })
  charge(
    @Body() body: AccountPatchRequestDto,
  ): Promise<AccountPostResponseDto> {
    return this.accountUsecase.charge(AccountRequestCommand.of(body));
  }

  @Get('/:userId/points')
  @ApiOperation({ summary: '포인트 조회' })
  @ApiParam({ name: 'userId', description: '유저 id' })
  @ApiCreatedResponse({
    description: '성공',
    type: AccountGetResponseDto,
  })
  point(
    @Body() body: AccountPatchRequestDto,
  ): Promise<AccountGetResponseDto> {
    return this.accountUsecase.point(AccountRequestCommand.of(body));
  }

  @EventPattern('payment.success') // Kafka 토픽
  async handlePaymentEvent(@Payload() message: any) {
    this.accountUsecase.use(AccountRequestCommand.of({
      userId : parseInt(message.userId),
      amount : parseInt(message.amount),
    }))
    //console.log(`Received payment message with key "${key}":`, value);
  }

  @EventPattern('payment.fail') // Kafka 토픽
  async handlePaymentRollbackEvent(@Payload() message: any) {
    this.accountUsecase.use(AccountRequestCommand.of({
      userId : parseInt(message.userId),
      eventId : parseInt(message.eventId),
    }))
    //console.log(`Received payment message with key "${key}":`, value);
  }
  
}
