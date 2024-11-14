import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

type Part = Partial<UserEntity>;

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;  // 자동 증가로 대기열 순번 역할 수행
    
    @Column()
    name: string;  // 예약 종류
    
    @Column()
    account: number;
    
    @CreateDateColumn()
    regDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): UserEntity;
  static of(partial: Part[]): UserEntity[];
  static of(
    partial: Part | Part[]
  ): UserEntity | UserEntity[] {
    if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
    return new UserEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}