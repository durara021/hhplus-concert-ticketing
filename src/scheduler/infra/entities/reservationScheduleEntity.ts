export class ReservationSchedulerEntity {
    ids: number[] | null;      // 상태변경할 id 배열
    status: string;     // 변경할 상태
    modDate: Date;

      // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Partial<ReservationSchedulerEntity>): ReservationSchedulerEntity {
        return new ReservationSchedulerEntity({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationSchedulerEntity>) {
        Object.assign(this, partial);
    }
}