type Part = Partial<ConcertPlanRequestEntity>;

export class ConcertPlanRequestEntity {
  
  concertId?        : number;    // 콘서트 ID
  concertIds?       : number[];  // 콘서트 ID(복수)
  concertPlanId?    : number;    // 콘서트 일정 ID
  concertDate?      : Date;      // 콘서트 날짜

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertPlanRequestEntity;
  static of(partial: Part[]): ConcertPlanRequestEntity[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanRequestEntity | ConcertPlanRequestEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanRequestEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanRequestEntity>) {
    Object.assign(this, partial);
  }
  
}