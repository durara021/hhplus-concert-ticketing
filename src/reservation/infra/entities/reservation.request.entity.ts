type Part = Partial<ReservationRequestEntity>;

export class ReservationRequestEntity {
    id: number;  // 자동 증가로 대기열 순번 역할 수행
    ids: number[];
    mainCategory: number; // 예약 종류( 콘서트, 숙박 등 id )
    subCategory: number; // 예약 종류( 콘서트 일정, 숙박시설 등 id )
    minorCategory: number // 예약 종류( 콘서트 자리, 숙박시설 호실 등 id)
    status: string; // 예약 상태 = 임시/확정/취소

    // of 메서드: Partial 타입을 이용해 객체를 생성

    static of(partial: Part): ReservationRequestEntity;
    static of(partial: Part[]): ReservationRequestEntity[];
    static of(
      partial: Part | Part[]
    ): ReservationRequestEntity | ReservationRequestEntity[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ReservationRequestEntity({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationRequestEntity>) {
        Object.assign(this, partial);
    }
}