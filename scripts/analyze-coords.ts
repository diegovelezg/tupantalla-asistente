#!/usr/bin/env tsx

/**
 * SCRIPT: Analizador de Coordenadas para DOOH
 * Objetivo: Extraer venues y calcular perfiles para una coordenada específica, devolviendo JSON.
 */

const ZONAS = {
  A: { max: 150, peso: 1.0, nombre: "Impacto Directo" },
  B: { max: 300, peso: 0.5, nombre: "Influencia Próxima" },
  C: { max: 400, peso: 0.2, nombre: "Entorno Extendido" },
  ANCLA: { max: 800, peso: 0.3, nombre: "Factor Ancla" }
};

const VENUES_ANCLA = [
  'aeroway=aerodrome',
  'amenity=airport',
  'amenity=bus_station',
  'railway=station',
  'shop=mall',
  'leisure=stadium',
  'amenity=stadium',
  'amenity=exhibition_center'
];

const CATEGORIAS_MAPBOX: Record<string, string> = {
  'amenity=restaurant': 'gastronomia',
  'amenity=cafe': 'gastronomia',
  'amenity=bar': 'gastronomia',
  'amenity=pub': 'gastronomia',
  'amenity=fast_food': 'gastronomia',
  'amenity=food_court': 'gastronomia',
  'amenity=biergarten': 'gastronomia',
  'amenity=ice_cream': 'gastronomia',
  'shop=bakery': 'gastronomia',
  'shop=pastry': 'gastronomia',
  'shop=wine': 'gastronomia',
  'shop=beverages': 'gastronomia',
  'shop=alcohol': 'gastronomia',
  'shop=supermarket': 'supermercados_tiendas',
  'shop=mall': 'supermercados_tiendas',
  'shop=department_store': 'supermercados_tiendas',
  'shop=clothes': 'supermercados_tiendas',
  'shop=shoes': 'supermercados_tiendas',
  'shop=bags': 'supermercados_tiendas',
  'shop=jewelry': 'supermercados_tiendas',
  'shop=boutique': 'supermercados_tiendas',
  'shop=cosmetics': 'supermercados_tiendas',
  'shop=perfumery': 'supermercados_tiendas',
  'shop=watches': 'supermercados_tiendas',
  'shop=books': 'supermercados_tiendas',
  'shop=electronics': 'supermercados_tiendas',
  'shop=mobile_phone': 'supermercados_tiendas',
  'shop=computer': 'supermercados_tiendas',
  'shop=video_games': 'supermercados_tiendas',
  'shop=toys': 'supermercados_tiendas',
  'shop=gift': 'supermercados_tiendas',
  'shop=stationery': 'supermercados_tiendas',
  'shop=florist': 'supermercados_tiendas',
  'shop=convenience': 'supermercados_tiendas',
  'shop=kiosk': 'supermercados_tiendas',
  'shop=variety_store': 'supermercados_tiendas',
  'shop=hardware': 'supermercados_tiendas',
  'shop=doityourself': 'supermercados_tiendas',
  'shop=furniture': 'supermercados_tiendas',
  'amenity=hospital': 'salud_bienestar',
  'amenity=clinic': 'salud_bienestar',
  'amenity=pharmacy': 'salud_bienestar',
  'amenity=doctors': 'salud_bienestar',
  'amenity=dentist': 'salud_bienestar',
  'amenity=veterinary': 'salud_bienestar',
  'shop=chemist': 'salud_bienestar',
  'shop=health_food': 'salud_bienestar',
  'shop=optician': 'salud_bienestar',
  'amenity=yoga_studio': 'salud_bienestar',
  'amenity=school': 'educacion',
  'amenity=university': 'educacion',
  'amenity=college': 'educacion',
  'amenity=kindergarten': 'educacion',
  'amenity=library': 'educacion',
  'amenity=bank': 'bancos',
  'amenity=atm': 'bancos',
  'amenity=bureau_de_change': 'bancos',
  'leisure=park': 'parques_areas_verdes',
  'leisure=garden': 'parques_areas_verdes',
  'leisure=nature_reserve': 'parques_areas_verdes',
  'leisure=common': 'parques_areas_verdes',
  'leisure=sports_centre': 'deportes',
  'leisure=fitness_centre': 'deportes',
  'amenity=fitness_centre': 'deportes',
  'leisure=pitch': 'deportes',
  'leisure=swimming_pool': 'deportes',
  'leisure=stadium': 'deportes',
  'leisure=tennis_court': 'deportes',
  'leisure=golf_course': 'deportes',
  'amenity=theatre': 'cultura_entretenimiento',
  'amenity=cinema': 'cultura_entretenimiento',
  'amenity=arts_centre': 'cultura_entretenimiento',
  'amenity=nightclub': 'cultura_entretenimiento',
  'amenity=casino': 'cultura_entretenimiento',
  'tourism=museum': 'cultura_entretenimiento',
  'tourism=art_gallery': 'cultura_entretenimiento',
  'tourism=artwork': 'cultura_entretenimiento',
  'tourism=attraction': 'cultura_entretenimiento',
  'tourism=theme_park': 'cultura_entretenimiento',
  'tourism=zoo': 'cultura_entretenimiento',
  'leisure=escape_room': 'cultura_entretenimiento',
  'highway=bus_stop': 'transporte',
  'amenity=bus_station': 'transporte',
  'amenity=fuel': 'transporte',
  'amenity=charging_station': 'transporte',
  'amenity=parking': 'transporte',
  'amenity=parking_entrance': 'transporte',
  'amenity=taxi': 'transporte',
  'railway=station': 'transporte',
  'railway=subway_entrance': 'transporte',
  'aeroway=aerodrome': 'transporte',
  'tourism=hotel': 'turismo_hospedaje',
  'tourism=motel': 'turismo_hospedaje',
  'tourism=hostel': 'turismo_hospedaje',
  'tourism=guest_house': 'turismo_hospedaje',
  'office=yes': 'servicios_empresariales',
  'office=company': 'servicios_empresariales',
  'office=government': 'servicios_empresariales',
  'office=it': 'servicios_empresariales',
  'office=telecommunication': 'servicios_empresariales',
  'office=insurance': 'servicios_empresariales',
  'office=coworking': 'servicios_empresariales',
  'amenity=business_centre': 'servicios_empresariales',
  'amenity=conference_centre': 'servicios_empresariales',
  'amenity=townhall': 'servicios_empresariales',
  'amenity=courthouse': 'servicios_empresariales',
  'amenity=embassy': 'servicios_empresariales',
  'office=lawyer': 'servicios_profesionales',
  'office=architect': 'servicios_profesionales',
  'office=accountant': 'servicios_profesionales',
  'office=employment_agency': 'servicios_profesionales',
  'office=estate_agent': 'servicios_profesionales',
  'office=advertising_agency': 'servicios_profesionales',
  'shop=hairdresser': 'servicios_personales',
  'shop=laundry': 'servicios_personales',
  'shop=dry_cleaning': 'servicios_personales',
  'shop=beauty': 'servicios_personales',
  'shop=tailor': 'servicios_personales',
  'craft=shoemaker': 'servicios_personales',
  'craft=watchmaker': 'servicios_personales',
  'craft=photographer': 'servicios_personales',
  'amenity=place_of_worship': 'religion',
  'building=apartments': 'residencial',
  'building=residential': 'residencial',
  'building=house': 'residencial',
  'building=dormitory': 'residencial',
  'building=flats': 'residencial',
  'building=terrace': 'residencial',
  'building=yes': 'residencial',
};

