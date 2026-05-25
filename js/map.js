// js/map.js
// 탐험 지도 화면을 담당하는 파일입니다. Leaflet.js를 사용합니다.

// --- 지도 설정 상수 ---
const DEFAULT_LAT = 37.5665;  // 기본 위도 (서울시청)
const DEFAULT_LNG = 126.9780; // 기본 경도 (서울시청)
const DEFAULT_ZOOM = 15;      // 기본 줌 레벨

// --- 지도 상태 변수 ---
let map = null;               // Leaflet 지도 인스턴스
let userMarker = null;        // 사용자 현재 위치를 표시하는 파란 점 마커
let isMapInitialized = false;  // 지도가 이미 초기화되었는지 여부
let markersLayer = null;       // 수집 마커들을 묶어서 관리하는 레이어

/**
 * 지도 화면을 열고 슬라이드 애니메이션을 적용합니다.
 */
function showMap() {
  // [한글 주석] 뒤로가기 스택에 추가
  if (typeof pushScreen === 'function') pushScreen('map-screen');
    const mapScreen = document.getElementById('map-screen');
    
    // 화면에 보이게(flex) 처리
    mapScreen.style.display = 'flex';
    
    // 슬라이드 인 애니메이션 적용
    setTimeout(() => {
        mapScreen.classList.add('slide-in');
    }, 10);

    // 지도 초기화 (최초 1회만) 또는 크기 재계산
    // Leaflet은 display:none인 상태에서 초기화하면 크기를 못 잡으므로
    // 화면이 보인 직후에 초기화하거나 invalidateSize()를 호출해야 합니다.
    setTimeout(() => {
        if (!isMapInitialized) {
            initMap();
        } else {
            // 이미 초기화된 경우 크기만 다시 계산
            map.invalidateSize();
        }
        // 하단 정보바의 오늘 수집 아이템 수 갱신
        updateMapInfoBar();
    }, 350); // 슬라이드 애니메이션(0.3초)이 끝난 직후
}

/**
 * 지도 화면을 닫고 메인 화면으로 돌아갑니다.
 */
function hideMap() {
    const mapScreen = document.getElementById('map-screen');
    
    // 슬라이드 아웃 (클래스 제거)
    mapScreen.classList.remove('slide-in');
    
    // 애니메이션 시간 후 화면 숨기기
    setTimeout(() => {
        mapScreen.style.display = 'none';
    }, 300);
}

/**
 * Leaflet.js로 지도를 초기화합니다.
 * GPS 위치를 시도하고 실패 시 서울시청 좌표로 대체합니다.
 */
function initMap() {
    // Leaflet 지도 생성 (map-container div에 바인딩)
    map = L.map('map-container').setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
    
    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // 마커 레이어 그룹 초기화
    markersLayer = L.layerGroup().addTo(map);

    isMapInitialized = true;

    // GPS로 현재 위치 가져오기 시도
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 위치 가져오기 성공
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // 현재 위치로 지도 이동
                map.setView([lat, lng], DEFAULT_ZOOM);
                
                // 파란 점 마커 표시
                setUserMarker(lat, lng);
                
                // 상태 텍스트 업데이트
                document.getElementById('map-status-text').textContent = '📍 현재 위치 추적 중';
            },
            (error) => {
                // 위치 가져오기 실패 → 서울시청 기본 좌표 사용
                console.warn("위치 정보를 가져올 수 없습니다:", error.message);
                setUserMarker(DEFAULT_LAT, DEFAULT_LNG);
                document.getElementById('map-status-text').textContent = '📍 위치 권한 필요 (기본 위치 표시 중)';
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        // Geolocation API 자체를 지원하지 않는 브라우저
        setUserMarker(DEFAULT_LAT, DEFAULT_LNG);
        document.getElementById('map-status-text').textContent = '📍 이 브라우저는 위치를 지원하지 않습니다';
    }

    // 저장된 수집 마커들 지도에 복원
    loadSavedMarkers();
}

/**
 * 사용자의 현재 위치에 파란 원형 마커를 표시합니다.
 */
