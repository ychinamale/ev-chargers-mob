import axios from 'axios';
import env from 'react-native-config';

const ocmAPI = axios.create({
  baseURL: env.OPENCHARGEMAP_BASE_URL,
  headers: {
    'X-API-Key': env.OPENCHARGEMAP_API_KEY
  }
})

export async function fetchChargerPoints() {
  const response = await ocmAPI.get('/poi')
  return response?.data
}