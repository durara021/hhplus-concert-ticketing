type Part = Partial<ConcertPlanResponseModel>;

export class ConcertPlanResponseModel {
    concertPlanId   : number;   // 콘서트seq
    concertId       : number;   // 콘서트 ID
    concertDate     : Date;     // 콘서트 일정
    isReservatable  : boolean;  // 예약 가능 여부
    capacity        : number ;  // 콘서트 정원
    current         : number ;  // 콘서트 예약 인원
    reservableTickets : { seat: number, isReservable: boolean }[] = [];    // 예약 가능 좌석

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ConcertPlanResponseModel;
    static of(partial: Part[]): ConcertPlanResponseModel[];
    static of(
        partial: Part | Part[]
    ): ConcertPlanResponseModel | ConcertPlanResponseModel[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ConcertPlanResponseModel({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertPlanResponseModel>) {
        Object.assign(this, {
            concertPlanId: partial.concertPlanId ? Number(partial.concertPlanId) : undefined,
            concertId: partial.concertId ? Number(partial.concertId) : undefined,
            concertDate: partial.concertDate ? new Date(partial.concertDate) : undefined,
            isReservatable: partial.isReservatable !== undefined ? Boolean(partial.isReservatable) : false,
            capacity: partial.capacity ? Number(partial.capacity) : 0,
            current: partial.current ? Number(partial.current) : 0,
        });
    }

    updateIsReservatable(newIsReservatable: boolean) {
        this.isReservatable = newIsReservatable;
    }

    updateReservableTickets(reservableTickets: { seat: number, isReservable: boolean }[]) {
        this.reservableTickets = reservableTickets;
    }
    
}