type Part = Partial<PaymentResponseModel>;

export class PaymentResponseModel {
  id: number;
  userId: number;
  reservationId: number;
  regDate: Date;
  version: number;
  
  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): PaymentResponseModel;
  static of(partial: Part[]): PaymentResponseModel[];
  static of(
    partial: Part | Part[]
  ): PaymentResponseModel | PaymentResponseModel[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentResponseModel({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentResponseModel>) {
      Object.assign(this, partial);
  }
  
}