function setUserMarker(lat, lng) {
    // 기존 마커가 있으면 제거
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    // 파란 원형 마커 생성
    userMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#2196F3',  // 파란색 내부
        color: '#1565C0',      // 파란색 테두리
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
    
    userMarker.bindPopup('📍 내 위치').openPopup();
}

/**
 * 카드를 수집한 위치에 마커를 추가합니다.
 * 희귀도에 따라 마커 색상이 다릅니다.
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {Object} cardData - 카드 데이터 객체
 */
function addCollectionMarker(lat, lng, cardData) {
    // 지도가 초기화되지 않았으면 무시 (나중에 loadSavedMarkers로 복원됨)
    if (!map) return;
    
    // 희귀도별 마커 색상 결정
    let markerColor = '#4caf50';  // 기본 초록 (common)
    if (cardData.rarity === 'rare') markerColor = '#2196F3';   // 파랑
    if (cardData.rarity === 'epic') markerColor = '#ffc107';   // 금색
    
    // 커스텀 아이콘 생성 (div 기반)
    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-dot" style="background-color: ${markerColor};">${cardData.emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18], // 마커의 중심점
        popupAnchor: [0, -20] // 팝업이 뜨는 위치
    });
    
    // 수집 날짜 가져오기
    const dates = typeof getCollectionDates === 'function' ? getCollectionDates() : {};
    const dateStr = dates[cardData.id] || '날짜 정보 없음';
    
    // 마커 생성 및 지도에 추가 (단일 추가 시에도 레이어 그룹에 포함시킴)
    const marker = L.marker([lat, lng], { icon: customIcon });
    if (markersLayer) marker.addTo(markersLayer);
    else marker.addTo(map);
    
    // 마커 클릭 시 팝업에 카드 정보 표시
    marker.bindPopup(`
        <div style="text-align:center; font-family:'Jua',sans-serif;">
            <div style="font-size:30px;">${cardData.emoji}</div>
            <strong>${cardData.name}</strong><br>
            <span style="font-size:12px; color:#888;">${dateStr}</span>
        </div>
    `);
}

/**
 * 두 위도/경도 좌표 간의 거리를 미터(m) 단위로 계산합니다. (Haversine 공식)
 */
function getDistanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLng = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
      Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
      Math.sin(dLng/2)*Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * LocalStorage에 저장된 수집 위치 기록을 반경 30m 이내 클러스터로 묶어 지도에 복원합니다.
 */
