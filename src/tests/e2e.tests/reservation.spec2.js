async function sendRequests() {
    const requests = Array.from({ length: 100 }).map(() =>
      fetch('http://localhost:3000/users/11/point', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ amount: 10_000 }),
      }),
    );
  
    try {
      const responses = await Promise.all(requests);
  
      // 응답 결과 확인
      const results = await Promise.all(
        responses.map(async (response, index) => {
          const data = await response.json();
          return {
            index,
            status: response.status,
            data,
          };
        }),
      );
      // 성공/실패 카운트
      const successCount = results.filter((r) => r.status === 201).length;
      const failCount = results.filter((r) => r.status !== 201).length;
  
      console.log(`성공: ${successCount}, 실패: ${failCount}`);
  
      return results;
    } catch (error) {
      console.error('요청 실패:');
      throw error;
    }
  }
  
  // 실행
  sendRequests()
    .then((results) => {
      console.log(
        '완료:',
        results.filter((i) => i.status !== 409).map((i) => i.index),
      );
      console.log(
        '실패:',
        results.filter((i) => i.status === 409).map((i) => i.index),
      );
    })
    .catch((error) => console.error('에러 발생:', error));