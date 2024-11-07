import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 100,             // 가상 사용자 수 (100명)
    duration: '1s',      // 테스트 지속 시간
};

export default function () {
    const url = 'http://localhost:3000/payments';  // 예약 API URL
    const payload = JSON.stringify({
        "amount" : 1000, // 각 요청마다 고유의 userId 부여
        "reservationId" : 1,
        "userId" : 1,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 예약 요청 보내기
    let res = http.post(url, payload, params);

    // 응답 상태와 시간 체크
    check(res, {
        'is status 200 or 409': (r) => r.status === 201 || r.status === 409,  // 200: 예약 성공, 409: 이미 점유된 좌석
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
