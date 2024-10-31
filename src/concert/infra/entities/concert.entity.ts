import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

type Part = Partial<ConcertEntity>;

@Entity('concert')
export class ConcertEntity {
  @PrimaryGeneratedColumn()
  concertId: number;  // 자동 증가로 대기열 순번 역할 수행

  @Column()
  title: string;  // 콘서트명

  @CreateDateColumn()
  regDate: Date; // 등록일
  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertEntity;
  static of(partial: Part[]): ConcertEntity[];
  static of(
    partial: Part | Part[]
  ): ConcertEntity | ConcertEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertEntity>) {
    Object.assign(this, partial);
  }
  
}