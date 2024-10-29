import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Unique } from 'typeorm';

type Part = Partial<ReservationEntity>;

@Entity('reservation')
@Unique(['mainCategory','subCategory', 'minorCategory'])
export class ReservationEntity {
  @PrimaryGeneratedColumn()
  id: number;  // 자동 증가로 대기열 순번 역할 수행
  
  @Column()
  mainCategory: number; // 예약 종류( 콘서트, 숙박 등 id )
  
  @Column()
  subCategory: number; // 예약 종류( 콘서트 일정, 숙박시설 등 id )
  
  @Column()
  minorCategory: number // 예약 종류( 콘서트 자리, 숙박시설 호실 등 id)
  
  @Column()
  userId: number; // 예약자 id
  
  @CreateDateColumn()
  regDate: Date; // 최초 예약일
  
  @Column({default: 'temp'})
  status: string; // 예약 상태 = 임시/확정/취소
  
  @UpdateDateColumn()
  modDate: Date; // 상태 변경일

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): ReservationEntity;
  static of(partial: Part[]): ReservationEntity[];
  static of(
    partial: Part | Part[]
  ): ReservationEntity | ReservationEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ReservationEntity({ ...partial });
  }
  
  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ReservationEntity>) {
      Object.assign(this, partial);
  }

}