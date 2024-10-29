import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReservationUsecase } from '../app/reservation.use-case';
import { ReservationPostRequestDto, ReservationPostResponseDto as ResPostDto} from './dto';
import { ReservationRequestCommand } from '../app/commands';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('예약 API') // 컨트롤러 태그 설정
@Controller('reservations')
export class ReservationController {
  
  constructor(
    private readonly reservationUsecase: ReservationUsecase,
  ) {}

  @Post('')
  @ApiOperation({ summary: '예약' })
  @ApiCreatedResponse({
    description: '성공',
    type: ResPostDto,
  })
  reserve(
    @Body() body: ReservationPostRequestDto
  ): Promise<ResPostDto> {
    return this.reservationUsecase.reserve(ReservationRequestCommand.of(body));
  }

}
