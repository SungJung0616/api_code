require('dotenv').config(); // .env 파일 로드
const axios = require('axios'); // HTTP 요청을 위한 axios

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

// 사용할 운송사 배열
const carriers = ["stamps_com", "ups_walleted", "fedex_walleted"];

// 특정 도시로 배송 시 최저 요금 찾기
// async function getBestShippingRate(toCity, toPostalCode) {
//   let allRates = [];

//   for (const carrierCode of carriers) {
//     try {
//       const requestBody = {
//         carrierCode: carrierCode,       
//         serviceCode: null,          
//         packageCode: null,          
//         fromPostalCode: "90247",    
//         toState: null,              
//         toCountry: "US",            
//         toPostalCode: toPostalCode,    
//         toCity: toCity,             
//         weight: { value: 4, units: "ounces" }, 
//         dimensions: { units: "inches", length: 5, width: 5, height: 5 },
//         confirmation: "delivery",   
//         residential: false         
//       };

//       const response = await axios.post(`${SHIPSTATION_API_URL}shipments/getrates`, requestBody, { auth });

//       // 응답 데이터를 배열에 저장
//       if (response.data && response.data.length > 0) {
//         allRates = allRates.concat(response.data.map(rate => ({
//           carrier: carrierCode,
//           serviceName: rate.serviceName,
//           serviceCode: rate.serviceCode,
//           cost: rate.shipmentCost,
//           totalCost: rate.shipmentCost + (rate.otherCost || 0) // 총 비용 계산
//         })));
//       }
//     } catch (error) {
//       console.error(`🚨 ${carrierCode.toUpperCase()} 배송 요금 조회 오류:`, error.response ? error.response.data : error.message);
//     }
//   }

//Promise.all() 을 사용해서 모든 API 요청을 병렬로 실행(5-6초 단축) 
  async function getBestShippingRate(toCity, toPostalCode) {
    let allRates = [];
  
    // 🚀 각 운송업체 API 요청을 병렬로 실행
    const requests = carriers.map(async (carrierCode) => {
      try {
        const requestBody = {
          carrierCode: carrierCode,
          serviceCode: null,
          packageCode: null,
          fromPostalCode: "90247",
          toState: null,
          toCountry: "US",
          toPostalCode: toPostalCode,
          toCity: toCity,
          weight: { value: 4, units: "ounces" },
          dimensions: { units: "inches", length: 5, width: 5, height: 5 },
          confirmation: "delivery",
          residential: false
        };
  
        const response = await axios.post(`${SHIPSTATION_API_URL}shipments/getrates`, requestBody, { auth });
  
        // 응답 데이터를 배열에 저장
        if (response.data && response.data.length > 0) {
          return response.data.map(rate => ({
            carrier: carrierCode,
            serviceName: rate.serviceName,
            serviceCode: rate.serviceCode,
            cost: rate.shipmentCost,
            totalCost: rate.shipmentCost + (rate.otherCost || 0) // 총 비용 계산
          }));
        }
      } catch (error) {
        console.error(`🚨 ${carrierCode.toUpperCase()} 배송 요금 조회 오류:`, error.response ? error.response.data : error.message);
        return [];
      }
    });
  
    // 🚀 모든 요청을 병렬 실행 & 결과 수집
    const results = await Promise.all(requests);
    allRates = results.flat(); // 결과를 하나의 배열로 합침

  // 요금이 있는 경우, 가장 저렴한 요금 찾기
  if (allRates.length > 0) {
    allRates.sort((a, b) => a.totalCost - b.totalCost);
    
    console.log(`📦 ${toCity}(${toPostalCode})으로 배송 시 최저 요금:`);
    console.table(allRates.slice(0, 5)); // 최저 5개 옵션만 출력
  } else {
    console.log(`🚨 ${toCity}(${toPostalCode})로의 배송 요금 정보를 찾을 수 없습니다.`);
  }
}

// 모듈로 내보내기
module.exports = { getBestShippingRate };