const MATRIZ_PERFILES: Record<string, Record<string, number>> = {
  gastronomia: { business_executive: 2.0, daily_life: 1.5, gen_z_lifestyle: 2.5, high_end_luxury: 1.5, health_wellness: 0.5 },
  supermercados_tiendas: { daily_life: 3.0, business_executive: 0.5, high_end_luxury: 2.0, gen_z_lifestyle: 1.5 },
  salud_bienestar: { health_wellness: 3.0, daily_life: 2.0, business_executive: 0.5 },
  educacion: { gen_z_lifestyle: 2.5, business_executive: 1.5, daily_life: 1.0 },
  bancos: { business_executive: 3.0, daily_life: 1.5, high_end_luxury: 2.0 },
  parques_areas_verdes: { health_wellness: 2.5, daily_life: 2.0, gen_z_lifestyle: 1.0 },
  deportes: { health_wellness: 3.0, gen_z_lifestyle: 1.5, high_end_luxury: 1.0 },
  cultura_entretenimiento: { gen_z_lifestyle: 2.5, high_end_luxury: 3.0, daily_life: 1.0 },
  transporte: { travel_transit: 3.0, business_executive: 1.5, daily_life: 1.5 },
  servicios_empresariales: { business_executive: 3.0, travel_transit: 1.0, high_end_luxury: 1.0 },
  servicios_profesionales: { business_executive: 3.0, high_end_luxury: 1.5, daily_life: 0.5 },
  servicios_personales: { daily_life: 2.5, business_executive: 0.5, gen_z_lifestyle: 1.0 },
  turismo_hospedaje: { travel_transit: 3.0, business_executive: 2.0, high_end_luxury: 2.0 },
  religion: { daily_life: 1.5, gen_z_lifestyle: 0.5 }
};

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function esVenueAncla(tags: any): boolean {
  for (const tagKey of VENUES_ANCLA) {
    const [key, value] = tagKey.split('=');
    if (tags[key] === value) return true;
  }
  return false;
}

