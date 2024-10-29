import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

type Part = Partial<SessionEntity>;

@Unique(['uuid'])
@Entity('session')
export class SessionEntity {
    @PrimaryGeneratedColumn()
    id: number;  // 자동 증가로 대기열 순번 역할 수행
    
    @Column()
    uuid: string;
    
    @Column()
    userId: number;
    
    @Column()
    status: string;
    
    @CreateDateColumn()
    regDate: Date;

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): SessionEntity;
    static of(partial: Part[]): SessionEntity[];
    static of(
      partial: Part | Part[]
    ): SessionEntity | SessionEntity[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new SessionEntity({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<SessionEntity>) {
        Object.assign(this, partial);
    }
    
}