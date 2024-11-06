type Part = Partial<ConcertPlanRequestCommand>;

export class ConcertPlanRequestCommand {
    concertPlanId: number;      // 콘서트 일정 ID
    concertDate: Date ;         // 콘서트 일정

    // of 메서드: Partial 타입을 이용해 객체를 생성

    static of(partial: Part): ConcertPlanRequestCommand;
    static of(partial: Part[]): ConcertPlanRequestCommand[];
    static of(
        partial: Part | Part[]
    ): ConcertPlanRequestCommand | ConcertPlanRequestCommand[] {
        if(Array.isArray(partial)) return partial.map(partial => ConcertPlanRequestCommand.of(partial));
        return new ConcertPlanRequestCommand({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertPlanRequestCommand>) {
        Object.assign(this, partial);
    }
  
}