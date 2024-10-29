type Part = Partial<AccountCommand>;

export class AccountCommand {
    userId: number;
    amount: number;
  
    // of 메서드: Part 타입을 이용해 객체를 생성
    static of(partial: Part): AccountCommand;
    static of(partial: Part[]): AccountCommand[];
    static of(
      partial: Part | Part[]
    ): AccountCommand | AccountCommand[] {
        if(Array.isArray(partial)) return partial.map(partial => AccountCommand.of(partial));
        return new AccountCommand({ ...partial });
    }
  
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Part) {
      Object.assign(this, partial);
    }
  }
  