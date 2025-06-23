// 전역 변수 선언
let selectedGender = null;
let uploadedImage = null;

// 카메라 관련 변수들
let cameraStream = null;
let capturedImageData = null;

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

// 카메라 관련 DOM 요소들
const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const usePhotoBtn = document.getElementById('usePhotoBtn');

// 모바일 뷰 토글 관련 DOM 요소
const mobileViewToggle = document.getElementById('mobileViewToggle');

// 나라별 선호도 및 얼굴 특징 데이터 (인종 가중치 포함하여 전면 재조정)
const countryData = {
    '대한민국': {
        flag: 'https://flagcdn.com/w320/kr.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.15, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.45, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '갸름한 V라인과 작은 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '또렷한 쌍꺼풀과 큰 눈이 매력적으로 여겨집니다.' }, '코': { icon: '👃', description: '높고 곧은 콧대와 작은 코끝이 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 선명한 입술이 선호됩니다.' } }
    },
    '일본': {
        flag: 'https://flagcdn.com/w320/jp.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.10, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.45, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.28, horizontalRatio: 2.25, lipNoseRatio: 1.45 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '부드러운 계란형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '처진 눈꼬리와 자연스러운 쌍꺼풀이 매력적입니다.' }, '코': { icon: '👃', description: '작고 낮은 코가 귀엽게 여겨집니다.' }, '입술': { icon: '👄', description: '작고 얇은 입술이 선호됩니다.' } }
    },
    '중국': {
        flag: 'https://flagcdn.com/w320/cn.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.10, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.45, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.05, lipNoseRatio: 1.65 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '둥글고 풍만한 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '날렵한 눈매와 긴 눈이 매력적입니다.' }, '코': { icon: '👃', description: '적당한 크기의 코가 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 붉은 입술이 선호됩니다.' } }
    },
    '미국': {
        flag: 'https://flagcdn.com/w320/us.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.25, lipNoseRatio: 1.7 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '각진 턱선과 입체적인 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊은 눈매와 큰 눈동자가 매력적입니다.' }, '코': { icon: '👃', description: '높고 굵은 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '풍만하고 섹시한 입술이 선호됩니다.' } }
    },
    '프랑스': {
        flag: 'https://flagcdn.com/w320/fr.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.25, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '세련된 타원형 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '깊이 있는 눈매와 긴 속눈썹이 매력적입니다.' }, '코': { icon: '👃', description: '높고 날렵한 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '자연스럽고 우아한 입술이 선호됩니다.' } }
    },
    '러시아': {
        flag: 'https://flagcdn.com/w320/ru.png',
        scoringFactors: {
            weights: { beauty: 0.10, symmetry: 0.15, verticalRatio: 0.05, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.45, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '높고 도드라진 광대뼈와 갸름한 턱선이 특징입니다.' }, '눈': { icon: '👀', description: '크고 밝은 색의 눈, 특히 파란색이나 녹색 눈이 선호됩니다.' }, '코': { icon: '👃', description: '곧고 높은 콧대가 미의 기준으로 여겨집니다.' }, '입술': { icon: '👄', description: '너무 두껍지 않은 자연스러운 입술을 선호합니다.' } }
    },
    '브라질': {
        flag: 'https://flagcdn.com/w320/br.png',
        scoringFactors: {
            weights: { beauty: 0.35, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.10, ethnicity: 0.05, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.3, lipNoseRatio: 1.6 },
            idealEthnicity: null
        },
        features: { '얼굴형': { icon: '😊', description: '건강미 넘치는 구릿빛 피부와 입체적인 얼굴형이 매력적입니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 다양한 색의 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 얼굴과 조화로운 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 생기 있는 입술이 선호됩니다.' } }
    },
    '인도': {
        flag: 'https://flagcdn.com/w320/in.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.10, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.30, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.0, lipNoseRatio: 1.65 },
            idealEthnicity: 'Indian'
        },
        features: { '얼굴형': { icon: '😊', description: '계란형의 부드러운 얼굴선이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 짙은 아몬드 모양의 눈, 긴 속눈썹이 매우 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 이상적입니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 도톰한 입술이 매력의 상징입니다.' } }
    },
    '이탈리아': {
        flag: 'https://flagcdn.com/w320/it.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '선이 굵고 조각 같은 입체적인 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '짙고 표현력이 풍부한 눈썹과 깊은 눈매가 특징입니다.' }, '코': { icon: '👃', description: '고전적으로 쭉 뻗은 로마 코가 아름답게 여겨집니다.' }, '입술': { icon: '👄', description: '감성적이고 도톰한 입술이 매력적으로 평가됩니다.' } }
    },
    '태국': {
        flag: 'https://flagcdn.com/w320/th.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.10, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.10, ethnicity: 0.30, skinClarity: 0.15 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '작고 갸름한 얼굴, 부드러운 인상이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 동그란 눈과 쌍꺼풀이 선호되는 경향이 있습니다.' }, '코': { icon: '👃', description: '너무 높지 않고 자연스러운 코를 아름답다고 생각합니다.' }, '입술': { icon: '👄', description: '미소를 머금은 듯한 모양의 도톰한 입술이 인기가 많습니다.' } }
    },
    '영국': {
        flag: 'https://flagcdn.com/w320/gb.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '👑', description: '오각형 얼굴형과 날렵한 턱선이 세련미를 더합니다.' }, '눈': { icon: '👀', description: '차분하고 깊이 있는 눈매가 지적인 이미지를 줍니다.' }, '코': { icon: '👃', description: '곧고 클래식한 코가 귀족적인 느낌을 줍니다.' }, '입술': { icon: '👄', description: '너무 두껍지 않고 균형 잡힌 입술이 선호됩니다.' } }
    },
    '독일': {
        flag: 'https://flagcdn.com/w320/de.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.37, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '각진 턱과 도드라진 광대뼈가 강인한 인상을 줍니다.' }, '눈': { icon: '👀', description: '뚜렷하고 진지한 눈매, 밝은 색 눈동자가 많습니다.' }, '코': { icon: '👃', description: '곧고 약간은 매부리코 형태가 자연스럽게 여겨집니다.' }, '입술': { icon: '👄', description: '얇고 섬세한 입술이 지적인 느낌을 줍니다.' } }
    },
    '스페인': {
        flag: 'https://flagcdn.com/w320/es.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.15, lipNoseRatio: 1.65 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '💃', description: '올리브 톤의 피부와 계란형 얼굴이 건강미를 상징합니다.' }, '눈': { icon: '👀', description: '크고 짙은 아몬드 모양의 눈이 정열적으로 보입니다.' }, '코': { icon: '👃', description: '선이 굵고 강한 인상을 주는 코가 매력적입니다.' }, '입술': { icon: '👄', description: '도톰하고 표현력이 풍부한 입술이 선호됩니다.' } }
    },
    '스웨덴': {
        flag: 'https://flagcdn.com/w320/se.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.25, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '❄️', description: '높은 광대뼈와 날카로운 턱선을 가진 얼굴형이 이상적입니다.' }, '눈': { icon: '👀', description: '밝은 파란색이나 녹색의 눈이 신비로운 느낌을 줍니다.' }, '코': { icon: '👃', description: '가늘고 곧은 코가 세련된 인상을 줍니다.' }, '입술': { icon: '👄', description: '자연스럽고 너무 두껍지 않은 입술이 선호됩니다.' } }
    },
    '네덜란드': {
        flag: 'https://flagcdn.com/w320/nl.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.15, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '자연스럽고 건강해 보이는 얼굴, 개성을 중시합니다.' }, '눈': { icon: '👀', description: '친절하고 열려있는 인상을 주는 눈매가 매력적입니다.' }, '코': { icon: '👃', description: '인위적이지 않고 자연스러운 코를 선호합니다.' }, '입술': { icon: '👄', description: '미소가 아름다운 입술이 긍정적인 이미지를 줍니다.' } }
    },
    '캐나다': {
        flag: 'https://flagcdn.com/w320/ca.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🍁', description: '자연스럽고 건강미 넘치는 얼굴이 선호됩니다.' }, '눈': { icon: '👀', description: '다양한 인종이 공존하여 눈 색깔과 모양이 다양합니다.' }, '코': { icon: '👃', description: '얼굴 전체와 조화를 이루는 코가 아름답습니다.' }, '입술': { icon: '👄', description: '친근한 미소를 가진 입술이 매력적으로 여겨집니다.' } }
    },
    '멕시코': {
        flag: 'https://flagcdn.com/w320/mx.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.1, lipNoseRatio: 1.7 },
            idealEthnicity: 'Latin'
        },
        features: { '얼굴형': { icon: '😊', description: '토착민과 유럽인의 특징이 혼합된 얼굴형이 많습니다.' }, '눈': { icon: '👀', description: '크고 짙은 눈이 매력적이며, 강렬한 인상을 줍니다.' }, '코': { icon: '👃', description: '약간 넓고 강한 콧대가 특징입니다.' }, '입술': { icon: '👄', description: '도톰하고 풍만한 입술이 아름답게 여겨집니다.' } }
    },
    '아르헨티나': {
        flag: 'https://flagcdn.com/w320/ar.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '남유럽의 영향을 받아 이목구비가 뚜렷하고 입체적입니다.' }, '눈': { icon: '👀', description: '깊고 표현력이 풍부한 눈매가 매력적입니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 세련된 이미지를 줍니다.' }, '입술': { icon: '👄', description: '우아하고 균형 잡힌 입술을 선호합니다.' } }
    },
    '베트남': {
        flag: 'https://flagcdn.com/w320/vn.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.40, skinClarity: 0.10 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.1, lipNoseRatio: 1.5 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '작고 갸름한 V-라인 얼굴과 하얀 피부를 선호합니다.' }, '눈': { icon: '👀', description: '크고 동그란 눈, 쌍꺼풀이 있는 눈을 아름답게 생각합니다.' }, '코': { icon: '👃', description: '높고 곧게 뻗은 콧대가 이상적으로 여겨집니다.' }, '입술': { icon: '👄', description: '앵두처럼 작고 도톰한 입술을 선호합니다.' } }
    },
    '필리핀': {
        flag: 'https://flagcdn.com/w320/ph.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.10, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.31, horizontalRatio: 2.05, lipNoseRatio: 1.7 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '스페인과 미국의 영향을 받아 동서양의 특징이 혼합된 얼굴이 많습니다.' }, '눈': { icon: '👀', description: '크고 표현력 있는 눈이 매력의 중심으로 여겨집니다.' }, '코': { icon: '👃', description: '너무 높지 않으면서도 오똑한 코를 선호합니다.' }, '입술': { icon: '👄', description: '살짝 도톰하고 자연스러운 모양의 입술이 이상적입니다.' } }
    },
    '터키': {
        flag: 'https://flagcdn.com/w320/tr.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '동서양이 조화된 타원형 얼굴에 뚜렷한 이목구비가 특징입니다.' }, '눈': { icon: '👀', description: '아몬드 모양의 신비로운 눈, 짙은 눈썹이 아름답습니다.' }, '코': { icon: '👃', description: '살짝 높고 곧은 코를 선호하며, 너무 뾰족하지 않은 코를 이상적으로 봅니다.' }, '입술': { icon: '👄', description: '도톰하고 관능적인 입술이 매력적으로 여겨집니다.' } }
    },
    '아랍에미리트': {
        flag: 'https://flagcdn.com/w320/ae.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.1, lipNoseRatio: 1.65 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '😊', description: '갸름한 타원형 얼굴과 뚜렷한 윤곽이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 깊은 눈, 긴 속눈썹, 화려한 아이 메이크업이 특징입니다.' }, '코': { icon: '👃', description: '작고 오똑한 코가 이상적으로 여겨집니다.' }, '입술': { icon: '👄', description: '도톰하고 윤곽이 분명한 입술이 아름답습니다.' } }
    },
    '나이지리아': {
        flag: 'https://flagcdn.com/w320/ng.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.15, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.0, lipNoseRatio: 1.8 },
            idealEthnicity: 'Black'
        },
        features: { '얼굴형': { icon: '😊', description: '뚜렷한 이목구비와 대칭적인 얼굴이 중요하게 여겨집니다.' }, '눈': { icon: '👀', description: '크고 맑은 눈이 아름다움의 상징입니다.' }, '코': { icon: '👃', description: '넓지만 얼굴과 조화를 이루는 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 풍만한 입술이 매력적으로 평가됩니다.' } }
    },
    '이집트': {
        flag: 'https://flagcdn.com/w320/eg.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '😊', description: '고대 벽화처럼 신비롭고 이국적인 외모가 매력적입니다.' }, '눈': { icon: '👀', description: '아이라인으로 강조한 아몬드 모양의 눈(클레오파트라의 눈)이 이상적입니다.' }, '코': { icon: '👃', description: '곧고 날렵한 코가 세련미를 더합니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 균형 잡힌 입술이 선호됩니다.' } }
    },
    '남아프리카공화국': {
        flag: 'https://flagcdn.com/w320/za.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.10, ethnicity: 0.05, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: null 
        },
        features: { '얼굴형': { icon: '😊', description: '다양한 인종이 공존하여 미의 기준이 매우 다채롭습니다.' }, '눈': { icon: '👀', description: '개성 있고 생기 넘치는 눈빛이 중요하게 여겨집니다.' }, '코': { icon: '👃', description: '자연스럽고 조화로운 코가 아름답다고 평가됩니다.' }, '입술': { icon: '👄', description: '자신감 있는 미소를 가진 입술이 매력적입니다.' } }
    },
    '호주': {
        flag: 'https://flagcdn.com/w320/au.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.25, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '☀️', description: '햇볕에 건강하게 그을린 피부와 운동으로 다져진 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '자유롭고 활기찬 분위기의 눈매가 매력적입니다.' }, '코': { icon: '👃', description: '자연스럽고 오똑한 코가 이상적으로 여겨집니다.' }, '입술': { icon: '👄', description: '밝고 건강한 미소를 머금은 입술이 아름답습니다.' } }
    },
    '폴란드': {
        flag: 'https://flagcdn.com/w320/pl.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '하트형 또는 타원형 얼굴에 높은 광대뼈가 우아함을 더합니다.' }, '눈': { icon: '👀', description: '크고 표현력 있는 눈, 특히 밝은 색 눈동자가 선호됩니다.' }, '코': { icon: '👃', description: '가늘고 곧은 코가 세련된 인상을 줍니다.' }, '입술': { icon: '👄', description: '자연스럽게 도톰한 입술이 아름답게 여겨집니다.' } }
    },
    '그리스': {
        flag: 'https://flagcdn.com/w320/gr.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🏛️', description: '조각상처럼 강한 턱선과 올리브 톤 피부가 특징입니다.' }, '눈': { icon: '👀', description: '짙은 아몬드 모양의 눈과 두꺼운 눈썹이 조화롭습니다.' }, '코': { icon: '👃', description: '고전적인 "그리스 코"로 불리는 곧고 높은 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 균형 잡힌 입술을 선호합니다.' } }
    },
    '아일랜드': {
        flag: 'https://flagcdn.com/w320/ie.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.37, horizontalRatio: 2.25, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🍀', description: '주근깨가 있는 창백한 피부와 강한 광대뼈가 매력적입니다.' }, '눈': { icon: '👀', description: '밝고 생기 있는 눈, 특히 녹색 눈이 상징적입니다.' }, '코': { icon: '👃', description: '자연스럽고 약간은 위로 향한 코가 귀여운 인상을 줍니다.' }, '입술': { icon: '👄', description: '붉은 머리카락과 대조되는 얇고 섬세한 입술이 특징입니다.' } }
    },
    '스위스': {
        flag: 'https://flagcdn.com/w320/ch.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.25, verticalRatio: 0.15, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🏔️', description: '꾸미지 않은 자연미와 깨끗하고 건강한 피부를 중시합니다.' }, '눈': { icon: '👀', description: '독일, 프랑스, 이탈리아의 영향으로 다양한 눈 모양이 나타납니다.' }, '코': { icon: '👃', description: '인위적이지 않고 얼굴과 조화를 이루는 코를 선호합니다.' }, '입술': { icon: '👄', description: '건강하고 자연스러운 입술이 아름답습니다.' } }
    },
    '콜롬비아': {
        flag: 'https://flagcdn.com/w320/co.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.20, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.1, lipNoseRatio: 1.75 },
            idealEthnicity: 'Latin'
        },
        features: { '얼굴형': { icon: '💃', description: '건강한 구릿빛 피부와 뚜렷한 이목구비가 라틴미를 상징합니다.' }, '눈': { icon: '👀', description: '크고 짙은 눈이 열정적인 인상을 줍니다.' }, '코': { icon: '👃', description: '조화롭고 약간은 날렵한 코가 선호됩니다.' }, '입술': { icon: '👄', description: '풍만하고 매혹적인 입술이 아름다움의 중요한 요소입니다.' } }
    },
    '페루': {
        flag: 'https://flagcdn.com/w320/pe.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.31, horizontalRatio: 2.05, lipNoseRatio: 1.6 },
            idealEthnicity: 'Latin'
        },
        features: { '얼굴형': { icon: '🦙', description: '안데스 원주민의 혈통으로 높은 광대뼈가 특징입니다.' }, '눈': { icon: '👀', description: '깊고 어두운 아몬드 모양의 눈이 신비감을 줍니다.' }, '코': { icon: '👃', description: '강하고 약간은 매부리코 모양의 코가 인상적입니다.' }, '입술': { icon: '👄', description: '두껍고 윤곽이 뚜렷한 입술이 선호됩니다.' } }
    },
    '인도네시아': {
        flag: 'https://flagcdn.com/w320/id.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.40, skinClarity: 0.10 },
            idealRatios: { verticalRatio: 1.29, horizontalRatio: 2.1, lipNoseRatio: 1.55 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '부드러운 타원형 얼굴과 밝은 갈색 피부톤을 선호합니다.' }, '눈': { icon: '👀', description: '크고 순한 눈매를 가진 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '너무 높지 않고 자연스러운 콧대가 이상적입니다.' }, '입술': { icon: '👄', description: '미소를 머금은 듯한 자연스러운 입술이 매력적입니다.' } }
    },
    '말레이시아': {
        flag: 'https://flagcdn.com/w320/my.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.10, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'Asian'
        },
        features: { '얼굴형': { icon: '😊', description: '다문화 사회로, 갸름한 얼굴과 밝은 피부가 공통적으로 선호됩니다.' }, '눈': { icon: '👀', description: '크고 쌍꺼풀이 있는 눈이 아름답다고 여겨집니다.' }, '코': { icon: '👃', description: '높고 오똑한 콧대가 세련미를 더합니다.' }, '입술': { icon: '👄', description: '적당히 도톰하고 균형 잡힌 입술이 이상적입니다.' } }
    },
    '이스라엘': {
        flag: 'https://flagcdn.com/w320/il.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '✡️', description: '지중해와 중동의 특징이 섞여 개성있는 외모를 선호합니다.' }, '눈': { icon: '👀', description: '녹색이나 파란색 등 밝은 눈동자가 매력적으로 여겨집니다.' }, '코': { icon: '👃', description: '약간은 강한 인상을 주는 코도 개성으로 존중됩니다.' }, '입술': { icon: '👄', description: '자연스럽고 표현력이 풍부한 입술이 아름답습니다.' } }
    },
    '사우디아라비아': {
        flag: 'https://flagcdn.com/w320/sa.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.1, lipNoseRatio: 1.65 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '😊', description: '전통적으로 타원형의 갸름한 얼굴이 미의 기준입니다.' }, '눈': { icon: '👀', description: '크고 검은 "사막의 눈"이 아름다움의 상징입니다.' }, '코': { icon: '👃', description: '작고 날렵한 코가 이상적으로 여겨집니다.' }, '입술': { icon: '👄', description: '도톰하고 윤곽이 뚜렷한 입술이 선호됩니다.' } }
    },
    '에티오피아': {
        flag: 'https://flagcdn.com/w320/et.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.05, lipNoseRatio: 1.5 },
            idealEthnicity: 'Black'
        },
        features: { '얼굴형': { icon: '😊', description: '높은 광대뼈와 갸름한 턱선을 가진 타원형 얼굴이 특징입니다.' }, '눈': { icon: '👀', description: '크고 아몬드 모양의 눈이 매력적으로 평가됩니다.' }, '코': { icon: '👃', description: '다른 아프리카 지역에 비해 상대적으로 좁고 높은 코를 선호합니다.' }, '입술': { icon: '👄', description: '너무 두껍지 않은 균형 잡힌 입술이 이상적입니다.' } }
    },
    '모로코': {
        flag: 'https://flagcdn.com/w320/ma.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '🕌', description: '아랍과 베르베르 문화가 섞인 타원형 얼굴이 매력적입니다.' }, '눈': { icon: '👀', description: '신비로운 녹색이나 밝은 갈색 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '곧고 조화로운 코가 선호됩니다.' }, '입술': { icon: '👄', description: '도톰하고 부드러운 인상을 주는 입술이 이상적입니다.' } }
    },
    '케냐': {
        flag: 'https://flagcdn.com/w320/ke.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.15, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.15, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.0, lipNoseRatio: 1.8 },
            idealEthnicity: 'Black'
        },
        features: { '얼굴형': { icon: '😊', description: '높은 광대뼈와 강한 턱선이 건강미를 상징합니다.' }, '눈': { icon: '👀', description: '크고 빛나는 눈이 생명력을 나타냅니다.' }, '코': { icon: '👃', description: '넓고 강한 콧대가 자연스럽고 아름답게 여겨집니다.' }, '입술': { icon: '👄', description: '도톰하고 건강한 입술이 매력적으로 평가됩니다.' } }
    },
    '뉴질랜드': {
        flag: 'https://flagcdn.com/w320/nz.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🥝', description: '자연스럽고 건강한 모습, 마오리 문화의 영향으로 개성을 중시합니다.' }, '눈': { icon: '👀', description: '다양한 문화가 공존하여 눈의 형태와 색이 다채롭습니다.' }, '코': { icon: '👃', description: '인위적이지 않고 자연스러운 코를 선호합니다.' }, '입술': { icon: '👄', description: '활기찬 미소를 가진 입술이 아름답습니다.' } }
    },
    '노르웨이': {
        flag: 'https://flagcdn.com/w320/no.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.4, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🏞️', description: '자연 그대로의 아름다움과 강한 턱선이 특징입니다.' }, '눈': { icon: '👀', description: '깊고 푸른 눈이 피오르드처럼 신비로운 느낌을 줍니다.' }, '코': { icon: '👃', description: '곧고 높은 코가 강인한 인상을 줍니다.' }, '입술': { icon: '👄', description: '자연스러운 색상의 균형 잡힌 입술을 선호합니다.' } }
    },
    '덴마크': {
        flag: 'https://flagcdn.com/w320/dk.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.25, verticalRatio: 0.15, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.39, horizontalRatio: 2.25, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '편안하고 행복해 보이는 휘게(Hygge) 스타일의 자연스러운 얼굴을 중시합니다.' }, '눈': { icon: '👀', description: '친절하고 따뜻한 느낌의 눈매가 매력적입니다.' }, '코': { icon: '👃', description: '과장되지 않고 부드러운 인상을 주는 코를 선호합니다.' }, '입술': { icon: '👄', description: '미소가 아름다운 건강한 입술이 아름답습니다.' } }
    },
    '핀란드': {
        flag: 'https://flagcdn.com/w320/fi.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.41, horizontalRatio: 2.15, lipNoseRatio: 1.45 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🌲', description: '자일리톨처럼 깨끗한 이미지와 높은 광대뼈가 특징입니다.' }, '눈': { icon: '👀', description: '호수처럼 맑고 밝은 색의 눈동자가 신비로움을 더합니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 세련된 느낌을 줍니다.' }, '입술': { icon: '👄', description: '자연스럽고 섬세한 입술이 이상적입니다.' } }
    },
    '우크라이나': {
        flag: 'https://flagcdn.com/w320/ua.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.37, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '타원형 얼굴과 부드러운 얼굴선이 미의 기준으로 여겨집니다.' }, '눈': { icon: '👀', description: '크고 표현력 있는 눈, 짙은 색 눈동자가 매력적입니다.' }, '코': { icon: '👃', description: '곧고 조화로운 코를 선호합니다.' }, '입술': { icon: '👄', description: '도톰하고 아름다운 곡선의 입술이 인기가 많습니다.' } }
    },
    '루마니아': {
        flag: 'https://flagcdn.com/w320/ro.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.35, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.36, horizontalRatio: 2.1, lipNoseRatio: 1.65 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🧛', description: '라틴계의 영향으로 신비롭고 이국적인 외모가 특징입니다.' }, '눈': { icon: '👀', description: '깊고 매혹적인 눈매, 다양한 색의 눈동자가 아름답습니다.' }, '코': { icon: '👃', description: '날렵하고 오똑한 코가 세련미를 더합니다.' }, '입술': { icon: '👄', description: '도톰하고 관능적인 입술이 매력적으로 여겨집니다.' } }
    },
    '체코': {
        flag: 'https://flagcdn.com/w320/cz.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.5 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '😊', description: '슬라브와 게르만의 특징이 섞인 높은 광대뼈가 매력적입니다.' }, '눈': { icon: '👀', description: '크고 밝은 색의 눈동자가 인형 같은 느낌을 줍니다.' }, '코': { icon: '👃', description: '곧고 가느다란 코를 선호합니다.' }, '입술': { icon: '👄', description: '균형 잡힌 자연스러운 입술이 아름답습니다.' } }
    },
    '칠레': {
        flag: 'https://flagcdn.com/w320/cl.png',
        scoringFactors: {
            weights: { beauty: 0.30, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.10, ethnicity: 0.05, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.34, horizontalRatio: 2.15, lipNoseRatio: 1.6 },
            idealEthnicity: null
        },
        features: { '얼굴형': { icon: '🗿', description: '유럽과 원주민의 특징이 혼합되어 개성있는 외모가 많습니다.' }, '눈': { icon: '👀', description: '다양한 인종의 영향으로 눈의 모양과 색이 다채롭습니다.' }, '코': { icon: '👃', description: '얼굴 전체의 조화를 중시하며, 자연스러운 코를 선호합니다.' }, '입술': { icon: '👄', description: '건강하고 생기 있는 입술이 매력적으로 평가됩니다.' } }
    },
    '이란': {
        flag: 'https://flagcdn.com/w320/ir.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.33, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Middle Eastern'
        },
        features: { '얼굴형': { icon: '😊', description: '페르시아의 후예로, 타원형 얼굴과 뚜렷한 이목구비가 특징입니다.' }, '눈': { icon: '👀', description: '아몬드 모양의 큰 눈과 짙은 눈썹이 아름다움의 상징입니다.' }, '코': { icon: '👃', description: '오똑하고 날렵한 코를 선호하여 코 성형이 인기가 많습니다.' }, '입술': { icon: '👄', description: '윤곽이 뚜렷하고 도톰한 입술이 매력적입니다.' } }
    },
    '파키스탄': {
        flag: 'https://flagcdn.com/w320/pk.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.10, ethnicity: 0.30, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.32, horizontalRatio: 2.05, lipNoseRatio: 1.65 },
            idealEthnicity: 'Indian'
        },
        features: { '얼굴형': { icon: '😊', description: '남아시아와 중동의 특징이 결합된 계란형 얼굴을 선호합니다.' }, '눈': { icon: '👀', description: '크고 짙은 눈, 특히 밝은 색 눈동자는 신비롭게 여겨집니다.' }, '코': { icon: '👃', description: '날렵하고 높은 코가 이상적입니다.' }, '입술': { icon: '👄', description: '도톰하고 표현력 있는 입술이 아름답습니다.' } }
    },
    '방글라데시': {
        flag: 'https://flagcdn.com/w320/bd.png',
        scoringFactors: {
            weights: { beauty: 0.15, symmetry: 0.15, verticalRatio: 0.10, horizontalRatio: 0.05, lipNoseRatio: 0.05, ethnicity: 0.40, skinClarity: 0.10 },
            idealRatios: { verticalRatio: 1.3, horizontalRatio: 2.1, lipNoseRatio: 1.6 },
            idealEthnicity: 'Indian'
        },
        features: { '얼굴형': { icon: '😊', description: '벵골인의 특징인 둥근 얼굴형과 부드러운 인상이 선호됩니다.' }, '눈': { icon: '👀', description: '크고 동그란 "물고기 눈"이 아름다움의 상징입니다.' }, '코': { icon: '👃', description: '너무 높지 않고 얼굴과 조화되는 코가 아름답습니다.' }, '입술': { icon: '👄', description: '도톰하고 자연스러운 입술이 매력적입니다.' } }
    },
    '싱가포르': {
        flag: 'https://flagcdn.com/w320/sg.png',
        scoringFactors: {
            weights: { beauty: 0.25, symmetry: 0.20, verticalRatio: 0.15, horizontalRatio: 0.15, lipNoseRatio: 0.10, ethnicity: 0.05, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.35, horizontalRatio: 2.2, lipNoseRatio: 1.6 },
            idealEthnicity: null
        },
        features: { '얼굴형': { icon: '🏙️', description: '다인종 국가로, 젊고 세련된 도시적인 이미지를 선호합니다.' }, '눈': { icon: '👀', description: '중국, 말레이, 인도계의 특징이 섞여 다양한 눈이 아름답게 여겨집니다.' }, '코': { icon: '👃', description: '오똑하고 세련된 코가 인기가 많습니다.' }, '입술': { icon: '👄', description: '깔끔하고 정돈된 느낌의 입술이 선호됩니다.' } }
    },
    '오스트리아': {
        flag: 'https://flagcdn.com/w320/at.png',
        scoringFactors: {
            weights: { beauty: 0.20, symmetry: 0.25, verticalRatio: 0.10, horizontalRatio: 0.10, lipNoseRatio: 0.05, ethnicity: 0.25, skinClarity: 0.05 },
            idealRatios: { verticalRatio: 1.38, horizontalRatio: 2.2, lipNoseRatio: 1.55 },
            idealEthnicity: 'White'
        },
        features: { '얼굴형': { icon: '🎻', description: '음악의 도시처럼 클래식하고 우아한 얼굴형이 선호됩니다.' }, '눈': { icon: '👀', description: '지적이고 깊이 있는 눈매가 매력적입니다.' }, '코': { icon: '👃', description: '곧고 귀족적인 느낌의 코가 이상적으로 여겨집니다.' }, '입술': { icon: '👄', description: '너무 과하지 않은, 균형 잡힌 입술이 아름답습니다.' } }
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

    // 카메라 관련 이벤트 리스너들
    cameraBtn.addEventListener('click', openCamera);
    closeCameraBtn.addEventListener('click', closeCamera);
    captureBtn.addEventListener('click', capturePhoto);
    retakeBtn.addEventListener('click', retakePhoto);
    usePhotoBtn.addEventListener('click', useCapturedPhoto);
});

/**
 * Google 번역 위젯 초기화 함수.
 * 이 함수는 Google 스크립트에 의해 전역 범위에서 호출됩니다.
 */
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ko',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener('DOMContentLoaded', function() {
    const languageBtn = document.getElementById('language-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', function() {
            const langSelector = document.querySelector('#google_translate_element select');
            if (langSelector) {
                langSelector.click();
            }
        });
    }
});

// 언어 변경 시 호출되는 함수
function changeLanguage() {
    googleTranslateElementInit();
}

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

// 카메라 열기 함수
async function openCamera() {
    try {
        // 카메라 권한 요청 및 스트림 시작
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // 전면 카메라 사용
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        // 비디오 요소에 스트림 연결
        cameraVideo.srcObject = cameraStream;
        cameraModal.style.display = 'flex';
        
        // 카메라가 로드될 때까지 대기
        cameraVideo.onloadedmetadata = () => {
            cameraVideo.play();
        };
        
    } catch (error) {
        console.error('카메라 접근 오류:', error);
        alert('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
    }
}

// 카메라 닫기 함수
function closeCamera() {
    if (cameraStream) {
        // 모든 비디오 트랙 중지
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // 모달 닫기
    cameraModal.style.display = 'none';
    
    // 비디오 요소 초기화
    cameraVideo.srcObject = null;
    
    // 캡처된 이미지 데이터 초기화
    capturedImageData = null;
    
    // 버튼 상태 초기화
    captureBtn.style.display = 'flex';
    retakeBtn.style.display = 'none';
    usePhotoBtn.style.display = 'none';
    cameraVideo.style.display = 'block';
    cameraCanvas.style.display = 'none';
}

// 사진 촬영 함수
function capturePhoto() {
    const context = cameraCanvas.getContext('2d');
    
    // 캔버스 크기를 비디오 크기에 맞춤
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    
    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    // 캡처된 이미지 데이터 저장
    capturedImageData = cameraCanvas.toDataURL('image/jpeg', 0.8);
    
    // UI 상태 변경
    cameraVideo.style.display = 'none';
    cameraCanvas.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'flex';
    usePhotoBtn.style.display = 'flex';
}

// 다시 촬영 함수
function retakePhoto() {
    // 캡처된 이미지 데이터 초기화
    capturedImageData = null;
    
    // UI 상태 초기화
    cameraVideo.style.display = 'block';
    cameraCanvas.style.display = 'none';
    captureBtn.style.display = 'flex';
    retakeBtn.style.display = 'none';
    usePhotoBtn.style.display = 'none';
}

// 촬영한 사진 사용하기 함수
function useCapturedPhoto() {
    if (!capturedImageData) {
        alert('촬영된 사진이 없습니다.');
        return;
    }
    
    // Data URL을 Blob으로 변환
    fetch(capturedImageData)
        .then(res => res.blob())
        .then(blob => {
            // File 객체 생성 (업로드된 이미지와 동일한 형식)
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            
            // 기존 이미지 업로드 처리 함수와 동일한 방식으로 처리
            uploadedImage = file;
            previewImage.src = capturedImageData;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            checkAnalyzeButtonState();
            
            // 카메라 모달 닫기
            closeCamera();
        })
        .catch(error => {
            console.error('이미지 처리 오류:', error);
            alert('이미지 처리 중 오류가 발생했습니다.');
        });
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
    const faceAttributes = attributes.faces && attributes.faces[0] ? attributes.faces[0].attributes : {};
    
    const beautyScore = faceAttributes.beauty ? (faceAttributes.beauty.male_score + faceAttributes.beauty.female_score) / 2 : 75;
    const detectedEthnicity = faceAttributes.ethnicity?.value;

    return Object.entries(countryData).map(([name, data]) => {
        const factors = data.scoringFactors;
        
        const scores = {};
        scores.symmetry = geometric.symmetry ?? 70;

        const calculateRatioScore = (userValue, idealValue) => {
            if (!userValue || !idealValue) return 70;
            const diff = Math.abs(userValue - idealValue) / idealValue;
            return Math.max(0, 100 * (1 - diff * 2));
        };
        scores.verticalRatio = geometric.verticalRatio ? calculateRatioScore(geometric.verticalRatio, factors.idealRatios.verticalRatio) : 70;
        scores.horizontalRatio = geometric.horizontalRatio ? calculateRatioScore(geometric.horizontalRatio, factors.idealRatios.horizontalRatio) : 70;
        scores.lipNoseRatio = geometric.lipNoseRatio ? calculateRatioScore(geometric.lipNoseRatio, factors.idealRatios.lipNoseRatio) : 70;
        
        const skinStatus = faceAttributes.skinstatus;
        if (skinStatus) {
            const healthScore = skinStatus.health ?? 70;
            const totalBlemish = (skinStatus.stain ?? 0) + (skinStatus.acne ?? 0) + (skinStatus.dark_circle ?? 0);
            const blemishScore = Math.max(0, 100 - totalBlemish);
            scores.skinClarity = (healthScore * 0.5) + (blemishScore * 0.5);
        } else {
            scores.skinClarity = 70;
        }

        let ethnicityScore;
        const idealEthnicity = factors.idealEthnicity;

        if (!idealEthnicity) { 
            ethnicityScore = 85;
        } else if (!detectedEthnicity) {
            ethnicityScore = 70;
        } else {
            if (detectedEthnicity === idealEthnicity) {
                ethnicityScore = 100;
            } else {
                if (['대한민국', '일본', '중국', '러시아'].includes(name) && detectedEthnicity === 'Black') {
                    ethnicityScore = 0; // Black 인종에 대한 강력한 페널티
                } else {
                    ethnicityScore = 30; // 그 외 불일치
                }
            }
        }
        scores.ethnicity = ethnicityScore;

        let finalScore = (beautyScore * factors.weights.beauty) +
                         (scores.symmetry * factors.weights.symmetry) +
                         (scores.verticalRatio * factors.weights.verticalRatio) +
                         (scores.horizontalRatio * factors.weights.horizontalRatio) +
                         (scores.lipNoseRatio * factors.weights.lipNoseRatio) +
                         (scores.ethnicity * factors.weights.ethnicity) +
                         (scores.skinClarity * (factors.weights.skinClarity || 0));
        
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
    
    document.getElementById('geometricAnalysis').innerHTML = `가로: ${getAnalysisText(geometric.horizontalRatio)}, 세로: ${getAnalysisText(geometric.verticalRatio)}<br>입/코: ${getAnalysisText(geometric.lipNoseRatio)}`;
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
    
    const featuresTitle = document.createElement('h3');
    featuresTitle.className = 'facial-features-title';
    featuresTitle.innerHTML = `<i class="fas fa-crown"></i> ${countryName}의 선호하는 <br class="mobile-only">얼굴 생김새`;

    const featuresList = document.createElement('div');
    featuresList.className = 'facial-features-list';

    Object.entries(features).forEach(([feature, data]) => {
        const item = document.createElement('div');
        item.className = 'facial-feature-item';
        item.innerHTML = `
            <div class="facial-feature-title">${data.icon} ${feature}</div>
            <div class="facial-feature-description">${data.description}</div>`;
        featuresList.appendChild(item);
    });

    list.appendChild(featuresTitle);
    list.appendChild(featuresList);
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
    
    // 카메라 관련 상태 초기화
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    capturedImageData = null;
    cameraModal.style.display = 'none';
    
    // 화면 상단으로 부드럽게 스크롤
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 강제 재배포를 위한 주석