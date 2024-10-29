import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<AccountPostResponseDto>;

export class AccountPostResponseDto {
    @ApiProperty({ description: '계좌 소유자' })
    userId: number;  // 계좌 소유자
    @ApiProperty({ description: '충전하는 point 양' })
    amount: number; // 충전하는 point 양
    @ApiProperty({ description: '충전/사용 구분' })
    stat: string; // 충전/사용 구분
    @ApiProperty({ description: '등록일' })
    regDate: Date; // 등록일

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): AccountPostResponseDto;
  static of(partial: Part[]): AccountPostResponseDto[];
  static of(
    partial: Part | Part[]
  ): AccountPostResponseDto | AccountPostResponseDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new AccountPostResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountPostResponseDto>) {
    Object.assign(this, partial);
  }
  
}