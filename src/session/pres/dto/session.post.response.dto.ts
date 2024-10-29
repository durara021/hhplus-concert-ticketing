import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<SessionPostResponseDto>;

export class SessionPostResponseDto {
  @ApiProperty({ description: 'uuid' })
  uuid: string;
  @ApiProperty({ description: '유저id' })
  userId: number;
  @ApiProperty({ description: '등록일' })
  regDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): SessionPostResponseDto;
  static of(partial: Part[]): SessionPostResponseDto[];
  static of(
    partial: Part | Part[]
  ): SessionPostResponseDto | SessionPostResponseDto[] {
    if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
    return new SessionPostResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<SessionPostResponseDto>) {
    Object.assign(this, partial);
  }
}