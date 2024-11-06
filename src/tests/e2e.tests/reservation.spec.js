import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 1000,             // 가상 사용자 수 (100명)
    duration: '1s',      // 테스트 지속 시간
};

export default function () {
    const url = 'http://localhost:3000/reservations';  // 예약 API URL
    const payload = JSON.stringify({
        mainCategory: 1,
        subCategory: 1,
        minorCategory: 1,
        userId: Math.floor(Math.random() * 1000) + 1, // 각 요청마다 고유의 userId 부여
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 예약 요청 보내기
    let res = http.post(url, payload, params);

    // 응답 상태와 시간 체크
    const success = check(res, {
        'is status 200 or 409': (r) => r.status === 201 || r.status === 409,  // 201: 예약 성공, 409: 이미 점유된 좌석
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    // 성공 및 실패 로그 출력
    if (res.status === 201) {
        console.log(`성공: userId ${payload.userId} - 좌석 예약 완료`);
    } else if (res.status === 409) {
        console.log(`실패: userId ${payload.userId} - 좌석 이미 점유됨`);
    }

    sleep(1);
}
