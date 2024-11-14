import { ConcertPlanResponseCommand } from "../concertPlan/concertPlan.response.command";

type Part = Partial<ConcertResponseCommand>;

export class ConcertResponseCommand {
  concertId         : number;   // 콘서트 ID
  concertTitle      : string;   // 콘서트 타이틀
  reservableDates   : { date: Date, isReservable: boolean }[];   // 예약 가능일

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ConcertResponseCommand;
  static of(partial: Part[]): ConcertResponseCommand[];
  static of(
    partial: Part | Part[]
  ): ConcertResponseCommand | ConcertResponseCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertResponseCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertResponseCommand>) {
    Object.assign(this, partial);
  }
  
}