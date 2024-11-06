type Part = Partial<ConcertRequestModel>;

export class ConcertRequestModel {
  concertId       : number;         //콘서트ID
  concertIds      : number[] = [];  //콘서트ID(복수)
  concertPlanId       : number;         //콘서트ID
  concertPlanIds  : number[] = [];  //콘서트 일정 ID(복수)

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ConcertRequestModel;
  static of(partial: Part[]): ConcertRequestModel[];
  static of(
    partial: Part | Part[]
  ): ConcertRequestModel | ConcertRequestModel[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertRequestModel({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertRequestModel>) {
    Object.assign(this, partial);
  }

  updateConcertIds(newConcertIds: number[]) {
    this.concertIds = newConcertIds;
  }

  updateConcertPlanIds(newConcertPlanIds: number[]) {
    this.concertPlanIds = newConcertPlanIds;
  }
  
}