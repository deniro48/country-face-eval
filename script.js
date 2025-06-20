// 전역 변수 선언
let selectedGender = null;
let uploadedImage = null;

// DOM 요소 참조
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const uploadBtn = document.getElementById('uploadBtn');
const changeImageBtn = document.getElementById('changeImageBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadSection = document.getElementById('uploadSection');
const resultSection = document.getElementById('resultSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const restartBtn = document.getElementById('restartBtn');

// 나라별 선호도 및 얼굴 특징 데이터
const countryData = {
    '대한민국': {
        flag: 'https://flagcdn.com/w320/kr.png',
        preferences: { symmetry: 0.3, verticalRatio: 0.3, horizontalRatio: 0.2, lipNoseRatio: 0.2 },
        features: { '얼굴형': { icon: 'fa-user', description: '갸름한 V라인과 작은 얼굴이 선호됩니다.' }, '눈': { icon: 'fa-eye', description: '또렷한 쌍꺼풀과 큰 눈이 매력적으로 여겨집니다.' }, '코': { icon: 'fa-nose', description: '높고 곧은 콧대와 작은 코끝이 이상적입니다.' }, '입술': { icon: 'fa-lips', description: '도톰하고 선명한 입술이 선호됩니다.' } }
    },
    '일본': {
        flag: 'https://flagcdn.com/w320/jp.png',
        preferences: { symmetry: 0.2, verticalRatio: 0.4, horizontalRatio: 0.2, lipNoseRatio: 0.2 },
        features: { '얼굴형': { icon: 'fa-user', description: '부드러운 계란형 얼굴이 선호됩니다.' }, '눈': { icon: 'fa-eye', description: '처진 눈꼬리와 자연스러운 쌍꺼풀이 매력적입니다.' }, '코': { icon: 'fa-nose', description: '작고 낮은 코가 귀엽게 여겨집니다.' }, '입술': { icon: 'fa-lips', description: '작고 얇은 입술이 선호됩니다.' } }
    },
    '중국': {
        flag: 'https://flagcdn.com/w320/cn.png',
        preferences: { symmetry: 0.3, verticalRatio: 0.2, horizontalRatio: 0.3, lipNoseRatio: 0.2 },
        features: { '얼굴형': { icon: 'fa-user', description: '둥글고 풍만한 얼굴형이 선호됩니다.' }, '눈': { icon: 'fa-eye', description: '날렵한 눈매와 긴 눈이 매력적입니다.' }, '코': { icon: 'fa-nose', description: '적당한 크기의 코가 이상적입니다.' }, '입술': { icon: 'fa-lips', description: '도톰하고 붉은 입술이 선호됩니다.' } }
    },
    '미국': {
        flag: 'https://flagcdn.com/w320/us.png',
        preferences: { symmetry: 0.4, verticalRatio: 0.2, horizontalRatio: 0.1, lipNoseRatio: 0.3 },
        features: { '얼굴형': { icon: 'fa-user', description: '각진 턱선과 입체적인 얼굴이 선호됩니다.' }, '눈': { icon: 'fa-eye', description: '깊은 눈매와 큰 눈동자가 매력적입니다.' }, '코': { icon: 'fa-nose', description: '높고 굵은 콧대가 이상적입니다.' }, '입술': { icon: 'fa-lips', description: '풍만하고 섹시한 입술이 선호됩니다.' } }
    },
    '프랑스': {
        flag: 'https://flagcdn.com/w320/fr.png',
        preferences: { symmetry: 0.35, verticalRatio: 0.25, horizontalRatio: 0.2, lipNoseRatio: 0.2 },
        features: { '얼굴형': { icon: 'fa-user', description: '세련된 타원형 얼굴이 선호됩니다.' }, '눈': { icon: 'fa-eye', description: '깊이 있는 눈매와 긴 속눈썹이 매력적입니다.' }, '코': { icon: 'fa-nose', description: '높고 날렵한 콧대가 이상적입니다.' }, '입술': { icon: 'fa-lips', description: '자연스럽고 우아한 입술이 선호됩니다.' } }
    }
};

// MediaPipe FaceMesh 설정
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    uploadBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    changeImageBtn.addEventListener('click', () => imageInput.click());
    analyzeBtn.addEventListener('click', startAnalysis);
    restartBtn.addEventListener('click', restartAnalysis);
    document.querySelectorAll('input[name="gender"]').forEach(radio => radio.addEventListener('change', (e) => {
        selectedGender = e.target.value;
        checkAnalyzeButtonState();
    }));
});

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        return alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
    }
    if (file.size > 10 * 1024 * 1024) {
        return alert('파일 크기는 10MB를 초과할 수 없습니다.');
    }
    uploadedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        checkAnalyzeButtonState();
    };
    reader.readAsDataURL(file);
}

function checkAnalyzeButtonState() {
    analyzeBtn.disabled = !uploadedImage || !selectedGender;
}

