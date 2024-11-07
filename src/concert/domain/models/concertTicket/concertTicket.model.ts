type Part = Partial<ConcertTicketModel>;

export class ConcertTicketModel {

    concertTicketId : number;   // 자동 증가로 대기열 순번 역할 수행
    status          : string;   // 예약 상태
    concertId       : number;   // 콘서트 ID
    concertPlanId   : number;   // 콘서트 일정 ID
    concertSeatNum  : number;   // 콘서트 좌석번호
    concertDate     : Date;     // 콘서트 일정

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ConcertTicketModel;
    static of(partial: Part[]): ConcertTicketModel[];
    static of(
        partial: Part | Part[]
    ): ConcertTicketModel | ConcertTicketModel[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ConcertTicketModel({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertTicketModel>) {
        Object.assign(this, partial);
    }
  
}