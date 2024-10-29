import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<ReservationPostResponseDto>;

export class ReservationPostResponseDto {
    @ApiProperty({ description: '예약 구분' })
    mainCategory: number;
    @ApiProperty({ description: '예약 대분류 id' })
    subCategory: number;
    @ApiProperty({ description: '예약 소분류 id' })
    minorCategory: number;
    @ApiProperty({ description: '예약자' })
    userId: number;
    @ApiProperty({ description: '등록일' })
    regDate: Date;
    @ApiProperty({ description: '예약상태' })
    status: string;
    @ApiProperty({ description: '수정일' })
    modDate: Date | null;

      // of 메서드: Partial 타입을 이용해 객체를 생성
      static of(partial: Part): ReservationPostResponseDto;
      static of(partial: Part[]): ReservationPostResponseDto[];
      static of(
        partial: Part | Part[]
      ): ReservationPostResponseDto | ReservationPostResponseDto[] {
          if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
          return new ReservationPostResponseDto({ ...partial });
      }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationPostResponseDto>) {
        Object.assign(this, partial);
    }
}