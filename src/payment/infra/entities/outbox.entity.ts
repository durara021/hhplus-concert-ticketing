import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
  
type Part = Partial<OutBoxEntity>;

@Entity('outbox')
export class OutBoxEntity {
    @PrimaryGeneratedColumn() // UUID 형식의 기본 키
    id: number;

    @Column({ length: 255 })
    eventId: number; // Kafka 또는 메시징 시스템의 토픽 이름
    
    @Column({ length: 255 })
    topic: string; // Kafka 또는 메시징 시스템의 토픽 이름

    @Column({ length: 255 })
    worker: string; // 수신인 / 발신인

    @Column({ nullable: false })
    payload: string; // 이벤트 데이터 (JSON)

    @Column({ type: 'varchar', length: 20, default: 'send' })
    status: string; // 처리 상태 (예: 'SEND', 'RECEIVE')

    @CreateDateColumn()
    createdAt: Date; // 이벤트 생성 시각

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): OutBoxEntity {
        return new OutBoxEntity({ ...partial });
    }
    
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<OutBoxEntity>) {
        Object.assign(this, partial);
    }

}
