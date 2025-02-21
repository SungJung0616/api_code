require('dotenv').config(); // .env 파일 로드
const axios = require('axios'); // HTTP 요청을 위한 axios

const { getBestShippingRate } = require('./bestRate');

// 환경 변수에서 API Key & Secret 가져오기
const API_KEY = process.env.SHIPSTATION_API_KEY;
const API_SECRET = process.env.SHIPSTATION_API_SECRET;

// ShipStation API 기본 URL
const SHIPSTATION_API_URL = 'https://ssapi.shipstation.com/';

// 기본 인증을 위한 설정
const auth = {
  username: API_KEY,
  password: API_SECRET,
};

const carriers = ["stamps_com", "ups_walleted", "fedex_walleted"];

// ShipStation에서 배송비(Rate) 조회 함수
async function getShippingRates(carrierCode) {
    const requestBody = {
      carrierCode: carrierCode,       // 사용할 운송사 코드 (UPS, DHL, USPS 가능)
      serviceCode: null,          // 특정 서비스 코드 (예: "fedex_ground")
      packageCode: null,          // 패키지 유형 (예: "package")
      fromPostalCode: "90247",    // 출발지 우편번호
      toState: null,              // 도착지 주(state, 필수 아님)
      toCountry: "US",            // 도착 국가 (ISO 2-letter 코드)
      toPostalCode: "90746",      // 도착지 우편번호
      toCity: "Carson",       // 도착 도시 (필수 아님)
      weight: {
        value: 4,                // 무게 (숫자)
        units: "ounces"          // 단위 (ounces, pounds 등)
      },
      dimensions: {
        units: "inches",         // 크기 단위 (inches, cm)
        length: 5,               // 길이
        width: 5,                // 너비
        height: 5                // 높이
      },
      confirmation: "delivery",   // 배송 확인 옵션 (delivery, signature 등)
      residential: false         // 도착지가 주거지역인지 여부 (true = 주거지, false = 비즈니스)
    };
  
    try {
      const response = await axios.post(
       `${SHIPSTATION_API_URL}shipments/getrates`,
        requestBody,
        { auth }
      );
  
      console.log("📦 배송 요금 목록:");      
      console.table(response.data);
    } catch (error) {
      console.error("🚨 배송 요금 조회 오류:", error.response ? error.response.data : error.message);
    }
  }

  async function listCarrierServices(carrierCode) {
    try {
        const response = await axios.get(`${SHIPSTATION_API_URL}carriers/listservices?carrierCode=${carrierCode}`, { auth });
        console.log(`📦 ${carrierCode.toUpperCase()}에서 사용 가능한 서비스 목록:`);        
        console.table(response.data);
    } catch (error) {
        console.error(`🚨 ${carrierCode.toUpperCase()} 서비스 목록 조회 오류:`, error.response ? error.response.data : error.message);
    }
}

async function getAllShippingRates() {
  for (const carrier of carriers) {
    await getShippingRates(carrier);
  }
}

// 🚀 UPS & FedEx 서비스 목록 조회
//listCarrierServices("stamps_com")
//listCarrierServices("ups_walleted");
//listCarrierServices("fedex_walleted");

// 함수 실행
//getShippingRates();

//getAllShippingRates();

getBestShippingRate("Chicago", "60601");

