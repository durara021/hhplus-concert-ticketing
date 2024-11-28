# 인덱스 추가 시나리오

- ## 인덱스의 사전적 의미
  인덱스(Index)란 번역하면 "색인"이라는 의미를 가지고 있으며, 색인(索引)은 책 속의 낱말이나 구절, 또 이에 관련한 지시자를 찾아보기 쉽도록 일정한 순서로 나열한 목록을 가리킨다.

- ## DB에서 쓰이는 인덱스의 의미
  색인과 유사한 역할을 하며 전체 데이터를 탐색하지 않고 특정한 데이터를 빠르게 찾을수 있도록 도와주는 객체

- ## 인덱스의 장점
	- ### 검색 속도 향상 : 데이터를 정렬된 구조(보통 B+Tree)로 저장
		- order by 혹은 범위 검색에 유리.
	- ### 중복 방지 : unique 인덱스를 사용할 경우 적용된 컬럼의 데이터가 중복되지 않음.
	- ### 테이블의 데이터 row수가 많아질 수록 유리
		- 일일이 찾아다니는것 보다 어디에 있는지 확인하고 찾아가는것이 빠르다!
- ## 인덱스의 단점
	- ### 인덱스를 위한 별도의 저장공간이 필요하다.
		- 어디(value)에 뭐가(key) 있는지를 저장하는 공간!
	- ### 데이터의 변경이 많을 경우 인덱스 공간에 대한 데이터 및 정렬에 대한 메모리 소모가 필요하다
		- 정열에 대한 소모가 있음.
	- ### 데이터 중복도가 높을 경우 효율이 좋지 않다.
		- 데이터 카디널리티가 50%가 넘는다고 가정하면 목차를 찾고 -> 해당 데이터를 찾는것 보다 전체적으로 찾아보는것과 크게 차이가 나지 않을 수 있다.

- ## 인덱스 적용 옵션
	- ### 조건이 많이 걸리는 컬럼, 조회 시 정렬이 필요한 컬럼에 인덱스를 적용하는것이 유리하다.
		- 조회가 많이 되지 않는 컬럼의 인덱스는 공간만 차지할 확률이 높다.
	- ### 수정이 빈번하게 일어나는 컬럼은 설정하지 않는것이 좋다
		- 정열에 대한 소모가 있기 때문
	- ### 다른 테이블의 외래 컬럼이 되거나 참조키가 되는 경우에는 설정하는것이 매우 유리하다.

- ## 콘서트 티켓 예약 서비스에서의 적용 - PK 제외
	- ### 유저 테이블 : admin 페이지에 대한 요구사항이 없으므로 제외
	- ### 잔고 테이블 : userId 컬럼 - 충전/조회/결재 요구사항 구현 시 userId를 검증하는 로직이 쓰이기 때문
     ![잔액 테이블 구조](https://github.com/user-attachments/assets/da454bd9-0d39-4bf3-8be5-b42f706588f6)
	- ### 콘서트  테이블 : 콘서트 제목으로 검색하는 등의 요구사항이 없으므로 pass
	- ### 콘서트일정 테이블 : 콘서트 예약 가능한 날짜를 조회하는 요구사항에 따라 concertId(외래키로 설정할 가능성이 매우 높음 - 현재에는 없지만)에 적용
    ![콘서트 일정 테이블 구조](https://github.com/user-attachments/assets/9bd230ac-0118-4eca-a278-be460c245658)
	- ### 콘서트티켓 테이블 : concertPlanId(단일) 혹은 concertId, concertPlanId(복합) 으로 적용
    ![콘서트 티켓 테이블 구조](https://github.com/user-attachments/assets/3f8ef6a1-244d-41a5-a95a-44946c6c3fb1)
  - url이 restful 하려면 concertId가 포함되는게 좋다고 판단하므로 concertId, concertPlanId에 복합으로 적용하는게 유리할 것으로 예상
    - 인덱스_concertId_concertPlanId
    ![인덱스_concert_concertPlanId - select](https://github.com/user-attachments/assets/e8995bc0-020d-4cf3-a46d-625bc5aa945f)
    - 인덱스_concertPlanId                    
    ![인덱스_concertPlanId - 셀렉트](https://github.com/user-attachments/assets/2d72252c-3dbf-42f6-96e1-effc38d51c16)
    - 복합인덱스가 미세하게 빨랐으나 1000만건 기준 1000건의 검색에서 유의미한 차이는 없는것으로 판단
  - ### 예약 테이블 : 티켓에 대한 임시점유가 확정으로 바뀔 때 데이터가 삽입되는 테이블이며, 현재 요구사항에 필요한 데이터가 없다고 판단
    - 추후 통계 자료 등 요청사항이 생길 시 관리하는것이 유리하다고 판단.

- ## 인덱스 적용 vs 미적용 성능 비교!
  ### 동일한 셀렉트 쿼리 작성 시 - 인덱스 유무 / 복합인덱스 비교
  #### ![인덱스 x - 셀렉트](https://github.com/user-attachments/assets/f070a606-0541-4741-a1c9-95d2309f2ac8)

  #### 인덱스 미적용
    ####  ![인덱스 x - 카운트2](https://github.com/user-attachments/assets/5f3808a5-2c14-4844-b6d2-83b0e5a01070)
  #### 인덱스 적용 - concertId
    #### ![인덱스_concertPlanId - 셀렉트](https://github.com/user-attachments/assets/566933a6-3f81-4df7-810b-3fc57b2c50ef)
  #### 인덱스 적용 - concertId, concertPlanId
    #### ![인덱스_concert_concertPlanId - select](https://github.com/user-attachments/assets/f1670907-2084-4692-8290-d0f0b774b54a)

  ### 동일한 카운트 쿼리 작성 시 - status 인덱시 유무 비교
    - status 는 각각 1/3씩 temp, reservatable, confirmed로 설정
  #### status 인덱스 미적용
  ![no index status-select](https://github.com/user-attachments/assets/ebb325e3-5a6e-4ce4-aecd-8306244e5164)
  ![no index status-select_planId](https://github.com/user-attachments/assets/d8de1fc5-996d-4740-828e-8f1465789551)
  #### status 인덱스 적용
  ![index status-select](https://github.com/user-attachments/assets/fade6119-b67e-4783-bfd5-87012596bbd5)
  ![index status-select_planId](https://github.com/user-attachments/assets/a06b1ac6-fea1-4924-9fff-edb7d822e833)
  
# 결론!
  - ## 단일 인덱스 설정도 좋지만 쿼리의 조회 횟수에 따라 복합 인덱스도 충분히 고려할만하다.
  - ## 카디널리티가 어느정도 높더라도(33%) 라도 단일 조건의 검색의 경우 인덱스의 이점이 있으나 카디널리티가 상대적으로 낮은(PlanId, 0.02%)와 같이 설정될 경우 크게 의미가 없으므로 이런 부분을 잘 고려해서 index를 설정할 것.
