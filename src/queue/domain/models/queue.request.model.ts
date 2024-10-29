type Part = Partial<QueueRequestModel>;

export class QueueRequestModel {
  id: number;
  userId: number;
  uuid: string;
  myPosition: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): QueueRequestModel;
  static of(partial: Part[]): QueueRequestModel[];
  static of(
    partial: Part | Part[]
  ): QueueRequestModel | QueueRequestModel[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueueRequestModel({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueueRequestModel>) {
      Object.assign(this, partial);
  }

  updateMyPosition(newMyPosition: number) {
      this.myPosition = newMyPosition;
  }
}