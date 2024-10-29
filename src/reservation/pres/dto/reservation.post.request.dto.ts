import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<ReservationPostRequestDto>;

export class ReservationPostRequestDto {
    @ApiProperty({ description: '유저 id' })
    @IsInt()
    mainCategory: number;
    
    @ApiProperty({ description: '예약 대분류 id' })
    @IsInt()
    subCategory: number;
    
    @ApiProperty({ description: '예약 소분류 id' })
    @IsInt()
    minorCategory: number;
    
    @ApiProperty({ description: '예약자' })
    @IsInt()
    userId: number;

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ReservationPostRequestDto;
    static of(partial: Part[]): ReservationPostRequestDto[];
    static of(
      partial: Part | Part[]
    ): ReservationPostRequestDto | ReservationPostRequestDto[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ReservationPostRequestDto({ ...partial });
    }
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationPostRequestDto>) {
        Object.assign(this, partial);
    }
}