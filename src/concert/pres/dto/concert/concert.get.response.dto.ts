import { ApiProperty } from "@nestjs/swagger";
import { ConcertPlanGetResponseDto } from "../concertPlan/concertPlan.get.response.dto";

type Part = Partial<ConcertGetResponseDto>;

export class ConcertGetResponseDto {
  @ApiProperty({ description: '공연 번호' })
  concertId: number;
  @ApiProperty({ description: '공연일정 타이틀' })
  concertTitle: string;
  @ApiProperty({ description: '공연 예약 가능 날짜' })
  reservableDates?: { date: Date, isReservable: boolean }[] = [];

  
  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ConcertGetResponseDto;
  static of(partial: Part[]): ConcertGetResponseDto[];
  static of(
    partial: Part | Part[]
  ): ConcertGetResponseDto | ConcertGetResponseDto[] {
    if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
    return new ConcertGetResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertGetResponseDto>) {
    Object.assign(this, partial);
  }
  
}