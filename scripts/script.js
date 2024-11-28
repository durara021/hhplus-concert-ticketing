import http from 'k6/http';
import { check, sleep } from 'k6';

// 테스트 옵션 설정
export const options = {
  stages: [
    { duration: '10s', target: 500 }, // 10초 동안 500명의 가상 사용자 도달
    { duration: '10s', target: 500 }, // 500명 유지
    { duration: '10s', target: 0 },   // 10초 동안 사용자 종료
  ],
};

// 테스트 스크립트
export default function () {
  // 랜덤 숫자 생성 (1~20 범위)
  const randomNumber = Math.floor(Math.random() * 20) + 1;

  // URL 정의
  const urls = [
    `http://localhost:3000/${randomNumber}/dates`,
    `http://localhost:3000/${randomNumber}/dates/seats`,
    `http://localhost:3000/reservations`,
  ];

  // 랜덤 URL 선택
  const url = urls[Math.floor(Math.random() * urls.length)];

  if (url.includes('/reservations')) {
    // POST 요청: reservations URL
    const payload = JSON.stringify({
      mainCategory: 1,
      subCategory: 1,
      minorCategory: Math.floor(Math.random() * 50) + 1, // 1~50 사이의 랜덤 minorCategory
      userId: Math.floor(Math.random() * 1000) + 1,      // 1~1000 사이의 랜덤 userId
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // HTTP POST 요청
    const res = http.post(url, payload, params);

    // 응답 상태와 시간 체크
    check(res, {
      'status is 201 or 409': (r) => r.status === 201 || r.status === 409,  // 201: 예약 성공, 409: 이미 점유된 좌석
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    // 성공 및 실패 로그 출력
    const responseData = JSON.parse(payload);
    if (res.status === 201) {
      console.log(`성공: userId ${responseData.userId}, minorCategory ${responseData.minorCategory} - 좌석 예약 완료`);
    } else if (res.status === 409) {
      console.log(`실패: userId ${responseData.userId}, minorCategory ${responseData.minorCategory} - 좌석 이미 점유됨`);
    }
  } else {
    // GET 요청: dates 또는 dates/seats URL
    const res = http.get(url);

    // 응답 상태 확인
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  }

  // 1초 대기
  sleep(1);
}
