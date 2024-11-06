import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express'; // 올바른 Express Response 타입을 가져옵니다.
import { UserTokenUsecase } from '../app/userToken.use-case';
import { UserTokenPostResponseDto as ResPostDto} from './dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('세션 API') // 컨트롤러 태그 설정
@Controller('userTokens')
export class UserTokenController {
  
  constructor(
    private readonly userTokenUsecase: UserTokenUsecase
  ) {}

  @Post('')
  @ApiOperation({ summary: '세션생성' })
  @ApiCreatedResponse({
    description: '성공',
    type: ResPostDto,
  })
  async create(
    @Body('userId') userId: string,
    @Res() res: Response, // Express Response 객체 사용
  ): Promise<void> {
    
    const token = await this.userTokenUsecase.create(parseInt(userId));
    res.setHeader('Authorization', `Bearer ${token}`);

    res.status(201).send(ResPostDto.of(token));
  }

}
