# Redis 로직이관을 통한 성능 개선 보고서!

# 1. 왜 Redis인가!
## 검색 성능 향상!
- Redis는 기본적으로 인메모리 DB이기 때문에 데이터 추가 및 조회에 대한 성능이 RDBMS에 비해 10~100배 향상!
## 실시간 처리 및 대용량 처리 용이
- 대규모 동시 접속자 처리 시 실시간 처리에 유리!
- TTL설정을 통한 임시 데이터를 처리하기 용이

-----------------------------------
# 2. 콘서트 티켓팅 서비스에서 Redis 적용 사례
## * key 세팅 가이드 *
```'key':'대분류':`${대분류id}`:'중분류':`${중분류id`:…:`${keyValue}` ```
#
## * 각 데이터 별 eviction policy *
- 유저토큰 : TTL
- 대기열 : FIFO -> 사용자가 많을 경우 현재 대기열을 제외한 모든 데이터 삭제
- 사용열 : TTL -> 결제가 마무리 되면 삭제
- 콘서트 : TTL -> 콘서트 마지막 일정에 맞춰서 삭제
- 콘서트 일정 : TTL -> 하루마다 갱신 / 콘서트 일정 key -> 콘서트 일정 당일이 콘서트 시작시간이 되면 삭제
#
## 1. 유저 토큰
```ts
//유저 토큰 관리(String 자료구조 활용)
set(
    `userToken:${uuid}`,
    jwt.sign(...{`${uuid}, ${createAt}, ${expiryAt}, ${userId(redis에서만 저장)}`}),
    'EX', 1800, 
)
```
- Write-Through 전략 사용 
- 토큰 생성 url 접근 시 jwt 토큰 생성
- 클라이언트의 헤드에는 uuid, createAt, expiryAt 정보 주입
- redis와 클라이언트의 헤드에 각각 저장(redis에선 userId 추가)
- 유저토큰의 경우 DB CUD작업 시의 인증 역할을 하므로 과도하게 많아질 경우 서킷브레이커를 사용하여 DB에 저장하도록 유도
#
## 2. 대기열
```ts
// 대기열 관리(List 자료 구조 활용)
lPush(
    `queue:${queueNumber}`,
    `${uuid}`,
)

// 대기열 번호 관리(List 자료 구조 활용)
lPush(
    'queueNumber',
    `${queueNumber}`,
)

// 유저 토큰 재발급(String 자료구조 활용)
set(
    `userToken:${uuid}`,
    jwt.sign(...{`${uuid}, ${createAt}, ${expiryAt}, ${userId(redis에서만 저장)}, ${queueNumber}, ${queuePosition}`}),
    'EX', 3600, 
)
``` 
- Write-Behind 전략
- 대기열 진입 시 기존 토큰 삭제 후 대기열 정보가 포함된 토큰 발행 queueNo -> 내 대기열 번호, queueuPosition -> 대기열 내부의 내 위치
- 클라이언트 폴링 시 : 현재 사용중인 대기열의 숫자 + (내 대기열 번호 - 현재 사용중인 대기열 번호) * 하나의 대기열의 최대크기 +대기열 내부의 내 위치 를 계산한 값 반환
#
## 3. 사용열
```ts
// 사용열 관리(String 자료 구조 활용)
set(
    'active',
    `${uuid}`
)

// 폴링시 활용될 자료(Hash 자료구조 활용)
hset(
    'fallingReferenceInfo',
    {
        'userNumber':`${lastUserPosition}',
        'QueueNumber': `${usingQueueNumber}`,
    },
)    
```
- Write-Behind 전략 
- 사용이 허가된 사용자인지 식별하는 용도
- 현재 대기열 번호 및 대기열에서 마지막으로 나온 사람의 순서를 따로 관리하여 폴링 시 활용
#
## 4. 콘서트 예약
- 콘서트 좌석 임시 예약 관리
```ts
//콘서트 좌석 임시 예약 관리(String 자료구조 활용)
set(
    `currentConcertTicket:concert:${concertId}:concertPlan:${concertPlanId}`,
    `${concertSeatNumber}`,
    , 'NX', 'EX', 305
)
``` 
- Write-Behind 전략 사용
- NX 옵션을 활용하여 동시성 제어
- 5분의 임시예약 조건을 만족시키기 위한 305초 TTL 설정
#
- 콘서트 정보
```ts
// 콘서트 정보 관리(Hash 자료구조 활용)
hset(
    `concert:${concertId}`,
    {
        'concert':`${concertId}`, 'title': `${title}`, 'regdate': `${regdate}`
    }
)

