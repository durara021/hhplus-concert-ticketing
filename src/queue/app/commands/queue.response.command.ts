type Part = Partial<QueueResponseCommand>;

export class QueueResponseCommand {
  id: number;  // 자동 증가로 대기열 순번 역할 수행
  userId: number;  // 사용자 ID
  uuid: string;  // 세션 식별을 위한 UUID
  status: string;
  createdAt: Date;  // 생성 시간
  updatedAt: Date ;  // 수정 시간

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): QueueResponseCommand;
  static of(partial: Part[]): QueueResponseCommand[];
  static of(
    partial: Part | Part[]
  ): QueueResponseCommand | QueueResponseCommand[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueueResponseCommand({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueueResponseCommand>) {
      Object.assign(this, partial);
  }
}