type Part = Partial<ConcertTicketResponseCommand>;

export class ConcertTicketResponseCommand {

    concertId       : number;   // 콘서트 ID
    concertPlanId   : number;   // 콘서트 일정 ID
    concertSeatNum  : number;   // 콘서트 좌석번호
    concertDate     : Date;     // 콘서트 일정

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ConcertTicketResponseCommand;
    static of(partial: Part[]): ConcertTicketResponseCommand[];
    static of(
        partial: Part | Part[]
    ): ConcertTicketResponseCommand | ConcertTicketResponseCommand[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ConcertTicketResponseCommand({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertTicketResponseCommand>) {
        Object.assign(this, partial);
    }
  
}