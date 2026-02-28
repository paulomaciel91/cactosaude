// Função auxiliar para converter graus em radianos
function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Fórmula de Haversine para calcular distância entre dois pontos (em km)
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Busca coordenadas (lat, lon) usando a Google Maps Geocoding API
export async function getCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API Key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`);

    if (!response.ok) {
      console.warn('Error fetching from Google Geocoding API:', response.statusText);
      const errorBody = await response.json().catch(() => ({}));
      console.error('Google API Error Body:', errorBody);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lon: location.lng // Google uses 'lng' for longitude
      };
    } else {
      console.warn('Geocoding API returned status:', data.status, 'for address:', address);
      if (data.error_message) {
        console.error('Google Maps API Error:', data.error_message);
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting coordinates from Google Maps:', error);
    return null;
  }
}