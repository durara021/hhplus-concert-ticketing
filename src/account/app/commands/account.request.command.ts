type Part = Partial<AccountRequestCommand>;

export class AccountRequestCommand {
    userId: number;
    amount: number;
    eventId: number;
    // of 메서드: Part 타입을 이용해 객체를 생성
    static of(partial: Part): AccountRequestCommand;
    static of(partial: Part[]): AccountRequestCommand[];
    static of(
      partial: Part | Part[]
    ): AccountRequestCommand | AccountRequestCommand[] {
        if(Array.isArray(partial)) return partial.map(partial => AccountRequestCommand.of(partial));
        return new AccountRequestCommand({ ...partial });
    }
  
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Part) {
      Object.assign(this, partial);
    }
  }
  