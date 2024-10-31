type Part = Partial<AccountResponseCommand>;

export class AccountResponseCommand {
  id: number;          // 순번
  userId: number;      // 계좌 소유자
  balance: number;     // 총액
  amount: number;      // 충전하는 point 양
  stat: string;        // 충전/사용 구분
  regDate: Date;       // 등록일
  version: number;
  
  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): AccountResponseCommand;
  static of(partial: Part[]): AccountResponseCommand[];
  static of(
    partial: Part | Part[]
  ): AccountResponseCommand | AccountResponseCommand[] {
    if(Array.isArray(partial)) return partial.map(partial => AccountResponseCommand.of(partial));
    return new AccountResponseCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Part) {
    // 기본값을 설정하고 전개 연산자로 필드 덮어쓰기
    this.regDate = new Date();
    Object.assign(this, partial);
  }

}
