type Part = Partial<AccountResponseModel>;

export class AccountResponseModel {
  id: number;       // 순번
  userId: number;   // 계좌 소유자
  balance: number; // 총액
  amount: number;  // 충전하는 point 양
  stat: string;    // 충전/사용 구분
  regDate: Date;   // 등록일
  version: number;
    
  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): AccountResponseModel;
  static of(partial: Part[]): AccountResponseModel[];
  static of(
    partial: Part | Part[]
  ): AccountResponseModel | AccountResponseModel[] {
      if(Array.isArray(partial)) return partial.map(partial => AccountResponseModel.of(partial));
      return new AccountResponseModel({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountResponseModel>) {
    Object.assign(this, partial);
  }
}