function determinarZona(distancia: number, esAncla: boolean): { zona: string; peso: number; es_ancla: boolean } {
  if (esAncla && distancia <= ZONAS.ANCLA.max && distancia > ZONAS.C.max) {
    return { zona: 'ANCLA', peso: ZONAS.ANCLA.peso, es_ancla: true };
  }
  if (distancia <= ZONAS.A.max) return { zona: 'A', peso: ZONAS.A.peso, es_ancla: false };
  if (distancia <= ZONAS.B.max) return { zona: 'B', peso: ZONAS.B.peso, es_ancla: false };
  if (distancia <= ZONAS.C.max) return { zona: 'C', peso: ZONAS.C.peso, es_ancla: false };
  return { zona: 'FUERA_RANGO', peso: 0, es_ancla: false };
}

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];

async function extraerVenues(lat: number, lng: number): Promise<any[]> {
  const query = `
    [out:json][timeout:60];
    (
      nwr(around:400,${lat},${lng})[~"^(amenity|shop|leisure|tourism|office|craft)$"~"."];
      nwr(around:800,${lat},${lng})["amenity"~"^(bus_station|stadium|airport|exhibition_center)$"];
      nwr(around:800,${lat},${lng})["shop"="mall"];
      nwr(around:800,${lat},${lng})["railway"="station"];
      nwr(around:400,${lat},${lng})["building"~"^(apartments|residential|house|flats)$"];
    );
    out center;
  `;

  let lastError = null;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: query
      });

      if (response.status === 429) {
        console.error(` Mirror ${url} saturado (429). Probando siguiente...`);
        continue;
      }

      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      const data = await response.json();
      return data.elements || [];
    } catch (e: any) {
      lastError = e;
      continue;
    }
  }
  throw new Error(`Todos los mirrors fallaron. Último error: ${lastError?.message}`);
}

interface VenueProcesado {
  id: string;
  nombre: string;
  categoria: string;
  tipo_mapbox: string;
  distancia: number;
  zona: string;
  peso: number;
  es_ancla: boolean;
  coordenadas: { lat: number; lng: number };
}

function procesarVenues(elements: any[], centroLat: number, centroLng: number): VenueProcesado[] {
  const venues: VenueProcesado[] = [];

  for (const element of elements) {
    if (!element.tags) continue;

    let lat, lng;
    if (element.lat && element.lon) {
      lat = element.lat;
      lng = element.lon;
    } else if (element.center?.lat && element.center?.lng) {
      lat = element.center.lat;
      lng = element.center.lng;
    } else continue;

    const distancia = calcularDistancia(centroLat, centroLng, lat, lng);
    const { zona, peso, es_ancla } = determinarZona(distancia, esVenueAncla(element.tags));

    if (peso === 0) continue;

    let categoria, tipoMapbox;
    const esEdificioGenerico = element.tags.building === 'yes' || element.tags.building === 'residential';
    const tieneTagsComerciales = element.tags.office || element.tags.shop || element.tags.amenity;

    if (esEdificioGenerico && tieneTagsComerciales) {
      for (const [tagKey, cat] of Object.entries(CATEGORIAS_MAPBOX)) {
        if (cat === 'residencial') continue;
        const [key, value] = tagKey.split('=');
        if (element.tags[key] === value) {
          categoria = cat;
          tipoMapbox = `${key}=${value}`;
          break;
        }
      }
    }

    if (!categoria) {
      for (const [tagKey, cat] of Object.entries(CATEGORIAS_MAPBOX)) {
        const [key, value] = tagKey.split('=');
        if (element.tags[key] === value) {
          categoria = cat;
          tipoMapbox = `${key}=${value}`;
          break;
        }
      }
    }

    if (!categoria) continue;

    const nombre = element.tags.name || element.tags['name:es'] || `${categoria} sin nombre`;

    venues.push({
      id: element.id.toString(),
      nombre,
      categoria,
      tipo_mapbox: tipoMapbox!,
      distancia: Math.round(distancia),
      zona,
      peso,
      es_ancla,
      coordenadas: { lat, lng }
    });
  }

  return venues;
}

