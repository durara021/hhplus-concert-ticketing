type Part = Partial<PaymentRequestCommand>;

export class PaymentRequestCommand {
  userId: number;
  reservationId: number;
  amount: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): PaymentRequestCommand;
  static of(partial: Part[]): PaymentRequestCommand[];
  static of(
    partial: Part | Part[]
  ): PaymentRequestCommand | PaymentRequestCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentRequestCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentRequestCommand>) {
    Object.assign(this, partial);
  }
}