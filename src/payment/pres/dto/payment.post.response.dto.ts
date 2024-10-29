import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<PaymentPostResponseDto>;

export class PaymentPostResponseDto {
  @ApiProperty({ description: '유저 id' })
  userId: number;
  @ApiProperty({ description: '예약 id' })
  reservationId: number;
  @ApiProperty({ description: '등록일' })
  regDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): PaymentPostResponseDto;
  static of(partial: Part[]): PaymentPostResponseDto[];
  static of(
    partial: Part | Part[]
  ): PaymentPostResponseDto | PaymentPostResponseDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentPostResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentPostResponseDto>) {
      Object.assign(this, partial);
  }
}