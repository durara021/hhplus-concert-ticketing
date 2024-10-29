type Part = Partial<PaymentResponseCommand>;

export class PaymentResponseCommand {
  id: number;
  userId: number;
  reservationId: number;
  regDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): PaymentResponseCommand;
  static of(partial: Part[]): PaymentResponseCommand[];
  static of(
    partial: Part | Part[]
  ): PaymentResponseCommand | PaymentResponseCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentResponseCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentResponseCommand>) {
    Object.assign(this, partial);
  }
}