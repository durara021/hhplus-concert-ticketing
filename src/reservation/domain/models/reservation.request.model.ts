export class ReservationRequestModel {
    id: number;                  // 예약 ID
    ids: number[];
    userId: number;              // 사용자 ID
    mainCategory: number;           // 대분류
    subCategory: number;            // 중분류
    minorCategory: number;          // 소분류
    minorCategories: number[];          // 소분류
    status: string;              // 예약 상태
      
    updateStatus(newStatus: string) {
        this.status = newStatus;
    }

    updateMinorCategories(newMinorCategories: number[]) {
        this.minorCategories = newMinorCategories;
    }

  // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Partial<ReservationRequestModel>): ReservationRequestModel;
    static of(partial: Partial<ReservationRequestModel>): ReservationRequestModel;
    static of(partial: Partial<ReservationRequestModel>): ReservationRequestModel {
        return new ReservationRequestModel({ ...partial });
    }
    
    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ReservationRequestModel>) {
        Object.assign(this, partial);
    }
}