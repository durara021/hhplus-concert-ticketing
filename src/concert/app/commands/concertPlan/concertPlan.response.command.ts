type Part = Partial<ConcertPlanResponseCommand>;

export class ConcertPlanResponseCommand {
    concertId     : number;         // 콘서트 ID
    concertPlanId : number;         // 콘서트seq
    concertDate   : Date;           // 콘서트 일정
    capacity      : number;         // 콘서트 정원
    current       : number;         // 콘서트 예약 인원
    concertSeats  : number[] = [];  // 콘서트 좌석(복수)

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertPlanResponseCommand;
  static of(partial: Part[]): ConcertPlanResponseCommand[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanResponseCommand | ConcertPlanResponseCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanResponseCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanResponseCommand>) {
    Object.assign(this, partial);
  }
  
}