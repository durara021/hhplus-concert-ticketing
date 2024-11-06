import { ConcertPlanResponseCommand } from "src/concert/app/commands";

type Part = Partial<ConcertResponseModel>;

export class ConcertResponseModel {
    concertId       : number;   // 콘서트 ID
    concertTitle    : string;   // 콘서트 명
    reservableDates   : { date: Date, isReservable: boolean }[] = [];        // 예약 가능일
    

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

    updateReservableDates(reservableDates:{ date: Date, isReservable: boolean }[]){
        this.reservableDates = reservableDates;
    }

}