function loadSavedMarkers() {
    const locations = getCollectionLocations(); // storage.js 함수
    
    // 카드 데이터가 아직 로드되지 않았으면 잠시 후 재시도
    if (!window.allCardsData || window.allCardsData.length === 0) {
        setTimeout(loadSavedMarkers, 500);
        return;
    }

    // 기존 렌더링된 마커들 초기화
    if (markersLayer) {
        markersLayer.clearLayers();
    }
    
    // 1. 저장된 마커 데이터를 배열로 가공
    const dates = typeof getCollectionDates === 'function' ? getCollectionDates() : {};
    const markerDataList = [];

    Object.keys(locations).forEach(cardId => {
        const loc = locations[cardId];
        const cardData = window.allCardsData.find(c => c.id === cardId);
        if (cardData && loc.lat && loc.lng) {
            markerDataList.push({
                cardData: cardData,
                lat: loc.lat,
                lng: loc.lng,
                dateStr: dates[cardId] || '날짜 정보 없음'
            });
        }
    });

    // 2. 30m 반경 클러스터링 로직
    const clusters = [];

    markerDataList.forEach(item => {
        let foundCluster = null;
        for (let cluster of clusters) {
            // 클러스터의 중심점과 현재 마커의 거리를 비교
            const dist = getDistanceMeters(cluster.lat, cluster.lng, item.lat, item.lng);
            if (dist <= 30) {
                foundCluster = cluster;
                break;
            }
        }

        if (foundCluster) {
            // 기존 클러스터에 포함 및 평균 좌표 갱신
            foundCluster.items.push(item);
            const totalCount = foundCluster.items.length;
            foundCluster.lat = ((foundCluster.lat * (totalCount - 1)) + item.lat) / totalCount;
            foundCluster.lng = ((foundCluster.lng * (totalCount - 1)) + item.lng) / totalCount;
        } else {
            // 새 클러스터 생성
            clusters.push({
                lat: item.lat,
                lng: item.lng,
                items: [item]
            });
        }
    });

    // 3. 클러스터별로 지도에 그리기
    clusters.forEach(cluster => {
        if (cluster.items.length === 1) {
            // --- 단일 마커 (1개) ---
            const item = cluster.items[0];
            let markerColor = '#4caf50';  // 기본 초록 (common)
            if (item.cardData.rarity === 'rare') markerColor = '#2196F3';
            if (item.cardData.rarity === 'epic') markerColor = '#ffc107';
            
            const customIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div class="marker-dot" style="background-color: ${markerColor};">${item.cardData.emoji}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -20]
            });
            
            const marker = L.marker([cluster.lat, cluster.lng], { icon: customIcon });
            marker.bindPopup(`
                <div style="text-align:center; font-family:'Jua',sans-serif;">
                    <div style="font-size:30px;">${item.cardData.emoji}</div>
                    <strong>${item.cardData.name}</strong><br>
                    <span style="font-size:12px; color:#888;">${item.dateStr}</span>
                </div>
            `);
            if (markersLayer) marker.addTo(markersLayer);

        } else {
            // --- 클러스터 마커 (2개 이상) ---
            const count = cluster.items.length;
            let bgColor = '#4a9eff'; // 파랑 (2~4개)
            if (count >= 5 && count <= 9) bgColor = '#ff9500'; // 주황 (5~9개)
            else if (count >= 10) bgColor = '#ff4444'; // 빨강 (10개 이상)

            const clusterHtml = `
                <div class="cluster-marker" style="background-color: ${bgColor};">
                    +${count}
                </div>
            `;
            const clusterIcon = L.divIcon({
                className: 'custom-map-cluster',
                html: clusterHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });
            
            // 팝업 대신 커스텀 UI 열기
            marker.on('click', () => {
                showClusterPopup(cluster);
            });
            if (markersLayer) marker.addTo(markersLayer);
        }
    });
}

/**
 * 겹친(클러스터된) 카드를 볼 수 있는 커스텀 팝업 열기
 */
function showClusterPopup(cluster) {
    const popupEl = document.getElementById('cluster-popup');
    if (!popupEl) return;
    
    document.querySelector('.cluster-popup-title').textContent = `이 장소에서 ${cluster.items.length}개 발견!`;
    
    const listEl = document.querySelector('.cluster-popup-list');
    listEl.innerHTML = ''; // 초기화
    
    cluster.items.forEach(item => {
        const rarityText = item.cardData.rarity === 'epic' ? '전설' : (item.cardData.rarity === 'rare' ? '희귀' : '일반');
        const rarityClass = `badge-${item.cardData.rarity || 'common'}`;

        const listItem = document.createElement('div');
        listItem.className = 'cluster-popup-item';
        listItem.innerHTML = `
            <div class="cluster-item-emoji">${item.cardData.emoji}</div>
            <div class="cluster-item-info">
                <div class="cluster-item-name">${item.cardData.name}</div>
                <div class="cluster-item-date">${item.dateStr}</div>
            </div>
            <div class="cluster-item-badge ${rarityClass}">${rarityText}</div>
        `;
        listEl.appendChild(listItem);
    });

    popupEl.style.display = 'flex';
}

/**
 * 커스텀 클러스터 팝업 닫기
 */
function closeClusterPopup() {
    const popupEl = document.getElementById('cluster-popup');
    if (popupEl) popupEl.style.display = 'none';
}

/**
 * 하단 정보바의 오늘 수집한 아이템 수를 갱신합니다.
 */
function updateMapInfoBar() {
    const collection = getCollection();
    const countEl = document.getElementById('map-collected-count');
    if (countEl) {
        countEl.textContent = `🎒 수집한 아이템: ${collection.length}개`;
    }
}
