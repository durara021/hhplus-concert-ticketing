import { Body, Controller, Get, Post } from '@nestjs/common';
import { QueuePostResponseDto, QueueGetResponseDto, QueueGetRequestDto, QueuePostRequestDto } from './dto';
import { QueueRequestCommand } from '../app/commands';
import { QueueUsecase } from '../app/queue.use-case';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('대기열 API') // 컨트롤러 태그 설정
@Controller('queues')
export class QueueController {
  constructor(
    private readonly QueueUsecase: QueueUsecase,
  ) {}

  @Post('')
  @ApiOperation({ summary: '대기열 입장' })
  @ApiCreatedResponse({
    description: '성공',
    type: QueuePostResponseDto,
  })
  //@UseGuards(SessionGuard)
  async enter(
    @Body() body: QueuePostRequestDto
  ): Promise<QueuePostResponseDto> {
    return await this.QueueUsecase.enter(QueueRequestCommand.of(body));
  }

  @Get('/positions')
  @ApiOperation({ summary: '대기열 순위' })
  @ApiCreatedResponse({
    description: '성공',
    type: QueueGetResponseDto,
  })
  //@UseGuards(SessionGuard)
  async myPosition(
    @Body() body: QueueGetRequestDto
  ): Promise<QueueGetResponseDto> {
    return await this.QueueUsecase.myPosition(QueueRequestCommand.of(body));
  }
}
