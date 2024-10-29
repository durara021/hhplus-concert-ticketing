type Part = Partial<ConcertResponseModel>;

export class ConcertResponseModel {
    id: number ;         // 콘서트seq
    concertId: number ; // 콘서트 ID
    concertDate: Date ; // 콘서트 일정
    concertDates: Date[] = [] ;
    concertSeats: number[] = [] ;
    capacity: number ;  // 콘서트 정원
    current:number ;    // 콘서트 예약 인원

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ConcertResponseModel;
    static of(partial: Part[]): ConcertResponseModel[];
    static of(
        partial: Part | Part[]
    ): ConcertResponseModel | ConcertResponseModel[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ConcertResponseModel({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertResponseModel>) {
        Object.assign(this, partial);
    }

    updateConcertDates(newConcertDates: Date[]){
        this.concertDates = newConcertDates;
    }

}