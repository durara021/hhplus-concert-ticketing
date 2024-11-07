import { BadRequestException } from "@nestjs/common";

type Part = Partial<AccountRequestModel>;

export class AccountRequestModel {
  userId: number;
  balance: number|null|undefined;
  amount: number;
  stat: string|null|undefined;
  createdAt: Date;
  version: number;

  // of 메서드: Part 타입을 이용해 객체를 생성
  static of(partial: Part): AccountRequestModel;
  static of(partial: Part[]): AccountRequestModel[];
  static of(
    partial: Part | Part[]
  ): AccountRequestModel | AccountRequestModel[] {
      if(Array.isArray(partial)) return partial.map(partial => AccountRequestModel.of(partial));
      const model = new AccountRequestModel({ ...partial })
      model.validate(); // 생성 시 유효성 검사 수행
      return model;
  }

  validate(): void {
    // userId: 반드시 양수인 number여야 합니다.
    if (typeof this.userId !== 'number' || this.userId <= 0) {
      throw new BadRequestException('옳지 못한 요청입니다: userId는 양수여야 합니다.');
    }

    // balance: number | null | undefined - 0 이상의 숫자이거나 null, undefined여야 합니다.
    if (
      this.balance !== undefined && this.balance !== null &&
      (typeof this.balance !== 'number' || this.balance < 0)
    ) {
      throw new BadRequestException('옳지 못한 요청입니다: balance는 0 이상의 숫자, null 또는 undefined여야 합니다.');
    }

    // amount: 반드시 0 이상인 number여야 합니다.
    if (
      this.amount !== undefined && this.amount !== null &&
      typeof this.amount !== 'number' || this.amount < 0
    ) {
      throw new BadRequestException('옳지 못한 요청입니다: amount는 0 이상의 숫자여야 합니다.');
    }

    // stat: string | null | undefined - 비어있지 않은 문자열이거나 null, undefined여야 합니다.
    if (
      this.stat !== undefined && this.stat !== null &&
      (typeof this.stat !== 'string' || !this.stat.trim())
    ) {
      throw new BadRequestException('옳지 못한 요청입니다: stat는 비어있지 않은 문자열, null 또는 undefined여야 합니다.');
    }
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Part) {
    // 기본값 설정 및 필드 덮어쓰기
    this.createdAt = new Date();
    Object.assign(this, partial);
  }

  updateAmount(newAmount: number): void {
    this.amount = newAmount;
  }

  updateBalance(newBalance: number): void {
    this.balance = newBalance;
  }

  updateStat(newStat: string): void {
    this.stat = newStat;
  }

  updateVersion(newVersion: number) : void {
    this.version = newVersion;
  }

}
