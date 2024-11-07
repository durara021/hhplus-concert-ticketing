import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<ConcertGetRequestDto>;

export class ConcertGetRequestDto {
  @ApiProperty({ description: '콘서트 id' })
  @IsInt()
  concertId: number;
  
  @ApiProperty({ description: '콘서트 날짜' })
  @IsDateString()
  concertDate?: string;


  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertGetRequestDto;
  static of(partial: Part[]): ConcertGetRequestDto[];
  static of(
    partial: Part | Part[]
  ): ConcertGetRequestDto | ConcertGetRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertGetRequestDto({ ...partial });
  }
  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertGetRequestDto>) {
    Object.assign(this, partial);
  }
}