// 콘서트 정보 key 관리
sadd( 'concert' , `${concertId}` )
```
#
- 콘서트 일정 정보
```ts
// 콘서트 일정 정보 관리(Hash 자료구조 활용)
hset(
    `concertPlan:concert:${concertId}:${concertPlanId}`,
    {
        'concertPlan':`${concertPlanId}`, 'concert':`${conertId}, 'concertDate':`${concertDate}`, 'isReservatable':`${isReservatable}, 'capacity':`{$capacity}`, 'current':${current}`
    }
)

// 콘서트 일정 key 관리
sadd(`concertPlan:concert:${conertId}` , `${concertPlan}`)
```
#
- concertId가 1번인 콘서트 중 예약 가능한 날짜 조회
```ts
// concertId가 1번인 concertPlan key 조회
const concertPlanKeys= await this.RedisClient.smembers(`concertPlan:concert:1:*`);

// 각 키에 대해 HGETALL로 해시 데이터를 조회
const concertPlans = await Promise.all(
    keys.map(async (key) => {
        const data = await this.RedisClient.hgetall(`concertTicket:concert:1:concertPlan:1:${key}`);
        if(data.isReservatable === 'true') return { key, data };
    })
);
```
-----------------------------------
# 3. 메모리 계산
## 저장에 사용되는 메모리 사용량 ≈ 255MB
### 65.0MB ≈ 18 MB + 40B + 0.1MB + 0.0005MB + 0.07MB + 3.0MB = 62MB
### 195MB = 65.0MB x 3(마스터1, 슬레이브2) 
### 195MB * 1.3(여유 메모리) = 255MB
### 1. 유저 토큰 (User Token) ≈ 18.0MB
- 데이터 구조: Hash
- 저장 방식: hset("userToken", info)
- 각 필드 크기:
    - key: 11bytes ("userToken")
    - uuid: 45(6+1+38)bytes ("uuid":"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
    - createAt: 32(10+1+21)bytes ("createAt":"YYYY-MM-DD HH:mm:ss")
    - expiryAt: 32(10+1+21)bytes ("expiryAt":"YYYY-MM-DD HH:mm:ss")
    - userId: 16(8+1+6)bytes ("userId":"0001")
    - queueNumber 20(13+1+6): ("queueNumber":"0001")
    - queuePosition 22(15+1+6): ("queuePosition":"0001")
- 대략 합계 = 180(167) bytes
- 10만 개 기준: 180bytes × 100,000 ≈ 18.0 MB

### 2. 대기열 (Queue) ≈ 40MB
- 데이터 구조: List
- 저장 방식: lPush("queue:${queueNumber}", uuid)
- 각 필드 크기
    - key: 12bytes ("queue:0001")
    - uuid : 38bytes ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
- 1명 대기열 진입 시 = 40(38) bytes
- 100만 명 기준: 40 bytes × 10,000,000 ≈ 40MB

### 3. 사용열 (Active Users) ≈ 0.04MB
- 데이터 구조: String
- 저장 방식: set("active", uuid)
- 각 필드 크기
    - key : 8bytes ("active")
    - uuid : 38bytes ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
- 1명 사용열 진입 시 = 40(38) bytes
- 동시 사용자가 1,000명이라고 가정
- 1,000명 기준: 40bytes × 1,000 ≈ 0.04MB

### 4. 콘서트 정보 (Concert Information) ≈ 0.0005MB
- 데이터 구조: Hash + Set
- 저장 방식 : hset("concert:${concertId}", info)
- 각 콘서트 정보 :
    - key : 14bytes ("concert:0001")
    - concertId: 18(11+1+6) bytes ("concertId":"0001")
    - title: 110bytes (14+1+92 bytes) ("concertTitle":"(한글 30자 기준)")
    - regDate: 21 bytes (8+1+12) ("regDate":"YYYY-MM-DD")
    - 18+110+21 = 150bytes
- 콘서트 key 정보 :
    - concertId: 6byte ("0001")
- 콘서트 필드 (concertId, title, regdate) = 약 170(156) bytes
- 콘서트 30개 기준: 170bytes × 30 ≈ 5.1KB

### 5. 콘서트 일정 정보 (Concert Schedule) ≈ 0.07MB
- 데이터 구조: Hash + Set
- 저장 방식 : hset("concertPlan:concert:${concertId}:${concertPlanId}", info)
- 각 콘서트 일정 정보
    - key : 30bytes ("concertPlan:concert:0001:0001")
    - concertPlanId : 22bytes (15+1+6) / ("concertPlanId":"0001")
    - concertDate : 45bytes (13+1+21) / ("concertDate":"YYYY-MM-DD HH:mm:ss")
    - isReservatable : 23bytes (16+1+6)/("isReservatable":"true")
    - capacity : 16bytes (10+1+5) / ("capacity":"001")
    - current : 15bytes (9+1+5) / ("capacity":"001")
    - 22+45+23+16+15 = 130(121)bytes
- concertPlan key 정보 :
    - concertPlan : 6byte ("0001")
- 각 콘서트 일정 정보 필드 (concertPlan, concertDate, isReservatable, capacity, current) = 약 150(130+6) bytes
- 30개의 콘서트, 각 콘서트 일정 15개 기준 : 150bytes × 30 x 15 ≈ 0.07MB

#### 6. 콘서트 티켓 동시성 제어 정보 (Concert Tickets) ≈ 3.0MB
- 데이터 구조: String
- 저장 방식 : set("concertTicket:concert:${concertId}:${concertPlanId}:${concertTicketId}", uuid)
- 각 필드 크기
    - key : 38bytes "concertTicket:concert:0001:0001:0001"
    - uuid : 38bytes ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
- 티켓 1개 임시예약 시 : 40(38)bytes
- 30개 콘서트, 15개의 일정, 150석 기준 : 40bytes x 30 x 15 x 150 ≈ 3.0MB
-----------------------------------
## 4. 주의사항
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
# 5. 주요 클라우드 서비스별 기본 제공 메모리 용량과 가격
## 1. Amazon ElastiCache for Redis
- 기본 인스턴스 (cache.t4g.micro):
- 메모리 용량: 약 0.555GB (555MB).
- 가격: 시간당 $0.015 → 약 19원/시간, 월 약 13,680원.
## 2. Microsoft Azure Cache for Redis
- Basic 계층 (C0):
- 메모리 용량: 0.25GB (250MB).
- 가격: 월 약 $40.15 → 약 49,000원/월.
## 3. Google Cloud Memorystore for Redis
- Basic 계층:
- 메모리 용량: 1GB.
- 가격: 시간당 $0.016 → 약 21원/시간, 월 약 15,200원.
## 4. 네이버 클라우드 플랫폼 (Cloud DB for Redis)
- db.t2.micro:
- 메모리 용량: 약 0.555GB (555MB).
- 가격: 약 15,000원/월.
## 5. Redis Enterprise Cloud
- 기본 플랜:
- 메모리 용량: 1GB.
- 가격: 월 약 $50 → 약 61,000원/월.
-----------------------------------
# 6. 결론 : 현재 기준 프리미엄 제외 1~5만원 사이로 사용자 환경을 개선할 수 있다!
 
