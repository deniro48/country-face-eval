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

// 나라별 선호도 및 얼굴 특징 데이터 (인종 가중치 포함하여 전면 재조정)
const countryData = {
    '대한민국': {
        flag: 'https://flagcdn.com/w320/kr.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.15, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.05, skinClarity: 0.60 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.1, lipNoseRatio: 1.6 }
        },
        features: { '얼굴형': { icon: '😊', description: '갸름한 V라인과 작은 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '또렷한 쌍꺼풀과 큰 눈이 매력적으로 여겨집니다.' }, '코': { icon: '👃', description: '높고 곧은 콧대와 작은 코끝이 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 선명한 입술이 선호됩니다.' } }
    },
    '일본': {
        flag: 'https://flagcdn.com/w320/jp.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.10, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.10, skinClarity: 0.60 },
            idealRatios: { verticalRatio: 1.28, horizontalRatio: 2.25, lipNoseRatio: 1.45 }
        },
        features: { '얼굴형': { icon: '😊', description: '부드러운 계란형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '처진 눈꼬리와 자연스러운 쌍꺼풀이 매력적입니다.' }, '코': { icon: '👃', description: '작고 낮은 코가 귀엽게 여겨집니다.' }, '입술': { icon: '👄', description: '작고 얇은 입술이 선호됩니다.' } }
    },
    '중국': {
        flag: 'https://flagcdn.com/w320/cn.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.10, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.10, skinClarity: 0.60 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.05, lipNoseRatio: 1.65 }
        },
        features: { '얼굴형': { icon: '😊', description: '둥글고 풍만한 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '날렵한 눈매와 긴 눈이 매력적입니다.' }, '코': { icon: '👃', description: '적당한 크기의 코가 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 붉은 입술이 선호됩니다.' } }
    },
    '미국': {
        flag: 'https://flagcdn.com/w320/us.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.25, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.10, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.25, lipNoseRatio: 1.7 }
        },
        features: { '얼굴형': { icon: '😊', description: '각진 턱선과 입체적인 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊은 눈매와 큰 눈동자가 매력적입니다.' }, '코': { icon: '👃', description: '높고 굵은 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '풍만하고 섹시한 입술이 선호됩니다.' } }
    },
    '프랑스': {
        flag: 'https://flagcdn.com/w320/fr.png',
        scoringFactors: {
            weights: { beauty: 0.35, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.10, lipNoseRatio: 0.10, skinClarity: 0.10 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.25, lipNoseRatio: 1.55 }
        },
        features: { '얼굴형': { icon: '😊', description: '세련된 타원형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊이 있는 눈매와 긴 속눈썹이 매력적입니다.' }, '코': { icon: '👃', description: '높고 날렵한 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '자연스럽고 우아한 입술이 선호됩니다.' } }
    },
    '러시아': {
        flag: 'https://flagcdn.com/w320/ru.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.15, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.05, skinClarity: 0.60 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.5 }
        },
        features: { '얼굴형': { icon: '😊', description: '높고 도드라진 광대뼈와 갸름한 턱선이 특징입니다.' }, '눈': { icon: '👀', description: '크고 밝은 색의 눈, 특히 파란색이나 녹색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '곧고 높은 콧대가 미의 기준으로 여겨집니다.' }, '입술': { icon: '👄', description: '너무 두껍지 않은 자연스러운 입술을 선호합니다.' } }
    },
    '브라질': {
        flag: 'https://flagcdn.com/w320/br.png',
        scoringFactors: {
            weights: { beauty: 0.40, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.05, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.3, lipNoseRatio: 1.6 }
        },
        features: { '얼굴형': { icon: '😊', description: '건강미 넘치는 구릿빛 피부와 입체적인 얼굴형이 매력적입니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 다양한 색의 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 얼굴과 조화로운 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 생기 있는 입술이 선호됩니다.' } }
    },
    '인도': {
        flag: 'https://flagcdn.com/w320/in.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, skinClarity: 0.30 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.0, lipNoseRatio: 1.65 }
        },
        features: { '얼굴형': { icon: '😊', description: '계란형의 부드러운 얼굴선이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 짙은 아몬드 모양의 눈, 긴 속눈썹이 매우 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 이상적입니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 도톰한 입술이 매력의 상징입니다.' } }
    },
    '이탈리아': {
        flag: 'https://flagcdn.com/w320/it.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.6 }
        },
        features: { '얼굴형': { icon: '😊', description: '선이 굵고 조각 같은 입체적인 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '짙고 표현력이 풍부한 눈썹과 깊은 눈매가 특징입니다.' }, '코': { icon: '👃', description: '고전적으로 쭉 뻗은 로마 코가 아름답게 여겨집니다.' }, '입술': { icon: '👄', description: '감성적이고 도톰한 입술이 매력적으로 평가됩니다.' } }
    },
    '태국': {
        flag: 'https://flagcdn.com/w320/th.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.10, skinClarity: 0.35 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.15, lipNoseRatio: 1.6 }
        },
        features: { '얼굴형': { icon: '😊', description: '작고 갸름한 얼굴, 부드러운 인상이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 동그란 눈과 쌍꺼풀이 선호되는 경향이 있습니다.' }, '코': { icon: '👃', description: '너무 높지 않고 자연스러운 코를 아름답다고 생각합니다.' }, '입술': { icon: '👄', description: '미소를 머금은 듯한 모양의 도톰한 입술이 인기가 많습니다.' } }
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
    if (!uploadedImage || !selectedGender) {
        alert('이미지를 업로드하고 성별을 선택해주세요.');
        return;
    }

    loadingOverlay.style.display = 'flex';
    
    try {
        // MediaPipe와 Face++ 동시 분석
        const [mediaPipeResult, facePlusPlusResult] = await Promise.all([
            analyzeWithMediaPipe(previewImage),
            analyzeWithFacePlusPlus(uploadedImage)
        ]);

        // MediaPipe가 실패해도 분석은 계속 진행됩니다.
        if (mediaPipeResult.error) {
            console.warn(`MediaPipe 분석 실패: ${mediaPipeResult.error}. Face++ 결과만으로 분석을 계속합니다.`);
        }
        
        // Face++는 필수이므로 실패 시 분석을 중단합니다.
        if (facePlusPlusResult.error || !facePlusPlusResult.faces || facePlusPlusResult.faces.length === 0) {
            throw new Error(facePlusPlusResult.error || 'Face++ API에서 얼굴을 감지하지 못했습니다.');
        }

        // MediaPipe 분석이 실패하면 geometricAnalysis는 빈 객체가 됩니다.
        const geometricAnalysis = mediaPipeResult.landmarks ? analyzeLandmarks(mediaPipeResult.landmarks) : {};
        
        const countryScores = calculateAllCountryScores(geometricAnalysis, facePlusPlusResult);

        displayResults(countryScores, geometricAnalysis, facePlusPlusResult);
        
    } catch (error) {
        loadingOverlay.style.display = 'none';
        alert(`분석 중 오류 발생: ${error.message}`);
    }
}

// MediaPipe 분석 함수 (전역 인스턴스 사용 및 안정성 개선)
function analyzeWithMediaPipe(imageElement) {
    return new Promise((resolve) => {
        const onResults = (results) => {
            clearTimeout(timeoutId);
            faceMesh.onResults(() => {}); // 다른 분석과의 충돌을 막기 위해 리스너를 제거합니다.

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                resolve({ landmarks: results.multiFaceLandmarks[0] });
            } else {
                resolve({ error: 'MediaPipe에서 얼굴을 찾을 수 없습니다.' });
            }
        };

        faceMesh.onResults(onResults);

        const timeoutId = setTimeout(() => {
            faceMesh.onResults(() => {}); // 타임아웃 시 리스너를 제거합니다.
            resolve({ error: 'MediaPipe 분석 시간이 초과되었습니다.' });
        }, 20000); // 20초 타임아웃

        const sendImage = () => {
            try {
                faceMesh.send({ image: imageElement });
            } catch (error) {
                clearTimeout(timeoutId);
                faceMesh.onResults(() => {});
                resolve({ error: `MediaPipe 분석 오류: ${error.message}` });
            }
        };

        // 이미지가 완전히 로드되었는지 확인 후 분석을 요청합니다.
        if (imageElement.complete && imageElement.naturalWidth > 0) {
            sendImage();
        } else {
            imageElement.onload = sendImage;
            imageElement.onerror = () => {
                clearTimeout(timeoutId);
                faceMesh.onResults(() => {});
                resolve({ error: '이미지를 로드할 수 없습니다.' });
            };
        }
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
    // 1. 얼굴 기울기 보정 (고개를 기울여도 정확한 대칭성 측정을 위함)
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const nose = landmarks[9];

    // 얼굴의 수직축과 이미지의 수직축 사이의 각도 계산
    const angleRad = Math.atan2(chin.y - forehead.y, chin.x - forehead.x) - Math.PI / 2;

    // 모든 랜드마크를 코(중심점) 기준으로 회전시켜 기울기를 보정
    const rotatedLandmarks = landmarks.map(p => {
        const x = p.x - nose.x;
        const y = p.y - nose.y;
        const newX = x * Math.cos(-angleRad) - y * Math.sin(-angleRad) + nose.x;
        const newY = x * Math.sin(-angleRad) + y * Math.cos(-angleRad) + nose.y;
        return { ...p, x: newX, y: newY };
    });

    const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    
    // 2. 보정된 랜드마크로 대칭성 계산
    const faceWidth = getDistance(rotatedLandmarks[234], rotatedLandmarks[454]);
    const symmetryPoints = [
        [33, 263], // 눈 바깥쪽
        [133, 362], // 눈 안쪽
        [54, 284], // 입꼬리 위쪽
        [61, 291], // 입술 바깥쪽
        [78, 308]  // 턱 라인
    ];
    
    const asymmetrySum = symmetryPoints.reduce((sum, pair) => {
        const leftPoint = rotatedLandmarks[pair[0]];
        const rightPoint = rotatedLandmarks[pair[1]];
        const centerPoint = rotatedLandmarks[9]; // 보정된 코 위치
        // 얼굴 중심(코 끝점 9)으로부터의 x축 거리 차이
        const leftDist = Math.abs(leftPoint.x - centerPoint.x);
        const rightDist = Math.abs(rightPoint.x - centerPoint.x);
        return sum + Math.abs(leftDist - rightDist);
    }, 0);

    // 비대칭 정도를 얼굴 폭으로 정규화하여 0-1 사이 값으로 만들고, 100을 곱해 점수화
    const asymmetryRatio = asymmetrySum / (faceWidth * symmetryPoints.length);
    // 스케일링 팩터를 5에서 2.5로 줄여 점수를 더 너그럽게 조정 (사용자 경험 개선)
    const symmetryScore = Math.max(0, 100 * (1 - asymmetryRatio * 2.5));

    // 3. 보정된 랜드마크로 얼굴 비율 계산
    const verticalRatio = getDistance(rotatedLandmarks[10], rotatedLandmarks[152]) / getDistance(rotatedLandmarks[168], rotatedLandmarks[6]);
    const horizontalRatio = getDistance(rotatedLandmarks[234], rotatedLandmarks[454]) / getDistance(rotatedLandmarks[130], rotatedLandmarks[243]);
    const lipNoseRatio = getDistance(rotatedLandmarks[61], rotatedLandmarks[291]) / getDistance(rotatedLandmarks[218], rotatedLandmarks[438]);
    
    return { symmetry: symmetryScore, verticalRatio, horizontalRatio, lipNoseRatio };
}

// 국가별 점수 계산
function calculateAllCountryScores(geometric, attributes) {
    // Face++ API 응답 구조에 맞게 데이터 추출
    const faceAttributes = attributes.faces && attributes.faces[0] ? attributes.faces[0].attributes : {};
    
    // 분석된 값이 없을 경우를 대비해 기본값 설정
    const beautyScore = faceAttributes.beauty ? (faceAttributes.beauty.male_score + faceAttributes.beauty.female_score) / 2 : 75;

    return Object.entries(countryData).map(([name, data]) => {
        const factors = data.scoringFactors;
        
        // 1. 각 항목을 0-100점 척도로 변환
        const scores = {};
        scores.symmetry = geometric.symmetry ?? 70;

        const calculateRatioScore = (userValue, idealValue) => {
            if (!userValue || !idealValue) return 70; // 비율 값 없으면 기본 점수
            const diff = Math.abs(userValue - idealValue) / idealValue;
            return Math.max(0, 100 * (1 - diff * 2));
        };
        scores.verticalRatio = geometric.verticalRatio ? calculateRatioScore(geometric.verticalRatio, factors.idealRatios.verticalRatio) : 70;
        scores.horizontalRatio = geometric.horizontalRatio ? calculateRatioScore(geometric.horizontalRatio, factors.idealRatios.horizontalRatio) : 70;
        scores.lipNoseRatio = geometric.lipNoseRatio ? calculateRatioScore(geometric.lipNoseRatio, factors.idealRatios.lipNoseRatio) : 70;
        
        // 새로운 핵심 점수 항목: 피부 점수 (건강도 + 결점)
        const skinStatus = faceAttributes.skinstatus;
        if (skinStatus) {
            const healthScore = skinStatus.health ?? 70;
            const totalBlemish = (skinStatus.stain ?? 0) + (skinStatus.acne ?? 0) + (skinStatus.dark_circle ?? 0);
            const blemishScore = Math.max(0, 100 - totalBlemish * 1.5); // 결점이 많을수록 큰 감점
            // 최종 피부 점수는 건강도(70%)와 결점 없음(30%)을 가중 평균하여 건강도의 영향력을 높임
            scores.skinClarity = (healthScore * 0.7) + (blemishScore * 0.3);
        } else {
            scores.skinClarity = 70; // 분석 불가 시 기본 점수
        }

        // 2. 최종 점수 계산: 각 항목의 점수에 가중치를 적용하여 합산
        let finalScore = (beautyScore * factors.weights.beauty) +
                         (scores.symmetry * factors.weights.symmetry) +
                         (scores.verticalRatio * factors.weights.verticalRatio) +
                         (scores.horizontalRatio * factors.weights.horizontalRatio) +
                         (scores.lipNoseRatio * factors.weights.lipNoseRatio) +
                         (scores.skinClarity * factors.weights.skinClarity);
        
        // 3. 최종 점수를 0-100점 사이 값으로 그대로 사용
        return {
            name,
            flag: data.flag,
            score: Math.min(100, Math.max(0, Math.round(finalScore)))
        };
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
        <div class="country-score"><span>${Math.round(country.score)}</span></div>`;
        countryElement.addEventListener('click', () => selectCountry(country.name));
        countriesList.appendChild(countryElement);
    });
}

// 상세 분석 정보 표시
function displayAdvancedAnalysis(geometric, attributes) {
    const getAnalysisText = (value, unit = '') => (value !== undefined && value !== null) ? `${Math.round(value)}${unit}` : '분석 불가';
    
    // Face++ API 응답 구조에 맞게 데이터 추출
    const faceAttributes = attributes.faces && attributes.faces[0] ? attributes.faces[0].attributes : {};
    
    document.getElementById('estimatedAge').textContent = getAnalysisText(faceAttributes.age?.value, '세');
    document.getElementById('faceQuality').textContent = getAnalysisText(faceAttributes.facequality?.value, '점');
    document.getElementById('beautyScore').textContent = getAnalysisText(
        ((faceAttributes.beauty?.male_score ?? 0) + (faceAttributes.beauty?.female_score ?? 0)) / 2, '점'
    );
    
    const emotion = faceAttributes.emotion ? Object.keys(faceAttributes.emotion).reduce((a, b) => faceAttributes.emotion[a] > faceAttributes.emotion[b] ? a : b) : '분석 불가';
    document.getElementById('emotionAnalysis').textContent = emotion;

    const skin = faceAttributes.skinstatus;
    const skinText = `건강 ${getAnalysisText(skin.health, '%')}, 잡티 ${getAnalysisText(skin.stain, '%')}<br>여드름 ${getAnalysisText(skin.acne, '%')}, 다크서클 ${getAnalysisText(skin.dark_circle, '%')}`;
    document.getElementById('skinCondition').innerHTML = skinText;
    
    document.getElementById('geometricAnalysis').textContent = `세로: ${getAnalysisText(geometric.verticalRatio)}, 가로: ${getAnalysisText(geometric.horizontalRatio)}, 입/코: ${getAnalysisText(geometric.lipNoseRatio)}`;
    document.getElementById('poseAnalysis').textContent = `${getAnalysisText(geometric.symmetry, '점')}`;
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
    title.innerHTML = `👑 ${countryName}의 선호하는 얼굴 생김새`;
    list.appendChild(title);

    Object.entries(features).forEach(([feature, data]) => {
        const item = document.createElement('div');
        item.className = 'facial-feature-item';
        item.innerHTML = `
            <div class="facial-feature-title">${data.icon} ${feature}</div>
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

// 강제 재배포를 위한 주석