import { Controller, Get, Param } from '@nestjs/common';
import { ConcertUsecase } from '../app/concert.use-case';
import { ConcertGetResponseDto as ResGetDto } from './dto';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ConcertGetRequestDto } from './dto/concert/concert.get.request.dto';
import { ConcertRequestCommand } from '../app/commands/concert/concert.request.command';

@ApiTags('콘서트 API')
@Controller('concerts')
export class ConcertController {
  
  constructor(
    private readonly concertUsecase: ConcertUsecase,
  ) {}

  @Get('/:concertId/dates')
  @ApiOperation({ summary: '콘서트 날짜 조회' })
  @ApiParam({ name: 'concertId', description: '콘서트 id' })
  @ApiCreatedResponse({
    description: '성공',
    type: ResGetDto,
  })
  concertDates(
    @Param() params: ConcertGetRequestDto
  ): Promise<ResGetDto> {
    return this.concertUsecase.dates(ConcertRequestCommand.of(params));
  }

  @Get('/:concertId/dates/:date/seats')
  @ApiOperation({ summary: '콘서트 좌석 조회' })
  @ApiParam({ name: 'concertId', description: '콘서트 id' })
  @ApiParam({ name: 'concertDate', description: '콘서트 날짜' })
  @ApiCreatedResponse({
    description: '성공',
    type: ResGetDto,
  })
  concertSeats(
    @Param() params: ConcertGetRequestDto
  ): Promise<ResGetDto> {
    return this.concertUsecase.seats(ConcertRequestCommand.of(params));
  }

}
