import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express'; // 올바른 Express Response 타입을 가져옵니다.
import { SessionUsecase } from '../app/session.use-case'; 
import { SessionPostResponseDto as ResPostDto} from './dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('세션 API') // 컨트롤러 태그 설정
@Controller('sessions')
export class SessionController {
  
  constructor(
    private readonly sessionUsecase: SessionUsecase
  ) {}

  @Post('')
  @ApiOperation({ summary: '세션생성' })
  @ApiCreatedResponse({
    description: '성공',
    type: ResPostDto,
  })
  async create(
    @Body('userId') userId: string,
    @Res() response: Response, // Express Response 객체 사용
  ): Promise<void> {
    
    const createResult = await this.sessionUsecase.create(parseInt(userId));
    response.cookie('sessionId', createResult.uuid, { httpOnly: true, secure: true });

    response.status(201).send(ResPostDto.of(createResult));
  }

}
