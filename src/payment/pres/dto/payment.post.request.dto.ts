import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<PaymentPostRequestDto>;

export class PaymentPostRequestDto {
  @ApiProperty({ description: '유저 id' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: '예약 id' })
  @IsInt()
  reservationId: number;

  @ApiProperty({ description: '가격' })
  @IsInt()
  amount: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): PaymentPostRequestDto;
  static of(partial: Part[]): PaymentPostRequestDto[];
  static of(
    partial: Part | Part[]
  ): PaymentPostRequestDto | PaymentPostRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentPostRequestDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentPostRequestDto>) {
      Object.assign(this, partial);
  }
}