type Part = Partial<ReservationRequestCommand>;

export class ReservationRequestCommand {
    mainCategory: number;
    subCategory: number;
    minorCategory: number;
    userId: number;

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ReservationRequestCommand;
    static of(partial: Part[]): ReservationRequestCommand[];
    static of(
      partial: Part | Part[]
    ): ReservationRequestCommand | ReservationRequestCommand[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ReservationRequestCommand({ ...partial });
    }
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationRequestCommand>) {
        Object.assign(this, partial);
    }
}