// 분석 시작 (하이브리드 모델)
async function startAnalysis() {
    loadingOverlay.style.display = 'flex';
    try {
        const [mediaPipeResult, facePlusPlusResult] = await Promise.all([
            analyzeWithMediaPipe(previewImage),
            analyzeWithFacePlusPlus(uploadedImage)
        ]);

        if (mediaPipeResult.error) {
            throw new Error(`얼굴 형태 분석 실패: ${mediaPipeResult.error}`);
        }
        if (facePlusPlusResult.error) {
            console.warn(`Face++ 추가 정보 분석 실패: ${facePlusPlusResult.error}`);
        }
        
        const geometricAnalysis = analyzeLandmarks(mediaPipeResult.landmarks);
        const attributeAnalysis = facePlusPlusResult.faces?.[0]?.attributes || {};
        
        const countryScores = calculateAllCountryScores(geometricAnalysis, attributeAnalysis);

        displayResults(countryScores, geometricAnalysis, attributeAnalysis);

    } catch (error) {
        loadingOverlay.style.display = 'none';
        alert(`분석 중 오류 발생: ${error.message}`);
    }
}

// MediaPipe 분석 함수
function analyzeWithMediaPipe(image) {
    return new Promise((resolve) => {
        faceMesh.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                resolve({ landmarks: results.multiFaceLandmarks[0] });
            } else {
                resolve({ error: '얼굴을 찾을 수 없습니다.' });
            }
        });
        faceMesh.send({ image });
    });
}

// Face++ 분석 함수 (Cloudflare Function 호출)
async function analyzeWithFacePlusPlus(imageFile) {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    try {
        // Cloudflare Function 엔드포인트. 로컬 테스트 시에는 주석 처리하거나 다른 방식 필요.
        // 배포 후에는 '/analyze'로 작동합니다.
        const response = await fetch('/analyze', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'API 서버 응답 오류');
        }
        return data;
    } catch (error) {
        console.error("Face++ API 호출 실패:", error);
        return { error: error.message }; // 에러가 발생해도 전체 분석이 멈추지 않도록 객체 반환
    }
}

// 랜드마크 기반 기하학적 분석
function analyzeLandmarks(landmarks) {
    const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const symmetry = 100 - ([...Array(5).keys()].reduce((acc, i) =>
        acc + Math.abs(landmarks[i * 21 + 4].x - (1 - landmarks[i * 21 + 24].x)), 0) * 200);

    const verticalRatio = getDistance(landmarks[10], landmarks[152]) / getDistance(landmarks[168], landmarks[6]);
    const horizontalRatio = getDistance(landmarks[234], landmarks[454]) / getDistance(landmarks[130], landmarks[243]);
    const lipNoseRatio = getDistance(landmarks[61], landmarks[291]) / getDistance(landmarks[218], landmarks[438]);

    return { symmetry, verticalRatio, horizontalRatio, lipNoseRatio };
}

// 국가별 점수 계산
function calculateAllCountryScores(geometric, attributes) {
    const beautyScore = attributes.beauty ? (attributes.beauty.male_score + attributes.beauty.female_score) / 2 : 70;
    
    return Object.entries(countryData).map(([name, data]) => {
        let score = beautyScore * 0.5; // 기본 매력도 점수 50% 반영
        const geoScore = (geometric.symmetry * data.preferences.symmetry) +
                         (geometric.verticalRatio * 100 * data.preferences.verticalRatio) +
                         (geometric.horizontalRatio * 20 * data.preferences.horizontalRatio) +
                         (geometric.lipNoseRatio * 20 * data.preferences.lipNoseRatio);
        score += geoScore * 0.5; // 기하학적 점수 50% 반영
        return { name, flag: data.flag, score: Math.min(99, score) };
    });
}

// 결과 표시
function displayResults(countryScores, geometric, attributes) {
    loadingOverlay.style.display = 'none';
    uploadSection.style.display = 'none';
    resultSection.style.display = 'block';

    const sortedCountries = countryScores.sort((a, b) => b.score - a.score);
    const topCountry = sortedCountries[0];

    document.getElementById('topCountryFlag').src = topCountry.flag;
    document.getElementById('topCountryName').textContent = topCountry.name;
    document.getElementById('topScore').textContent = Math.round(topCountry.score);

    displayAdvancedAnalysis(geometric, attributes);
    displayCountriesList(sortedCountries);
    selectCountry(topCountry.name);
}

// 국가 리스트 표시
function displayCountriesList(sortedCountries) {
    const countriesList = document.getElementById('countriesList');
    countriesList.innerHTML = '';
    sortedCountries.forEach((country, index) => {
        const countryElement = document.createElement('div');
        countryElement.className = 'country-item';
        countryElement.setAttribute('data-country', country.name);
        countryElement.innerHTML = `
            <div class="country-info">
                <span class="country-rank">#${index + 1}</span>
                <img src="${country.flag}" alt="${country.name} 국기" class="country-flag">
                <span class="country-name">${country.name}</span>
            </div>
            <div class="country-score"><span>${Math.round(country.score)}</span>점</div>`;
        countryElement.addEventListener('click', () => selectCountry(country.name));
        countriesList.appendChild(countryElement);
    });
}

