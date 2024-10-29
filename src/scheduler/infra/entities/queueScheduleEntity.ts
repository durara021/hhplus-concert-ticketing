export class QueueSchedulerEntity {
    ids: number[] | null;      // 상태변경할 id 배열
    capacity: number;   // 한번에 상태변경할 유저 값
    status: string;     // 변경할 상태
    modDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Partial<QueueSchedulerEntity>): QueueSchedulerEntity {
        return new QueueSchedulerEntity({ ...partial });
    }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<QueueSchedulerEntity>) {
        Object.assign(this, partial);
    }
}