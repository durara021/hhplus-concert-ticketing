import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { ReservationUsecase } from '../app/reservation.use-case';
import { ReservationPostRequestDto, ReservationPostResponseDto as ResPostDto} from './dto';
import { ReservationRequestCommand } from '../app/commands';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('예약 API') // 컨트롤러 태그 설정
@Controller('reservations')
export class ReservationController {

  public receivedMessages: any[] = []; // 메시지 저장 배열
  
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

  @EventPattern('payment.success') // Kafka 토픽
  async handlePaymentEvent(@Payload() message: any) {
    await this.reservationUsecase.book(ReservationRequestCommand.of(
      {
        userId: parseInt(message.userId),
        id: parseInt(message.reservationId),
      }
    ));
  }

  @EventPattern('payment.fail') // Kafka 토픽
  async handlePaymentRollbackEvent(@Payload() message: any) {
    await this.reservationUsecase.rollBack(ReservationRequestCommand.of(
      {
        userId: parseInt(message.userId),
        eventId : parseInt(message.eventId),
      }
    ));
  }
  
}
