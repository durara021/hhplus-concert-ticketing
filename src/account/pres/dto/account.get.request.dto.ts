// dto/account-charge-request.dto.ts
import { IsInt, IsPositive } from 'class-validator';

type Part = Partial<AccountPatchRequestDto>;

export class AccountPatchRequestDto {
  @IsInt()
  @IsPositive()
  userId: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): AccountPatchRequestDto;
  static of(partial: Part[]): AccountPatchRequestDto[];
  static of(
    partial: Part | Part[]
  ): AccountPatchRequestDto | AccountPatchRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new AccountPatchRequestDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountPatchRequestDto>) {
    Object.assign(this, partial);
  }
}