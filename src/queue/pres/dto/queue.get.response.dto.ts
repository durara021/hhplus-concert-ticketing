import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<QueueGetResponseDto>;

export class QueueGetResponseDto {
  @ApiProperty({ description: '대기열 순번' })
  position: number;
  @ApiProperty({ description: '상태' })
  status: string;
    
  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): QueueGetResponseDto;
  static of(partial: Part[]): QueueGetResponseDto[];
  static of(
    partial: Part | Part[]
  ): QueueGetResponseDto | QueueGetResponseDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueueGetResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueueGetResponseDto>) {
      Object.assign(this, partial);
  }

}