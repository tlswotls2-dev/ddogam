// ================================
// 또감 Service Worker
// 이미지 오프라인 캐시 담당
// ================================

// 캐시 버전 이름 정의 (기존 v1에서 v3로 업데이트)
const CACHE_NAME = 'ttogam-images-v3';

// 캐시할 파일 목록 생성
const IMAGE_URLS = [];

// 식물 이미지 100개 (plant_001.png ~ plant_100.png) 경로 생성
for (let i = 1; i <= 100; i++) {
  IMAGE_URLS.push(`images/plant/plant_${String(i).padStart(3,'0')}.png`);
}
// 동물 이미지 100개 (animal_001.png ~ animal_100.png) 경로 생성
for (let i = 1; i <= 100; i++) {
  IMAGE_URLS.push(`images/animal/animal_${String(i).padStart(3,'0')}.png`);
}
// 유물 이미지 100개 (artifact_001.png ~ artifact_100.png) 경로 생성
for (let i = 1; i <= 100; i++) {
  IMAGE_URLS.push(`images/artifact/artifact_${String(i).padStart(3,'0')}.png`);
}

// 오프라인에서 작동하는 데 필요한 핵심 앱 리소스 파일 목록
const APP_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/collection.js',
  '/js/dodam.js',
  '/js/map.js',
  '/js/pedometer.js',
  '/js/quiz.js',
  '/js/storage.js',
  '/js/avatar.js',
  '/js/chatbot.js',
  '/js/sync.js',
  '/js/teacher.js',
  '/js/testmode.js',
  '/data/cards.json',
  '/data/quiz.json'
];

// Service Worker 설치(install) 이벤트 핸들러
// 서비스 워커가 처음 등록될 때 실행되며, 핵심 앱 파일들을 미리 캐싱(Pre-cache)합니다.
self.addEventListener('install', event => {
  console.log('[SW] 설치 시작');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 앱 핵심 파일 캐시 중...');
      return cache.addAll(APP_URLS);
    })
  );
  // 새로운 서비스 워커가 대기하지 않고 즉시 활성화되도록 설정
  self.skipWaiting();
});

// fetch 이벤트 핸들러 - 네트워크 요청을 가로채어 캐시 우선 전략을 적용합니다.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 이미지(/images/) 요청인 경우의 캐시 전략
  if (url.pathname.includes('/images/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached; // 캐시에 파일이 존재하면 즉시 캐시 파일 반환
        
        // 캐시에 없으면 네트워크에서 새로 받아온 뒤 캐시에 저장(런타임 캐싱)
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone(); // 응답은 한 번만 읽을 수 있으므로 복제해서 사용
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          // 네트워크 에러가 발생하고(오프라인) 캐시에도 없으면 빈 404 응답을 반환
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }
  
  // 이미지 이외의 앱 파일 요청 (캐시 우선 전략: 캐시 확인 후 없으면 네트워크 요청)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// 메인 스레드로부터 메시지를 받는 이벤트 핸들러 (이미지 캐시 다운로드 기능 처리)
self.addEventListener('message', event => {
  // 'cacheImages' 메시지를 받으면 정의된 300장의 이미지를 미리 캐싱합니다.
  if (event.data === 'cacheImages') {
    console.log('[SW] 이미지 300장 캐시 시작...');
    caches.open(CACHE_NAME).then(cache => {
      let cached = 0; // 캐싱 성공한 이미지 개수 카운터
      const total = IMAGE_URLS.length; // 전체 캐싱할 이미지 수 (300개)
      
      // 서버 과부하를 막기 위해 10개씩 묶어서 순차적으로 다운로드(배치 다운로드)
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < IMAGE_URLS.length; i += batchSize) {
        batches.push(IMAGE_URLS.slice(i, i + batchSize));
      }
      
      // 비동기 루프를 사용하여 배치 단위로 이미지 다운로드 수행
      batches.reduce((promise, batch) => {
        return promise.then(() => {
          return Promise.allSettled(
            batch.map(url => 
              fetch(url).then(res => {
                if (res.ok) {
                  cache.put(url, res); // 캐시에 다운로드한 이미지 저장
                  cached++;
                  // 메인 스레드(클라이언트)에 실시간으로 진행 상황 전달
                  self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                      client.postMessage({
                        type: 'cacheProgress',
                        cached,
                        total
                      });
                    });
                  });
                }
              }).catch(() => {}) // 개별 요청 실패 시 오류 무시하고 계속 진행
            )
          );
        });
      }, Promise.resolve());
    });
  }
});
