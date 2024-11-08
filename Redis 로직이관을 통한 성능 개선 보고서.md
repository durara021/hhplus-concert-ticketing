# Redis 로직이관을 통한 성능 개선 보고서!

## 1. 왜 Redis인가!
  ### 검색 성능 향상!
  - Redis는 기본적으로 인메모리 DB이기 때문에 데이터 추가 및 조회에 대한 성능이 RDBMS에 비해 10~100배 향상!
  ### 실시간 처리 및 대용량 처리 용이
  - 대규모 동시 접속자 처리 시 실시간 처리에 유리!
  - TTL설정을 통한 임시 데이터를 처리하기 용이

-----------------------------------
## 2. 콘서트 티켓팅 서비스에서 Redis 적용 사례
  ### 유저 토큰
  - Write-Through 전략 사용 / String 자료구조 활용
  - ```ts
    set(
      userToken,
      jwt.sign(...info)
    )
    ```
  - 현재는 로그인이 없지만 사용자가 로그인을 할 경우 jwt 토큰을 발급하여
  - 클라이언트의 헤드에는 uuid, createAt, expiryAt 정보 주입
  - 서버에는 클라이언트의 정보 + userId, 대기열 진입 순서, 내 대기열 번호 정보 포함(30분 제한) => 제한시간이 만료된 토큰 자동 삭제 가능(*스케줄러를 제외할 수 있음)
  - 유저 토큰의 발급이 과다하게 많아질 경우 서킷브레이커를 사용하여 현재사용열에 존재하는 유저의 정보만 Redis에 남기고 삭제 후(이 시점부턴 DB에만 저장) 사용자열에 들어오는 유저의 유저토큰 정보 저장

  ### 대기열
  - Write-Behind 전략 / List 자료 구조 활용
  - ```ts
    lPush(
      `queue:${queueNumber}`,
      `${uuid}`
    )
    ``` 
  - 사용자가 대기열에 진입하게 될 경우 기존 사용자 토큰 삭제 -> 대기열 진입순서(queueNumber)가 들어간 사용자 토큰 발급(대략 1시간의 유효기간을 가짐 => 시간 변경 가능)
  - 클라이언트 폴링 시 : 현재 사용열에 있는 마지막 사람의 내 대기열 진입 순서 - 대기열 진입 순서 + 1 반환

  ### 사용열
  - Write-Behind 전략 / String 자료 구조 활용
  - ```ts
      set(
        'active',
        `${uuid}`
      )
    ```
  - 사용이 허가된 사용자인지 식별하는 용도
  - 대기열에서 마지막으로 나온 사람의 대기열진입순서를 따로 저장

  ### 콘서트 예약(Write-Behind 전략 / 콘서트 정보: hash데이터 타입 활용 + key관리 : set 데이터 타입 활용)
  - 콘서트 티켓 임시 예약의 동시서을 제어하기 위한 string 데이터 타입의 자료 추가
    ```ts
    set(
      `concertTicket:concert:${concertId}:concertPlan:${concertPlanId}`,
      `${concertSeatNumber}`
    )
    ```
  - 콘서트 정보 :
    ```ts
    hset(
      `concert:${concertId}`,
      {
        'concert':`${concertId}`, 'title': `${title}`, 'regdate': `${regdate}`
      }
    )
    ```
  - 콘서트 정보 key 관리 : ``` sadd( 'concert' , `${concertId}` ) ```

  - 콘서트 일정 정보 :
    ```ts
    hset(
      `concertPlan:concert:${concertId}:${concertPlanId}`,
      {
        'concertPlan':`${concertPlanId}`, 'concert':`${conertId}, 'concertDate':`${concertDate}`, 'isReservatable':`${isReservatable}, 'capacity':`{$capacity}`, 'current':${current}`
      }
    )
    ```
  - 콘서트 일정 key 관리 : ```sadd(`concertPlan:concert:${conertId}` , `${concertPlan}`)```

  - 콘서트 티켓 정보
    ```ts
    hset(
      `concertTicket:concert:${concertId}:concertPlan:${concertPlanId}:${concertTicketId}`,
      {
        'concertTicket':`${concertTicketId}, 'concert': `${concertId}, 'concertPlan': `${concertPlanId}, 'status': `${status}, 'concertSeatNum': `${concertSeatNum}`
      }
    )
    ```
  - 콘서트 티켓 정보 : ```sadd(`concertTicket:concert:${concertId}:concertPlan:${concertPlanId}` , `${concertTicketId}`)```

  - concertId가 1번인 콘서트 예약 가능한 콘서트 검색 시
    ```ts
    //concertId가 번인 콘서트 정보 조회
    const concertInfo = await this.RedisClient.hgetall('concert:1');
    
    //concertId가 1번인 key 조회
    const concertPlankeys = await this.RedisClient.smembers('concertPlan:concert:1');
    
    // 각 키에 대해 HGETALL로 해시 데이터를 조회
    const concertPlans = await Promise.all(
      keys.map(async (key) => {
        const data = await this.RedisClient.hgetall(`concertPlan:concert:1:${key}`);
        return { key, data };
      })
    );
    ```
  - concertId가 1번이고 concertPlanId가 1번인 콘서트 예약 가능한 좌석 조회시
    ```ts
    concertId가 1번인 콘서트 예약 가능한 콘서트 검색과 동일
  
    //concertId가 1번이고 concertPlanId가 1번인 key 조회
    const concertTicketkeys  = await this.RedisClient.smembers(`concertTicket:concert:1:concertPlan:1`);
  
    // 각 키에 대해 HGETALL로 해시 데이터를 조회
    const concertPlans = await Promise.all(
      keys.map(async (key) => {
        const data = await this.RedisClient.hgetall(`concertTicket:concert:1:concertPlan:1:${key}`);
        return { key, data };
      })
    );
    ```
  -----------------------------------
## 3. 메모리 계산
  ### 총 메모리 사용량 ≈ 1.7GB 
  #### 382.8 MB(6.8 MB + 360MB + 0.36MB + 0.6MB + 13.5MB + 0.54MB) x 3(마스터1, 슬레이브2) + 여유 메모리(전체의 30%)
  #### 1. 유저 토큰 (User Token)
  - 데이터 구조: String
  - 저장 방식: set(userToken, jwt.sign(...info))
  - 각 필드 크기:
    - uuid: 36 bytes
    - createAt: 10 bytes (epoch time format)
    - expiryAt: 10 bytes
    - userId: 8 bytes
    - 대기열 진입 순서: 4 bytes
  - 대략 합계 = 68 bytes
  - 10만 개 기준: 68bytes × 100,000 = 6.8 MB

  #### 2. 대기열 (Queue)
  - 데이터 구조: List
  - 저장 방식: lPush(queue:${queueNumber}, uuid)
  - 각 유저의 uuid (36 bytes)만 저장한다고 가정
  - 1명 대기열 진입 시 = 36 bytes
  - 1000만 명 기준: 36 bytes × 10,000,000 = 360MB

  #### 3. 사용열 (Active Users)
  - 데이터 구조: String
  - 저장 방식: set(active, uuid)
  - 필요 필드: uuid (36 bytes)만 사용한다고 가정
  - 동시 사용자가 10,000명이라고 가정
  - 10,000명 기준: 36bytes × 10,000 = 0.36MB

  #### 4. 콘서트 정보 (Concert Information)
  - 데이터 구조: Hash + Set
  - 각 콘서트 정보:
  - 콘서트 필드 (concertId, title, regdate) = 약 20 bytes
  - 콘서트 30개 기준: 20bytes × 30 = 0.6MB

  #### 5. 콘서트 일정 정보 (Concert Schedule)
  - 데이터 구조: Hash + Set
  - 각 콘서트 일정 정보 필드 (concertPlan, concertDate, isReservatable, capacity, current) = 약 30 bytes
  - 30개의 콘서트, 각 콘서트 일정 15개 기준 : 30bytes × 30 x 15 = 13.5MB

  #### 6. 콘서트 티켓 정보 (Concert Tickets)
  - 데이터 구조: Hash + Set
  - 각 티켓 정보 필드 (concertTicketId, concertId, concertPlanId, status, concertSeatNum) = 약 40 bytes
  - 평균 300개 좌석 기준: 1 티켓 = 40 bytes
  - 30개 콘서트, 각 콘서트 일정 15개, 각 좌석 300개 기준: 40bytes × 13,500 = 0.54MB

  -----------------------------------
## 4. Redis 사용 요금(2GB 기준)
  ### 1. AWS ElastiCache for Redis
  - 노드 유형: cache.t3.small (약 2.13GB 메모리)
  - 요금: 시간당 약 33.8원 (1,300 × 0.026 USD), 월 약 24,336원 (33.8원 × 24시간 × 30일 기준)
  ### 2. Azure Cache for Redis
  - 기본 계층 C1 (1GB 메모리, 2개 사용 기준):
    - 시간당 약 67.6원 (1,300 × 0.026 USD × 2), 월 약 48,672원
  - 표준 계층 C1 (1GB 메모리, 2개 사용 기준):
    - 시간당 약 85.8원 (1,300 × 0.033 USD × 2), 월 약 61,776원
  - 프리미엄 계층 P1 (6GB 메모리, 2GB 수준에 해당):
    - 시간당 약 715원 (1,300 × 0.55 USD), 월 약 515,100원
  ###3. Google Cloud Memorystore for Redis
  - 노드 유형: 약 2.5GB 메모리
    - 요금: 시간당 약 74.1원 (1,300 × 0.057 USD), 월 약 53,352원 (74.1원 × 24시간 × 30일 기준)
-----------------------------------
## 5. 주의사항
### 장애 예상 시나리오
- 메모리 부족 : 콘서트 예약이 시작된 후 콘서트에 대한 정보를 집어넣는게 아니라면 거의 대부분 유저토큰 때문에 터질 가능성이 높으나
  - 10만명이 넘을 경우 서킷브레이커를 활용해 DB에만 저장하게끔 하고 사용열에 들어올때마다 Redis와 동기화 시켜주는 전략 사용
- 높은 요청 수 : 대기열을 활용함으로 높은 요청 수에 대한 위험도 낮음
  - 대기열 순번 요청 폴링시 실제 카운트를 세는 것이 아닌 대기열 번호 * 전체 대기열 수 + 내 대기열 내의 순번 + 현재 사용중인 대기열의 남은 사용자 수로 간단히 계산 가능
- 대량의 키 및 데이터 저장 : TTL을 활용하한 제어
  - 콘서트 같은 경우 콘서트의 마지막 일정이 마무리 될 때의 시점으로 TTL 설정
  - 콘서트 일정은 각 일정에 맞춰 TTL 설정
  - 티켓의 경우 해당 일정의 모든 티켓이 예약될 때 트리거를 걸어 삭제 예정 -> 이후건은 DB활용
  - 대기열 => 사용될때마다 자동 삭제
  - 사용열 => 유저토큰과 동일한 TTL 설정
- 클러스터링 문제 : 3번 항목 참조
### 장애복구
- Master에서 장애 발생 시 slave 가 마스터로 승격 및 재기동된 슬레이브와 마스터의 데이터 동기화 시나리오 요구
- 모든 노드에서 동시에 장애 발생 시 서킷브레이커를 통해서 Redis와의 연동을 중단하고 DB로 요청(이후 구현 예정)
- Redis 복구 후 캐시 재구성 후 자동 재시도 요청(이후 구현 예정)
-----------------------------------
## 6. 결론 : 프리미엄 제외 2~5만원 사이로 사용자 환경을 개선할 수 있다!
 
