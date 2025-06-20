    // Cloudflare Function to handle Face++ API requests
    
    const BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';
    
    // 요청을 처리하는 메인 함수
    export async function onRequestPost(context) {
        // Cloudflare 환경에서는 context.env에서 환경 변수를 가져옵니다.
        const API_KEY = context.env.FACE_API_KEY;
        const API_SECRET = context.env.FACE_API_SECRET;
    
        // API 키가 설정되었는지 확인
        if (!API_KEY || !API_SECRET) {
            return new Response(JSON.stringify({ error: 'API 키가 서버에 올바르게 설정되지 않았습니다.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        try {
            const request = context.request;
            const requestFormData = await request.formData();
            const imageFile = requestFormData.get('image_file');
    
            if (!imageFile) {
                return new Response(JSON.stringify({ error: '분석할 이미지 파일이 없습니다.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            
            // Face++ API로 보낼 새로운 FormData 생성
            const faceppFormData = new FormData();
            faceppFormData.append('api_key', API_KEY);
            faceppFormData.append('api_secret', API_SECRET);
            faceppFormData.append('image_file', imageFile);
            
            // 우리가 필요한 모든 속성을 요청합니다. (eyestatus 추가)
            faceppFormData.append('return_attributes', 'gender,age,smiling,emotion,skinstatus,beauty,headpose,facequality,eyestatus');
    
            // Face++ API 호출
            const response = await fetch(`${BASE_URL}/detect`, {
                method: 'POST',
                body: faceppFormData,
            });
    
            const data = await response.json();
    
            // Face++ API가 에러를 반환한 경우
            if (!response.ok) {
                throw new Error(data.error_message || 'Face++ API 요청에 실패했습니다.');
            }
    
            // 성공적인 응답을 클라이언트에게 반환
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
    
        } catch (error) {
            // 모든 종류의 에러를 처리하고 클라이언트에게 알림
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }