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
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.4, verticalRatio: 0.1, horizontalRatio: 0.05, lipNoseRatio: 0.05, smiling: 0.05, ethnicity: 0.2 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '갸름한 V라인과 작은 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '또렷한 쌍꺼풀과 큰 눈이 매력적으로 여겨집니다.' }, '코': { icon: '👃', description: '높고 곧은 콧대와 작은 코끝이 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 선명한 입술이 선호됩니다.' } }
    },
    '일본': {
        flag: 'https://flagcdn.com/w320/jp.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.2, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.05, ethnicity: 0.15 },
            idealRatios: { verticalRatio: 1.25, horizontalRatio: 2.3, lipNoseRatio: 1.4 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '부드러운 계란형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '처진 눈꼬리와 자연스러운 쌍꺼풀이 매력적입니다.' }, '코': { icon: '👃', description: '작고 낮은 코가 귀엽게 여겨집니다.' }, '입술': { icon: '👄', description: '작고 얇은 입술이 선호됩니다.' } }
    },
    '중국': {
        flag: 'https://flagcdn.com/w320/cn.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.15, verticalRatio: 0.2, horizontalRatio: 0.15, lipNoseRatio: 0.1, smiling: 0.05, ethnicity: 0.15 },
            idealRatios: { verticalRatio: 1.28, horizontalRatio: 2.1, lipNoseRatio: 1.65 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '둥글고 풍만한 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '날렵한 눈매와 긴 눈이 매력적입니다.' }, '코': { icon: '👃', description: '적당한 크기의 코가 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 붉은 입술이 선호됩니다.' } }
    },
    '미국': {
        flag: 'https://flagcdn.com/w320/us.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.2, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.3, ethnicity: 0.05 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.2, lipNoseRatio: 1.7 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '각진 턱선과 입체적인 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊은 눈매와 큰 눈동자가 매력적입니다.' }, '코': { icon: '👃', description: '높고 굵은 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '풍만하고 섹시한 입술이 선호됩니다.' } }
    },
    '프랑스': {
        flag: 'https://flagcdn.com/w320/fr.png',
        scoringFactors: {
            weights: { beauty: 0.5, symmetry: 0.15, verticalRatio: 0.1, horizontalRatio: 0.05, lipNoseRatio: 0.05, smiling: 0.1, ethnicity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.25, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '세련된 타원형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊이 있는 눈매와 긴 속눈썹이 매력적입니다.' }, '코': { icon: '👃', description: '높고 날렵한 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '자연스럽고 우아한 입술이 선호됩니다.' } }
    },
    '러시아': {
        flag: 'https://flagcdn.com/w320/ru.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.35, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.05, smiling: 0.05, ethnicity: 0.1 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '높고 도드라진 광대뼈와 갸름한 턱선이 특징입니다.' }, '눈': { icon: '👀', description: '크고 밝은 색의 눈, 특히 파란색이나 녹색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '곧고 높은 콧대가 미의 기준으로 여겨집니다.' }, '입술': { icon: '👄', description: '너무 두껍지 않은 자연스러운 입술을 선호합니다.' } }
    },
    '브라질': {
        flag: 'https://flagcdn.com/w320/br.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.15, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.4, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.3, lipNoseRatio: 1.6 },
            idealEthnicity: '' // 다양한 인종이 공존하므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '건강미 넘치는 구릿빛 피부와 입체적인 얼굴형이 매력적입니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 다양한 색의 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 얼굴과 조화로운 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 생기 있는 입술이 선호됩니다.' } }
    },
    '인도': {
        flag: 'https://flagcdn.com/w320/in.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.1, verticalRatio: 0.15, horizontalRatio: 0.2, lipNoseRatio: 0.1, smiling: 0.05, ethnicity: 0.2 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.0, lipNoseRatio: 1.65 },
            idealEthnicity: 'Indian'
        },
        features: { '얼굴형': { icon: '😊', description: '계란형의 부드러운 얼굴선이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 짙은 아몬드 모양의 눈, 긴 속눈썹이 매우 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 이상적입니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 도톰한 입술이 매력의 상징입니다.' } }
    },
    '이탈리아': {
        flag: 'https://flagcdn.com/w320/it.png',
        scoringFactors: {
            weights: { beauty: 0.3, symmetry: 0.25, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.05, ethnicity: 0.05 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '선이 굵고 조각 같은 입체적인 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '짙고 표현력이 풍부한 눈썹과 깊은 눈매가 특징입니다.' }, '코': { icon: '👃', description: '고전적으로 쭉 뻗은 로마 코가 아름답게 여겨집니다.' }, '입술': { icon: '👄', description: '감성적이고 도톰한 입술이 매력적으로 평가됩니다.' } }
    },
    '태국': {
        flag: 'https://flagcdn.com/w320/th.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.2, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.05, smiling: 0.1, ethnicity: 0.15 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '작고 갸름한 얼굴, 부드러운 인상이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 동그란 눈과 쌍꺼풀이 선호되는 경향이 있습니다.' }, '코': { icon: '👃', description: '너무 높지 않고 자연스러운 코를 아름답다고 생각합니다.' }, '입술': { icon: '👄', description: '미소를 머금은 듯한 모양의 도톰한 입술이 인기가 많습니다.' } }
    },
    '스페인': {
        flag: 'https://flagcdn.com/w320/es.png',
        scoringFactors: {
            weights: { beauty: 0.35, symmetry: 0.2, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.15, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: '' // 다양한 인종이 공존하므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '따뜻하고 열정적인 느낌의 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 갈색 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 생기 있는 입술이 매력적입니다.' } }
    },
    '독일': {
        flag: 'https://flagcdn.com/w320/de.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.4, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.05, smiling: 0.05, ethnicity: 0.05 },
            idealRatios: { verticalRatio: 1.37, horizontalRatio: 2.25, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '정확하고 정돈된 얼굴형, 강한 턱선이 특징입니다.' }, '눈': { icon: '👀', description: '차분하고 신뢰감 있는 눈매, 파란색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '곧고 정확한 비율의 코가 이상적입니다.' }, '입술': { icon: '👄', description: '균형잡힌 크기의 입술을 선호합니다.' } }
    },
    '영국': {
        flag: 'https://flagcdn.com/w320/gb.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.3, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.05, ethnicity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '고전적이고 우아한 얼굴형, 부드러운 선이 특징입니다.' }, '눈': { icon: '👀', description: '차분하고 지적인 눈매, 녹색이나 회색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '세련되고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '자연스럽고 우아한 입술이 이상적입니다.' } }
    },
    '캐나다': {
        flag: 'https://flagcdn.com/w320/ca.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.25, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.25, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.65 },
            idealEthnicity: '' // 다문화 국가이므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '자연스럽고 건강한 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '밝고 친근한 눈매, 다양한 색의 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '자연스럽고 건강한 입술이 매력적입니다.' } }
    },
    '호주': {
        flag: 'https://flagcdn.com/w320/au.png',
        scoringFactors: {
            weights: { beauty: 0.2, symmetry: 0.2, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.3, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.25, lipNoseRatio: 1.6 },
            idealEthnicity: '' // 다문화 국가이므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '자연스럽고 건강한 얼굴형, 햇볕에 그을린 피부가 매력적입니다.' }, '눈': { icon: '👀', description: '밝고 생기 있는 눈매, 파란색이나 녹색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '자연스럽고 건강한 입술이 이상적입니다.' } }
    },
    '멕시코': {
        flag: 'https://flagcdn.com/w320/mx.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.15, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.35, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.2, lipNoseRatio: 1.65 },
            idealEthnicity: '' // 다양한 인종이 공존하므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '따뜻하고 친근한 얼굴형, 구릿빛 피부가 매력적입니다.' }, '눈': { icon: '👀', description: '깊고 따뜻한 눈매, 갈색 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 생기 있는 입술이 매력적입니다.' } }
    },
    '아르헨티나': {
        flag: 'https://flagcdn.com/w320/ar.png',
        scoringFactors: {
            weights: { beauty: 0.3, symmetry: 0.2, verticalRatio: 0.1, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.2, ethnicity: 0.0 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: '' // 다양한 인종이 공존하므로 인종 점수 반영 안함
        },
        features: { '얼굴형': { icon: '😊', description: '열정적이고 매력적인 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 갈색이나 녹색 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 매력적인 입술이 이상적입니다.' } }
    },
    '터키': {
        flag: 'https://flagcdn.com/w320/tr.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.2, verticalRatio: 0.15, horizontalRatio: 0.1, lipNoseRatio: 0.1, smiling: 0.1, ethnicity: 0.1 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.1, lipNoseRatio: 1.65 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '동서양이 조화된 독특한 얼굴형이 매력적입니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 갈색이나 녹색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '자연스럽고 균형잡힌 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 매력적인 입술이 이상적입니다.' } }
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
            analyzeWithMediaPipe(uploadedImage),
            analyzeWithFacePlusPlus(uploadedImage)
        ]);

        if (mediaPipeResult.error) {
            throw new Error(mediaPipeResult.error);
        }

        if (facePlusPlusResult.error) {
            throw new Error(facePlusPlusResult.error);
        }

        const geometricAnalysis = analyzeLandmarks(mediaPipeResult.landmarks);
        
        // Face++ API 응답 전체를 전달
        const countryScores = calculateAllCountryScores(geometricAnalysis, facePlusPlusResult);

        displayResults(countryScores, geometricAnalysis, facePlusPlusResult);
        
    } catch (error) {
        loadingOverlay.style.display = 'none';
        alert(`분석 중 오류 발생: ${error.message}`);
    }
}

// MediaPipe 분석 함수
function analyzeWithMediaPipe(image) {
    return new Promise((resolve) => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        
        faceMesh.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                resolve({ landmarks: results.multiFaceLandmarks[0] });
            } else {
                resolve({ error: '얼굴을 찾을 수 없습니다.' });
            }
            faceMesh.close(); // 분석 후 리소스 해제
        });

        const processImage = () => {
            try {
                faceMesh.send({ image });
            } catch (error) {
                 resolve({ error: `MediaPipe 분석 오류: ${error.message}` });
            }
        };

        if (image.complete && image.naturalWidth > 0) {
            processImage();
        } else {
            image.onload = processImage;
            image.onerror = () => resolve({ error: '이미지를 로드할 수 없습니다.' });
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
        
        // 디버깅: Face++ API 응답 구조 확인
        console.log('Face++ API 응답:', data);
        if (data.faces && data.faces[0]) {
            console.log('얼굴 속성:', data.faces[0].attributes);
            console.log('미소 점수:', data.faces[0].attributes?.smile);
            console.log('인종 정보:', data.faces[0].attributes?.ethnicity);
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
    // Face++ API 응답 구조에 맞게 데이터 추출
    const faceAttributes = attributes.faces && attributes.faces[0] ? attributes.faces[0].attributes : {};
    
    // 분석된 값이 없을 경우를 대비해 기본값 설정
    const beautyScore = faceAttributes.beauty ? (faceAttributes.beauty.male_score + faceAttributes.beauty.female_score) / 2 : 75;
    
    // Face++ API에서는 'smile'로 반환되므로 이를 'smiling'으로 매핑
    const smileScore = faceAttributes.smile ? faceAttributes.smile.value : 50;
    
    // 인종 정보 처리 (빈 문자열인 경우 기본값 사용)
    const detectedEthnicity = faceAttributes.ethnicity && faceAttributes.ethnicity.value ? faceAttributes.ethnicity.value : 'N/A';

    console.log('추출된 데이터:', {
        beautyScore,
        smileScore,
        detectedEthnicity,
        faceAttributes
    });

    return Object.entries(countryData).map(([name, data]) => {
        const factors = data.scoringFactors;
        
        // 1. 각 항목을 0-100점 척도로 변환
        const scores = {};
        scores.symmetry = geometric.symmetry;
        scores.smiling = smileScore;

        const calculateRatioScore = (userValue, idealValue) => {
            if (!userValue || !idealValue) return 70; // 비율 값 없으면 기본 점수
            const diff = Math.abs(userValue - idealValue) / idealValue;
            return Math.max(0, 100 * (1 - diff * 2));
        };
        scores.verticalRatio = calculateRatioScore(geometric.verticalRatio, factors.idealRatios.verticalRatio);
        scores.horizontalRatio = calculateRatioScore(geometric.horizontalRatio, factors.idealRatios.horizontalRatio);
        scores.lipNoseRatio = calculateRatioScore(geometric.lipNoseRatio, factors.idealRatios.lipNoseRatio);
        
        scores.ethnicity = (detectedEthnicity === factors.idealEthnicity) ? 100 : 75; // 인종 일치 시 100점, 불일치 시 75점 (큰 페널티 방지)
        if (!factors.idealEthnicity) scores.ethnicity = 85; // 인종을 보지 않는 국가는 기본 점수

        // 2. 최종 점수 계산: 각 항목의 점수에 가중치를 적용하여 합산
        let finalScore = (beautyScore * factors.weights.beauty) +
                         (scores.symmetry * factors.weights.symmetry) +
                         (scores.verticalRatio * factors.weights.verticalRatio) +
                         (scores.horizontalRatio * factors.weights.horizontalRatio) +
                         (scores.lipNoseRatio * factors.weights.lipNoseRatio) +
                         (scores.smiling * factors.weights.smiling) +
                         (scores.ethnicity * factors.weights.ethnicity);
        
        // 3. 최종 점수를 70~99점 사이로 조정
        const normalizedScore = 70 + (finalScore / 100) * 29;

        return {
            name,
            flag: data.flag,
            score: Math.min(99, Math.max(70, Math.round(normalizedScore)))
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
        <div class="country-score"><span>${Math.round(country.score)}</span>점</div>`;
        countryElement.addEventListener('click', () => selectCountry(country.name));
        countriesList.appendChild(countryElement);
    });
}

// 상세 분석 정보 표시
function displayAdvancedAnalysis(geometric, attributes) {
    const getAnalysisText = (value, unit = '') => value ? `${Math.round(value)}${unit}` : '분석 불가';
    
    // Face++ API 응답 구조에 맞게 데이터 추출
    const faceAttributes = attributes.faces && attributes.faces[0] ? attributes.faces[0].attributes : {};
    
    document.getElementById('estimatedAge').textContent = getAnalysisText(faceAttributes.age?.value, '세');
    document.getElementById('smileScore').textContent = getAnalysisText(faceAttributes.smile?.value, '점');
    document.getElementById('faceQuality').textContent = getAnalysisText(faceAttributes.facequality?.value, '점');
    document.getElementById('beautyScore').textContent = getAnalysisText((faceAttributes.beauty?.male_score + faceAttributes.beauty?.female_score) / 2, '점');
    document.getElementById('ethnicity').textContent = faceAttributes.ethnicity?.value || '분석 불가';

    const emotion = faceAttributes.emotion ? Object.keys(faceAttributes.emotion).reduce((a, b) => faceAttributes.emotion[a] > faceAttributes.emotion[b] ? a : b) : '분석 불가';
    document.getElementById('emotionAnalysis').textContent = emotion;

    const skin = faceAttributes.skinstatus;
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