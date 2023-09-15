# 🎇 Freely B

## 🎖️Node.js 6기 챌린지 B팀

팀장 : 강영규 <br>
부팀장 : 류원희<br>
팀원 : 박민영, 김종현<br>

# 🎥 Freely B - 쉽고 자유로운 실시간 스트리밍 플랫폼

![Group 297420](https://github.com/cooderyg/streaming-platform/assets/122774009/fb109816-404a-4381-8d61-ec69f65cbe30)

# 📣 프로젝트 소개
`Freely B`는 HLS 방식을 이용한 실시간 방송 스트리밍 서비스 입니다.

## 서비스 기획 배경

누구나 쉽고 자유롭게 방송할 수 있는 실시간 스트리밍 방송 플랫폼을 만들고자 하였습니다.  
> 📌 서비스 바로가기: https://freelyb.site  
> 📌 서비스 이용 안내: [링크](https://truthful-actor-498.notion.site/Freely-B-24175c3b86da4ccbba357adf11dc864d?pvs=4)

# ⚙️ 서비스 아키텍쳐 소개

![20230912_170920](https://github.com/cooderyg/streaming-platform/assets/122774009/74ac904a-c68b-417f-bba7-5c3b3711e814)

## 사용한 기술

|                 |                                                                                                                        |
| :-------------: | :--------------------------------------------------------------------------------------------------------------------- |
|     NestJS      | Express.js보다 구조화된 코드 작성에 유리하여 팀 단위 협업에 좋으며, 확장성이 좋다고 판단                               |
|      MySQL      | 서비스 내 데이터들 간의 복잡한 관계를 관리하기 위해 관계형 데이터베이스 사용                                           |
|     MongoDB     | 동시 다발적으로 발생되는 채팅 데이터를 보다 빠르게 저장하기 위해 사용                                                  |
|      RTMP       | 스트리머가 방송 설정을 하기 간편하고, 스트리머의 영상을 Node.js 서버에서 HLS방식으로 재가공하기에 가장 용이하다고 판단 |
|     FFmpeg      | RTMP로 전송받은 영상을 HLS방식으로 트랜스먹싱 하기 적합                                                                |
|       HLS       | 레이턴시가 조금 길지만 webRTC 대비 다수의 연결에 훨씬 안정적으로 영상을 스트리밍 할 수 있음                            |
|    Socket.IO    | 웹소켓 방식과 폴링 방식을 모두 지원하는 라이브러리로, 채팅기능 및 알림 구현 등을 위해 사용                             |
|   Redis Cloud   | 대규모의 읽기 발생 시 지연시간을 줄이기 위해 사용                                                                      |
|     AWS S3      | 채널 이미지, 스트리밍 영상 및 m3u8 파일 업로드를 위해 사용                                                             |
| AWS Cloud Front | S3에 업로드 된 데이터를 캐싱하여 빠르게 제공하기 위해 사용                                                             |
| Elastic Search  | 빠르고 정확한 검색 구현 및 검색어 자동완성 기능을 위해 사용                                                            |
|     Docker      | 여러 개의 프로세스를 컨테이너화 하여 동시에 안정적으로 서비스하기 위해 사용                                            |

---

# 📐 ERD 설계

![freelyb-erd](https://github.com/cooderyg/streaming-platform/assets/122774009/8d954128-252a-4172-bf24-ffead5ebdabe)

# 💡 기술적 의사결정

## Cloud Front의 도입

동일한 영상을 시청하는 모든 시청자가 Origin 서버(S3)에 접근하지 않고, 캐시 데이터(CDN)에 접근하도록 하여 `요청 대기시간 감소` 를 통해 성능을 개선합니다.

![스크린샷 2023-09-11 오후 9 35 08](https://github.com/cooderyg/streaming-platform/assets/79882498/88555cb5-89ee-47de-aa2b-9319f39267b1)

기존 S3에서 바로 고객에게 영상정보를 보낼때는 (한국 기준) 약 50ms 가량의 응답 대기시간이 있었습니다. 한국 내에서는 크게 문제 될 속도는 아닐 수 있으나, 캐싱 활용으로 속도 개선이 가능하며, 미국, 유럽 등 지리적 거리가 있는 타 국가에서 FreelyB 서비스를 이용할 경우 응답 속도가 느려질 상황을 예방할 수 있어 Cloud Front를 도입하였습니다.

### 응답 속도 테스트

동일 파일을 대상으로한 GET 요청을 반복적으로 수행했을 경우 응답 시간 개선 확인을 위한 테스트 진행

> `Cloudfount 배포 전`  
> ![Untitled](https://github.com/cooderyg/streaming-platform/assets/79882498/e10e3f2f-3c7a-4c36-b1b3-bfb422aef2c6)

CloudFront 배포 전 Origin(S3)에 직접 요청했을 경우의 응답속도는 아래와 같이 일정하며, 예외의 상황으로 응답 시간이 늦어질 경우도 발생함을 확인할 수 있었습니다.

> `Cloudfount 배포 후`  
> ![Untitled (1)](https://github.com/cooderyg/streaming-platform/assets/79882498/60a46d4a-54b3-427f-8685-47f8faba31cb)

Origin 데이터를 Cloudfront로 배포 후 응답 속도가 개선되는 것을 확인할 수 있습니다.

- 첫 데이터는 캐시 데이터가 없어 S3에 직접 요청하므로 응답 시간이 전자의 결과가 큰 차이가 없음
- 두 번째 요청은 Regional Edge Caches에 캐싱된 데이터를 가져오므로 시간이 절반 가량 감소함
- 세 번째 요청부터는 popular한 콘텐츠로 인식하여 Edge Location에 저장된 캐시를 가져오면서 다시 3배 가량 응답 시간 감소

> `테스트 결과 비교 차트`  
> ![line_chart](https://github.com/cooderyg/streaming-platform/assets/79882498/84d32da3-2577-47b1-af9f-6b394bc2aa64)

populer한 콘텐츠를 대상으로 GET 요청 시 Origin과 Edge Location 간 요청 대기 속도가 평균적으로 약 10배 차이가 발생하는 것을 확인할 수 있습니다.

## Elastic Search의 도입

엘라스틱서치(Elasticsearch)를 도입하는 이유 중 하나는 `검색 및 데이터 분석 작업을 효과적으로 수행하기 위함`입니다. 또한, 한국어 검색에 있어서 높은 효율성을 제공하는 한국어 형태소 분석기인 'nori' 플러그인을 포함하는 것이 엘라스틱서치의 장점 중 하나입니다.

1. 토큰화 (Tokenization):
   토큰화는 텍스트를 작은 단위로 나누는 프로세스로, 엘라스틱서치에서는 주로 단어 단위로 텍스트를 분할합니다. 각 단어는 토큰으로 처리되며, 특수 문자 및 공백을 기준으로 분리됩니다. 토큰화를 통해 검색어에 대한 정확한 일치 및 유사한 단어에 대한 검색을 용이하게 만듭니다.
2. 한국어 형태소 분석기 'nori' 플러그인:
   엘라스틱 서치는 한국어 검색에 있어서 탁월한 성능을 제공하기 위해 'nori' 플러그인을 사용합니다. 'nori' 플러그인은 한국어 텍스트를 형태소 단위로 분석하여 정확한 검색 및 분석을 가능하게 합니다. 이것은 한국어 검색 엔진을 구축하고 한국어 사용자에게 최적화된 검색 결과를 제공하는 데 큰 도움을 줍니다.

### SQL vs Elastic Search 속도비교

Jmeter를 통한 속도 비교입니다. 1초에 20명의 유저가 요청을 보내도록 테스트 환경을 구성했습니다. SQL을 이용한 search 테스트 결과입니다.
![Screenshot from 2023-09-13 12-37-35](https://github.com/cooderyg/streaming-platform/assets/79882498/e733fce5-1304-4051-b09d-e064446032ee)
응답속도가 평균 120ms입니다.

`Elastic Search`를 이용한 search 테스트 결과입니다.  
![Screenshot from 2023-09-13 12-38-44 (1)](https://github.com/cooderyg/streaming-platform/assets/79882498/3c808a50-a768-483e-bc7a-0d3d61ad9858)
응답속도가 평균 4ms입니다.

### Standard Analizer vs Nori Analizer 토큰화 비교

#### Standard Analizer

기본적으로 적용되는 Standard Analizer를 사용하면 띄어쓰기만 인식하기 때문에 `띄어쓰기로만 토큰화`가 가능합니다.

ex) “개발자 홍길동입니다.” 를 token화 할 때  
[ `“개발자”, “홍길동입니다”` ] 두 개로 토큰화 됩니다.

#### Nori Analizer

Nori Analizer는 한국어 플러그인이므로 띄어쓰기 포함 의성어 의태어 접두사 등등 `형태소 단위로 토큰화`가 가능합니다.

ex) “개발자 홍길동입니다.” 를 token화 할 때  
[ `“개발자”, “개발”, “자”, “홍길동”, “홍”, “길동”, “입니다”, “이”, “ㅂ니다”` ] 이런식으로 다양하게 토큰화 됩니다.

# 🛠️트러블 슈팅

## 다수의 사용자가 메인 페이지 로딩 시 데이터 병목현상 발생

메인페이지에 대해서 간단한 부하테스트를 진행해 보았는데, 많지 않은 요청임에도 불구하고 응답이 급격히 느려지는 문제 발생

![Untitled (2)](https://github.com/cooderyg/streaming-platform/assets/122774009/bfc0fc35-d780-4a8f-9187-4e06010234b7)

데이터를 캐싱하여 요청 처리 속도를 높이면 해결되겠다 판단하여 Redis Cloud 연결 후 메인페이지 데이터 캐싱

![Untitled (3)](https://github.com/cooderyg/streaming-platform/assets/122774009/5e23d48e-ce93-4135-b8a8-820b2defdc9a)

## Cloud Front 캐싱 정책 관련 문제 발생

기존 cloudfront 캐시 정책으로 `AWS에서 추천하는 캐시 정책(CacheingOptimized)을 적용`했습니다. 그래서 Origin(S3)으로 요청이 들어온 콘텐츠는 이후 추가 요청 건에 대해서는 Cloudfront에서 캐싱하도록 의도했습니다.  
하지만 서비스 특성 상 지속적으로 최신화 되는 `index.m3u8 파일`(ts파일 순서에 대한 파일) 및 실시간 방송 `썸네일이미지 파일`이 캐싱으로 인하여 `과거 데이터를 캐싱하는 상황이 발생`하였습니다. 특히 index.m3u8과 thumbnail.png 파일은 파일명이 고정된 채로 덮어쓰는 방식으로 S3에 업데이트 되었기 때문에 `cloudfront에서 캐시 업데이트 시점 파악을 어려워 하는 것으로 판단`했습니다.

이후 또 다른 캐싱 정책인 `Elemental-MediaPackage 정책으로 수정`했지만 여전히 캐싱 최신화가 S3 최신화를 따라오지 못했습니다.

결론적으로 AWS CloudFront 캐시 정책에서 `/_.m3u8, /_.png에 대해서는 캐싱하지 않도록` 아래와 같이 정책을 수정하여 해결하였습니다. 이를 통해 `m3u8 파일과 png 파일에 대해서는 Edge location을 거치지 않고 직접 Origin에서 콘텐츠를 가져오도록 설정`하여 매 최신 데이터를 수급하도록 하였습니다.

![output](https://github.com/cooderyg/streaming-platform/assets/79882498/668032e6-d959-4127-bcb3-08d1dd2677cf)

## 대규모 알림 발생 시 서버 블로킹 현상 발생

Freely.B에서는 스트리머가 방송을 시작하면 구독자들에게 알림메시지를 보내게 됩니다. 초기 방송 서비스를 오픈할 때 시청자를 모으기 위해 유명한 스트리머들과 계약을 맺고 영입하는 경우가 많기 때문에 구독자 수가 많은 스트리머가 있는 상황이라고 가정했습니다.

entity를 생성하게 되는데 구독자가 적을 시에는 문제가 되지 않지만, 구독자 10,000명의 테스트환경을 구성하여 테스트 해본 결과 알림 생성 시 `약 3000ms가 소요`되었고, 그 시간동안 `서버가 블로킹상태가 되는 문제가 발생`했습니다.

![Screenshot from 2023-09-11 22-26-00](https://github.com/cooderyg/streaming-platform/assets/79882498/0721dc18-c58f-4c91-8512-1d7e905c5e6a)


### 해결방안 1

#### Consumer 서버 활용

CPU intensive한 작업을 맡는 Consumer 서버를 하나 더 사용하는 방식으로 event loop blocking을 해결할 수 있었습니다.  

![Screenshot from 2023-09-11 22-11-54](https://github.com/cooderyg/streaming-platform/assets/79882498/237b8e0a-952f-49dd-8c10-ebd0a9ff7793)


위 이미지를 보시면 `두 개의 Nest JS 서버`가 있고 Bull에 동일한 redis를 공유합니다. Main Server에서는 Queue에 작업만 올리고 Consumer Server에서는 Queue에 있는 작업을 처리합니다.

아래 이미지를 보시면 Main Server에는 event loop blocking이 발생하지 않았습니다.  

![download](https://github.com/cooderyg/streaming-platform/assets/79882498/6f686448-f18a-4ae7-a2be-46c8c5a5bbe5)


#### Consumer Server의 문제점

`MySQL에 쓰기 접근을 하는 server가 두 곳이기 때문에 문제`가 생길 수 있습니다. Main Server의 모든 쓰기 작업을 Consumer Server로 옮기는 방식으로 해결할 수 있지만 비효율적이라고 생각했습니다.

### 해결방안 2

#### 작업을 나눠 Bull Queue에 적재하고 병렬로 처리하는 방식

구독자를 pagenation해서 작업의 양을 줄이고 횟수를 늘리는 방식으로 해결 할 수 있었습니다. 이 과정에서 Bull Queue에 작업을 올리고 concurrency옵션을 통해 병렬적으로 처리할 수 있게 했습니다.  

![download (1)](https://github.com/cooderyg/streaming-platform/assets/79882498/67ffa53c-97ea-4c00-b774-622010e139e5)

위의 이미지를 보시면 작업량이 많아지긴 했지만 event loop block이 발생하지 않습니다.

추가적으로 Bull Queue에 redis를 연결시키면 서버가 다운되는 일이 발생하더라도 작업자체는 redis에 저장되어 있기 때문에 서버가 재부팅되는 순간 작업이 다시 순차적으로 진행된다는 장점이 있습니다.

결론적으로 저희는 서비스 초기 특성 상 리소스를 적약하기 위해 작업을 나눠서 병렬처리하는 방식을 선택했습니다.
