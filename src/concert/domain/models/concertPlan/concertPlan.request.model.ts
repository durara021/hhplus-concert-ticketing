type Part = Partial<ConcertPlanRequestModel>;

export class ConcertPlanRequestModel {
  concertId: number;
  concertDate: Date;
  concertPlanId: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertPlanRequestModel;
  static of(partial: Part[]): ConcertPlanRequestModel[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanRequestModel | ConcertPlanRequestModel[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanRequestModel({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanRequestModel>) {
    Object.assign(this, partial);
  }

  updateSea
}