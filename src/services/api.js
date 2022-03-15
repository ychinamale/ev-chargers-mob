import axios from 'axios';

const api = axios.create({
  baseURL: 'https://example.ev.energy'
});

export async function startCharging(charger) {
  const response = api.post('chargingsession', {
    user: 1,
    car_id: 1,
    charger_id: charger.ID
  })
  return response?.data;
}