function calcularIntensidad(distribucionCategorias: Record<string, number>): number {
  let intensidadTotal = 0;
  for (const [categoria, cantidad] of Object.entries(distribucionCategorias)) {
    const pesosPerfil = MATRIZ_PERFILES[categoria];
    if (!pesosPerfil) continue;
    const pesoMaximo = Math.max(...Object.values(pesosPerfil));
    intensidadTotal += cantidad * pesoMaximo;
  }
  const intensidadMaximaTeorica = 300;
  const intensidadNormalizada = Math.min((intensidadTotal / intensidadMaximaTeorica) * 100, 100);
  return Math.round(intensidadNormalizada * 10) / 10;
}

function calcularScoresConConcentracion(venues: VenueProcesado[]): Record<string, number> {
  const venuesEnRango = venues.filter(v => v.zona !== 'FUERA_RANGO');
  const distribucionCategorias: Record<string, number> = {};
  venuesEnRango.forEach(v => {
    distribucionCategorias[v.categoria] = (distribucionCategorias[v.categoria] || 0) + 1;
  });

  const scores: Record<string, number> = {
    business_executive: 0, daily_life: 0, health_wellness: 0, gen_z_lifestyle: 0, high_end_luxury: 0, travel_transit: 0
  };

  for (const [categoria, cantidad] of Object.entries(distribucionCategorias)) {
    const pesosPerfil = MATRIZ_PERFILES[categoria];
    if (!pesosPerfil) continue;
    const concentracion = Math.pow(cantidad, 0.6);
    for (const [perfil, pesoCategoria] of Object.entries(pesosPerfil)) {
      scores[perfil] += concentracion * pesoCategoria;
    }
  }
  return scores;
}

async function main() {
  try {
    const latStr = process.argv[2];
    const lngStr = process.argv[3];
    if (!latStr || !lngStr) throw new Error("Faltan coordenadas");

    const lat = parseFloat(latStr.replace(',', '.').trim());
    const lng = parseFloat(lngStr.replace(',', '.').trim());

    if (isNaN(lat) || isNaN(lng)) throw new Error(`Coordenadas inválidas: ${latStr}, ${lngStr}`);

    const elements = await extraerVenues(lat, lng);
    const venues = procesarVenues(elements, lat, lng);

    const distribucionCategorias: Record<string, number> = {};
    venues.forEach(v => {
      distribucionCategorias[v.categoria] = (distribucionCategorias[v.categoria] || 0) + 1;
    });

    const intensidad = calcularIntensidad(distribucionCategorias);
    const scores = calcularScoresConConcentracion(venues);

    const sortedPerfiles = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const perfilPrimario = sortedPerfiles[0]?.[0] || 'unknown';
    const perfilSecundario = sortedPerfiles[1]?.[0] || 'unknown';

    const anclas = venues.filter(v => v.es_ancla).map(v => v.nombre);
    
    // Obtener los nombres de los comercios más importantes por categoría (top 3 de cada una)
    const comerciosPorCategoria: Record<string, string[]> = {};
    venues.forEach(v => {
      if (v.nombre && !v.nombre.toLowerCase().includes('sin nombre')) {
        if (!comerciosPorCategoria[v.categoria]) comerciosPorCategoria[v.categoria] = [];
        if (!comerciosPorCategoria[v.categoria].includes(v.nombre)) {
          comerciosPorCategoria[v.categoria].push(v.nombre);
        }
      }
    });

    const categoriasPrincipales = Object.entries(distribucionCategorias)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoria, cantidad]) => ({ 
        categoria, 
        cantidad,
        ejemplos: (comerciosPorCategoria[categoria] || []).slice(0, 3)
      }));

    const result = {
      perfil_primario: perfilPrimario,
      perfil_secundario: perfilSecundario,
      score_intensidad: intensidad,
      scores_full_json: scores,
      resumen_entorno: {
        anclas: Array.from(new Set(anclas)).slice(0, 8),
        categorias_principales: categoriasPrincipales
      }
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

main();
