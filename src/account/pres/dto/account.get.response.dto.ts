import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<AccountGetResponseDto>;

export class AccountGetResponseDto {
    @ApiProperty({ description: '계좌 소유자' })
    userId: number;

    @ApiProperty({ description: '총액' })
    balance: number; // 총액

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): AccountGetResponseDto;
  static of(partial: Part[]): AccountGetResponseDto[];
  static of(
    partial: Part | Part[]
  ): AccountGetResponseDto | AccountGetResponseDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new AccountGetResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountGetResponseDto>) {
    Object.assign(this, partial);
  }
}
