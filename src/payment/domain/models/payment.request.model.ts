type Part = Partial<PaymentRequestModel>;

export class PaymentRequestModel {
    userId: number;
    reservationId: number;
    version: number;
    // of 메서드: Partial 타입을 이용해 객체를 생성

    static of(partial: Part): PaymentRequestModel;
    static of(partial: Part[]): PaymentRequestModel[];
    static of(
      partial: Part | Part[]
    ): PaymentRequestModel | PaymentRequestModel[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new PaymentRequestModel({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<PaymentRequestModel>) {
        Object.assign(this, partial);
    }
}