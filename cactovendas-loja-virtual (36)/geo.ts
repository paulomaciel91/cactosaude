
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

// Busca coordenadas (lat, lon) usando a API Nominatim (OpenStreetMap)
export async function getCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    // User-Agent é obrigatório para o Nominatim
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'CactoStore-WebCatalog/1.0'
      }
    });

    if (!response.ok) {
      console.warn('Erro ao consultar Nominatim:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error);
    return null;
  }
}