// 상세 분석 정보 표시
function displayAdvancedAnalysis(geometric, attributes) {
    const getAnalysisText = (value, unit = '') => value ? `${Math.round(value)}${unit}` : '분석 불가';
    
    document.getElementById('estimatedAge').textContent = getAnalysisText(attributes.age?.value, '세');
    document.getElementById('smileScore').textContent = getAnalysisText(attributes.smiling?.value, '점');
    document.getElementById('faceQuality').textContent = getAnalysisText(attributes.facequality?.value, '점');
    document.getElementById('beautyScore').textContent = getAnalysisText((attributes.beauty?.male_score + attributes.beauty?.female_score) / 2, '점');
    document.getElementById('ethnicity').textContent = attributes.ethnicity?.value || '분석 불가';

    const emotion = attributes.emotion ? Object.keys(attributes.emotion).reduce((a, b) => attributes.emotion[a] > attributes.emotion[b] ? a : b) : '분석 불가';
    document.getElementById('emotionAnalysis').textContent = emotion;

    const skin = attributes.skinstatus;
    document.getElementById('skinCondition').textContent = skin ? `건강: ${Math.round(skin.health)}%` : '분석 불가';
    
    document.getElementById('poseAnalysis').textContent = `대칭: ${getAnalysisText(geometric.symmetry, '점')}`;
}

// 국가 선택 및 특징 표시
function selectCountry(countryName) {
    document.querySelectorAll('.country-item').forEach(item => {
        item.classList.toggle('selected', item.getAttribute('data-country') === countryName);
    });
    displayFacialFeatures(countryName);
}

function displayFacialFeatures(countryName) {
    const list = document.getElementById('facialFeaturesList');
    list.innerHTML = '';
    const features = countryData[countryName]?.features;
    if (!features) return;
    
    const title = document.createElement('h3');
    title.className = 'facial-features-title';
    title.innerHTML = `<i class="fas fa-user"></i> ${countryName}의 선호하는 얼굴 생김새`;
    list.appendChild(title);

    Object.entries(features).forEach(([feature, data]) => {
        const item = document.createElement('div');
        item.className = 'facial-feature-item';
        item.innerHTML = `
            <div class="facial-feature-title"><i class="fas ${data.icon}"></i> ${feature}</div>
            <div class="facial-feature-description">${data.description}</div>`;
        list.appendChild(item);
    });
}

function restartAnalysis() {
    uploadSection.style.display = 'block';
    resultSection.style.display = 'none';
    imageInput.value = '';
    uploadedImage = null;
    selectedGender = null;
    document.querySelectorAll('input[name="gender"]').forEach(radio => radio.checked = false);
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    previewImage.src = '';
    analyzeBtn.disabled = true;
}

// 국가 데이터 (국기 URL과 함께)
const countries = [
    { name: '이탈리아', flag: 'https://flagcdn.com/w40/it.png', code: 'IT' },
    { name: '브라질', flag: 'https://flagcdn.com/w40/br.png', code: 'BR' },
    { name: '일본', flag: 'https://flagcdn.com/w40/jp.png', code: 'JP' },
    { name: '프랑스', flag: 'https://flagcdn.com/w40/fr.png', code: 'FR' },
    { name: '스페인', flag: 'https://flagcdn.com/w40/es.png', code: 'ES' },
    { name: '대한민국', flag: 'https://flagcdn.com/w40/kr.png', code: 'KR' },
    { name: '미국', flag: 'https://flagcdn.com/w40/us.png', code: 'US' },
    { name: '영국', flag: 'https://flagcdn.com/w40/gb.png', code: 'GB' },
    { name: '독일', flag: 'https://flagcdn.com/w40/de.png', code: 'DE' },
    { name: '호주', flag: 'https://flagcdn.com/w40/au.png', code: 'AU' },
    { name: '캐나다', flag: 'https://flagcdn.com/w40/ca.png', code: 'CA' },
    { name: '네덜란드', flag: 'https://flagcdn.com/w40/nl.png', code: 'NL' },
    { name: '스웨덴', flag: 'https://flagcdn.com/w40/se.png', code: 'SE' },
    { name: '노르웨이', flag: 'https://flagcdn.com/w40/no.png', code: 'NO' },
    { name: '덴마크', flag: 'https://flagcdn.com/w40/dk.png', code: 'DK' },
    { name: '스위스', flag: 'https://flagcdn.com/w40/ch.png', code: 'CH' },
    { name: '오스트리아', flag: 'https://flagcdn.com/w40/at.png', code: 'AT' },
    { name: '벨기에', flag: 'https://flagcdn.com/w40/be.png', code: 'BE' },
    { name: '포르투갈', flag: 'https://flagcdn.com/w40/pt.png', code: 'PT' },
    { name: '그리스', flag: 'https://flagcdn.com/w40/gr.png', code: 'GR' }
]; 