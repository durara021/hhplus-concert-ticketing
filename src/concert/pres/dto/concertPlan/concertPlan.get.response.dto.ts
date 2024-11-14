import { IsInt, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<ConcertPlanGetResponseDto>;

export class ConcertPlanGetResponseDto {
  @ApiProperty({ description: '콘서트 id' })
  @IsInt()
  concertId: number;
  
  @ApiProperty({ description: '콘서트 일정 ID' })
  @IsInt()
  concertPlanId: number;

  @ApiProperty({ description: '콘서트 날짜' })
  @IsDateString()
  concertDate: Date;

  @ApiProperty({ description: '예약 가능 좌석' })
  reservableTickets?: { seat: number, isReservable: boolean }[] = [];



  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ConcertPlanGetResponseDto;
  static of(partial: Part[]): ConcertPlanGetResponseDto[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanGetResponseDto | ConcertPlanGetResponseDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanGetResponseDto({ ...partial });
  }
  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanGetResponseDto>) {
    Object.assign(this, partial);
  }

}