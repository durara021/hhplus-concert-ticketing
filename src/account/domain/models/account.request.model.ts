type Part = Partial<AccountRequestModel>;

export class AccountRequestModel {
  userId: number;
  balance: number;
  amount: number;
  status: string;
  createdAt: Date;

  // of 메서드: Part 타입을 이용해 객체를 생성
  static of(partial: Part): AccountRequestModel;
  static of(partial: Part[]): AccountRequestModel[];
  static of(
    partial: Part | Part[]
  ): AccountRequestModel | AccountRequestModel[] {
      if(Array.isArray(partial)) return partial.map(partial => AccountRequestModel.of(partial));
      return new AccountRequestModel({ ...partial });
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

  updateStatus(newStatus: string): void {
    this.status = newStatus;
  }
}
