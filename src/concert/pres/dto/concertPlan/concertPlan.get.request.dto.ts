import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<ConcertPlanGetRequestDto>;

export class ConcertPlanGetRequestDto {
  @ApiProperty({ description: '콘서트 id' })
  @IsInt()
  concertId: number;
  
  @ApiProperty({ description: '콘서트 일정 ID' })
  @IsInt()
  concertPlanId: number;

  @ApiProperty({ description: '콘서트 날짜' })
  @IsDateString()
  concertDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ConcertPlanGetRequestDto;
  static of(partial: Part[]): ConcertPlanGetRequestDto[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanGetRequestDto | ConcertPlanGetRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanGetRequestDto({ ...partial });
  }
  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanGetRequestDto>) {
    Object.assign(this, partial);
  }
}