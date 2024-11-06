type Part = Partial<ConcertRequestCommand>;

export class ConcertRequestCommand {
  concertId   : number;   //콘서트ID
  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertRequestCommand;
  static of(partial: Part[]): ConcertRequestCommand[];
  static of(
    partial: Part | Part[]
  ): ConcertRequestCommand | ConcertRequestCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertRequestCommand({ ...partial });
  }
  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertRequestCommand>) {
    Object.assign(this, partial);
  }
  
}