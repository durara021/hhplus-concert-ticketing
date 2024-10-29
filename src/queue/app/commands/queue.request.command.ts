export class QueueRequestCommand {
    id: number;
    userId: number;
    uuid: string;

  // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Partial<QueueRequestCommand>): QueueRequestCommand {
        return new QueueRequestCommand({ ...partial });
    }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<QueueRequestCommand>) {
        Object.assign(this, partial);
    }
}