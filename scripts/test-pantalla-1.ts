#!/usr/bin/env tsx

/**
 * SCRIPT: Prueba de Concepto - Perfilado de Pantalla DOOH
 *
 * Objetivo: Extraer venues de unas coordenadas y calcular el perfil DOOH
 * Coordenadas de prueba: -12.109182, -77.053067
 */

// =====================================================================
// CONFIGURACIÓN
// =====================================================================

const PANTALLA = {
  id: "pantalla_test_002",
  nombre: "Pantalla Test 3 - Lima",
  coordenadas: {
    lat: -12.091552808837513,
    lng: -77.03694901599003
  },
  radio: 500 // metros
};

// Zonas de influencia según README
const ZONAS = {
  A: { max: 150, peso: 1.0, nombre: "Impacto Directo" },
  B: { max: 300, peso: 0.5, nombre: "Influencia Próxima" },
  C: { max: 400, peso: 0.2, nombre: "Entorno Extendido" },
  ANCLA: { max: 800, peso: 0.3, nombre: "Factor Ancla" }
};

// MODO AUDITORÍA: Listar TODO sin filtrar
const MODO_AUDITORIA = true;  // Necesario para incluir buildings en la query
const INCLUIR_EDIFICIOS_SIN_NOMBRE = true;  // Para calcular índice residencial

// Venues Ancla (alto impacto aunque estén lejos)
// SOLO nodos de atracción masiva
const VENUES_ANCLA = [
  'aeroway=aerodrome',           // Aeropuerto
  'amenity=airport',             // Aeropuerto
  'amenity=bus_station',         // Terminales principales (NO paradas de bus)
  'railway=station',             // Estaciones centrales de tren
  'shop=mall',                   // Centros comerciales de escala regional
  'leisure=stadium',             // Estadios
  'amenity=stadium',             // Estadios (alt)
  'amenity=exhibition_center'    // Recintos feriales
];

// Categorías de venues (basadas en auditoría real)
const CATEGORIAS_MAPBOX = {
  // GASTRONOMÍA
  'amenity=restaurant': 'gastronomia',
  'amenity=cafe': 'gastronomia',
  'amenity=bar': 'gastronomia',
  'amenity=pub': 'gastronomia',
  'amenity=fast_food': 'gastronomia',
  'shop=bakery': 'gastronomia',
  'shop=pastry': 'gastronomia',

  // SUPERMERCADOS/TIENDAS
  'shop=supermarket': 'supermercados_tiendas',
  'shop=mall': 'supermercados_tiendas',            // ⚠️ ANCLA: Centro comercial
  'shop=department_store': 'supermercados_tiendas',
  'shop=clothes': 'supermercados_tiendas',
  'shop=cosmetics': 'supermercados_tiendas',
  'shop=books': 'supermercados_tiendas',
  'shop=florist': 'supermercados_tiendas',
  'shop=hairdresser': 'servicios_personales',
  'shop=laundry': 'servicios_personales',

  // SALUD
  'amenity=hospital': 'salud_bienestar',
  'amenity=clinic': 'salud_bienestar',
  'amenity=pharmacy': 'salud_bienestar',

  // EDUCACIÓN
  'amenity=school': 'educacion',
  'amenity=kindergarten': 'educacion',

  // BANCOS
  'amenity=bank': 'bancos',
  'amenity=atm': 'bancos',

  // PARQUES
  'leisure=park': 'parques_areas_verdes',

  // ============================================
  // EDIFICIOS RESIDENCIALES (DENSIDAD POBLACIONAL)
  // ============================================
  'building=apartments': 'residencial',
  'building=residential': 'residencial',
  'building=house': 'residencial',
  'building=dormitory': 'residencial',
  'building=flats': 'residencial',
  'building=terrace': 'residencial',
  'building=yes': 'residencial',  // Genérico - asumimos residencial
  'leisure=garden': 'parques_areas_verdes',

  // DEPORTES
  'leisure=sports_centre': 'deportes',
  'leisure=fitness_centre': 'deportes',
  'amenity=fitness_centre': 'deportes',

  // CULTURA
  'amenity=theatre': 'cultura_entretenimiento',
  'amenity=cinema': 'cultura_entretenimiento',

  // TRANSPORTE
  'highway=bus_stop': 'transporte',
  'amenity=parking': 'transporte',
  'amenity=parking_entrance': 'transporte',

  // TURISMO
  'tourism=hotel': 'turismo_hospedaje',
  'tourism=guest_house': 'turismo_hospedaje',
  'tourism=artwork': 'cultura_entretenimiento',

  // RELIGIÓN
  'amenity=place_of_worship': 'religion',
};

// Matriz de pesos: Categoría Venue → Perfiles DOOH
const MATRIZ_PERFILES = {
  gastronomia: {
    business_executive: 2.0,
    daily_life: 1.5,
    gen_z_lifestyle: 2.5,
    health_wellness: 0.5
  },
  supermercados_tiendas: {
    daily_life: 3.0,
    business_executive: 0.5,
    high_end_luxury: 1.0
  },
  salud_bienestar: {
    health_wellness: 3.0,
    daily_life: 1.5,
    business_executive: 0.5
  },
  educacion: {
    gen_z_lifestyle: 2.5,
    business_executive: 1.0,
    daily_life: 1.0
  },
  bancos: {
    business_executive: 3.0,
    daily_life: 1.0,
    high_end_luxury: 1.5
  },
  parques_areas_verdes: {
    health_wellness: 2.5,
    daily_life: 2.0,
    gen_z_lifestyle: 1.0
  },
  deportes: {
    health_wellness: 3.0,
    gen_z_lifestyle: 1.5
  },
  cultura_entretenimiento: {
    gen_z_lifestyle: 2.0,
    high_end_luxury: 2.5,
    daily_life: 1.0
  },
  transporte: {
    travel_transit: 3.0,
    business_executive: 1.0,
    daily_life: 1.5
  },
  servicios_personales: {
    daily_life: 2.0,
    business_executive: 0.5
  },
  turismo_hospedaje: {
    travel_transit: 2.0,
    business_executive: 1.5
  },
  religion: {
    daily_life: 1.0,
    gen_z_lifestyle: 0.5
  }
};

// =====================================================================
// UTILIDADES
// =====================================================================

function log(seccion: string, mensaje: string, datos?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${seccion}] ${mensaje}`);
  if (datos) {
    console.log(JSON.stringify(datos, null, 2));
  }
}

// Calcular distancia Haversine (en metros)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Determinar si un venue es ancla según su tipo
function esVenueAncla(tags: any): boolean {
  for (const tagKey of VENUES_ANCLA) {
    const [key, value] = tagKey.split('=');
    if (tags[key] === value) {
      return true;
    }
  }
  return false;
}

// Determinar zona y peso
function determinarZona(distancia: number, esAncla: boolean): { zona: string; peso: number; es_ancla: boolean } {
  // Primero verificar si es venue ancla en el rango 400-800m
  if (esAncla && distancia <= ZONAS.ANCLA.max && distancia > ZONAS.C.max) {
    return { zona: 'ANCLA', peso: ZONAS.ANCLA.peso, es_ancla: true };
  }

  if (distancia <= ZONAS.A.max) {
    return { zona: 'A', peso: ZONAS.A.peso, es_ancla: false };
  } else if (distancia <= ZONAS.B.max) {
    return { zona: 'B', peso: ZONAS.B.peso, es_ancla: false };
  } else if (distancia <= ZONAS.C.max) {
    return { zona: 'C', peso: ZONAS.C.peso, es_ancla: false };
  }

  // Fuera de rango (más de 400m y NO es ancla)
  return { zona: 'FUERA_RANGO', peso: 0, es_ancla: false };
}

// =====================================================================
// EXTRACCIÓN DE VENUES (OVERPASS API)
// =====================================================================

async function extraerVenues(lat: number, lng: number, radio: number): Promise<any[]> {
  log('INICIO', `📍 Extrayendo venues alrededor de [${lat}, ${lng}] con radio ${radio}m`);

  // Calcular bounding box (más grande para auditoría: 800m)
  const bboxSize = 800 / 111000; // Convertir metros a grados aprox
  const bbox = `${lat - bboxSize},${lng - bboxSize},${lat + bboxSize},${lng + bboxSize}`;

  log('OVERPASS', `Bounding box: ${bbox}`);

  // MODO AUDITORÍA: Traer TODOS los venues, no filtrar por categoría
  let query: string;

  if (MODO_AUDITORIA) {
    query = `
      [out:json][timeout:90];
      (
        node["amenity"](${bbox});
        way["amenity"](${bbox});
        relation["amenity"](${bbox});
        node["shop"](${bbox});
        way["shop"](${bbox});
        relation["shop"](${bbox});
        node["leisure"](${bbox});
        way["leisure"](${bbox});
        relation["leisure"](${bbox});
        node["tourism"](${bbox});
        way["tourism"](${bbox});
        relation["tourism"](${bbox});
        node["highway"](${bbox});
        way["highway"](${bbox});
        node["building"](${bbox});
        way["building"](${bbox});
      );
      out center;
    `;
    log('OVERPASS', `🔍 MODO AUDITORÍA: Extrayendo TODOS los venues + BUILDINGS`);
  } else {
    // Modo normal con filtros predefinidos
    const queries = Object.entries(CATEGORIAS_MAPBOX).map(([tagKey]) => {
      const [key, value] = tagKey.split('=');
      return `node["${key}"="${value}"](${bbox});`;
    }).join('\n      ');

    // Agregar query para buildings (todos los tipos)
    const buildingQueries = [
      `node["building"](${bbox});`,
      `way["building"](${bbox});`
    ].join('\n      ');

    query = `
      [out:json][timeout:60];
      (
        ${queries}
        ${buildingQueries}
      );
      out center;
    `;
    log('OVERPASS', `Query generada (${queries.length} categorías + buildings)`);
  }

  try {
    const url = 'https://overpass-api.de/api/interpreter';
    log('OVERPASS', `Haciendo request a ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: query
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log('OVERPASS', `✅ Response exitosa`, { elementos: data.elements?.length || 0 });

    return data.elements || [];

  } catch (error: any) {
    log('ERROR', `❌ Error en Overpass API: ${error.message}`);
    throw error;
  }
}

// =====================================================================
// PROCESAMIENTO DE VENUES
// =====================================================================

interface VenueProcesado {
  id: string;
  nombre: string;
  categoria: string;
  tipo_mapbox: string;  // Nuevo campo: tipo original de Mapbox
  distancia: number;
  zona: string;
  peso: number;
  es_ancla: boolean;
  coordenadas: { lat: number; lng: number };
}

interface VenueCrudo {
  id: string;
  nombre: string;
  distancia: number;
  tags_completos: any;
  coordenadas: { lat: number; lng: number };
}

function procesarVenues(elements: any[], centroLat: number, centroLng: number): VenueProcesado[] {
  log('PROCESO', '🔄 Procesando venues...');

  if (MODO_AUDITORIA) {
    return procesarVenuesAuditoria(elements, centroLat, centroLng);
  }

  // Modo normal (código original que tenías)
  const venues: VenueProcesado[] = [];

  for (const element of elements) {
    if (!element.tags) continue;

    // Obtener coordenadas
    let lat: number;
    let lng: number;

    if (element.lat && element.lon) {
      lat = element.lat;
      lng = element.lon;
    } else if (element.center?.lat && element.center?.lng) {
      lat = element.center.lat;
      lng = element.center.lng;
    } else {
      continue;
    }

    // Calcular distancia
    const distancia = calcularDistancia(centroLat, centroLng, lat, lng);

    // Verificar si es venue ancla (antes de determinar zona)
    const esVenueAnclaTag = esVenueAncla(element.tags);

    // Determinar zona y peso (ahora recibe si es ancla o no)
    const { zona, peso, es_ancla } = determinarZona(distancia, esVenueAnclaTag);

    // Si está fuera de rango, ignorar
    if (peso === 0) {
      continue;
    }

    // Categorizar venue y extraer tipo original de Mapbox
    let categoria: string | undefined;
    let tipoMapbox: string | undefined;

    for (const [tagKey, cat] of Object.entries(CATEGORIAS_MAPBOX)) {
      const [key, value] = tagKey.split('=');
      if (element.tags[key] === value) {
        categoria = cat;
        tipoMapbox = `${key}=${value}`;
        break;
      }
    }

    if (!categoria) continue;

    // Extraer nombre
    const nombre = element.tags.name || element.tags['name:es'] || `${categoria} sin nombre`;

    venues.push({
      id: element.id.toString(),
      nombre,
      categoria,
      tipo_mapbox: tipoMapbox!,  // Agregamos el tipo original
      distancia: Math.round(distancia),
      zona,
      peso,
      es_ancla,
      coordenadas: { lat, lng }
    });
  }

  log('PROCESO', `✅ ${venues.length} venues procesados dentro del radio`);

  return venues;
}

// Tags basura que debemos ignorar
const TAGS_A_IGNOREAR = [
  'highway=crossing',
  'highway=stop',
  'highway=traffic_signals',
  'highway=give_way',
  'highway=street_lamp',
  'highway=speed_camera'
];

// Nueva función para auditoría: lista TODO sin categorizar
function procesarVenuesAuditoria(elements: any[], centroLat: number, centroLng: number): VenueProcesado[] {
  log('AUDITORÍA', '🔍 Modo auditoría: Listando venues relevantes...');

  const venues: VenueProcesado[] = [];
  let elementsProcessed = 0;
  let waysSinCentro = 0;
  let elementsSinTags = 0;
  let elementosFueraRango = 0;

  for (const element of elements) {
    elementsProcessed++;

    if (!element.tags) {
      elementsSinTags++;
      continue;
    }

    // Obtener coordenadas
    let lat: number;
    let lng: number;

    // Intentar obtener coordenadas del nodo
    if (element.type === 'node' && element.lat && element.lon) {
      lat = element.lat;
      lng = element.lon;
    }
    // Para ways y relations, usar center
    else if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
      lat = element.center.lat;
      lng = element.center.lon;
    }
    // Último intento: verificar si tiene lat/lon directo (para some nodes)
    else if (typeof element.lat === 'number' && typeof element.lon === 'number') {
      lat = element.lat;
      lng = element.lon;
    }
    else {
      // Log de elementos sin coordenadas válidas
      if (element.tags?.shop === 'mall' || element.tags?.shop === 'shopping_centre') {
        console.log(`\n⚠️  ELEMENTO SIN COORDENADAS VÁLIDAS: ${element.tags.name}`);
        console.log(`   Tipo: ${element.type}`);
        console.log(`   Tiene lat?:`, typeof element.lat, element.lat);
        console.log(`   Tiene lon?:`, typeof element.lon, element.lon);
        console.log(`   Tiene center?:`, !!element.center);
        console.log(`   Center:`, element.center);
      }
      continue;
    }

    // Detectar tags principales
    const tagPrincipal = detectarTagPrincipal(element.tags);

    // Filtrar tags basura
    if (TAGS_A_IGNOREAR.includes(tagPrincipal)) {
      continue;
    }

    // Calcular distancia
    const distancia = calcularDistancia(centroLat, centroLng, lat, lng);

    // Solo incluir si está dentro de 800m
    if (distancia > 800) {
      elementosFueraRango++;
      continue;
    }

    // Extraer nombre
    const nombre = element.tags.name || element.tags['name:es'] || 'Sin nombre';

    // LOG: Detectar malls
    if (tagPrincipal === 'shop=mall') {
      console.log(`\n🛍️  MALL DETECTADO: ${nombre}`);
      console.log(`   Distancia: ${Math.round(distancia)}m`);
      console.log(`   Coordenadas: [${lat}, ${lng}]`);
      console.log(`   Tipo: ${element.type}`);
    }

    // Calcular zona (para info)
    const { zona } = determinarZona(distancia, esVenueAncla(element.tags));

    // En modo auditoría, guardamos con categoria = "sin_clasificar"
    venues.push({
      id: element.id.toString(),
      nombre,
      categoria: 'SIN_CLASIFICAR',
      tipo_mapbox: tagPrincipal,
      distancia: Math.round(distancia),
      zona,
      peso: 0, // No calculamos peso en auditoría
      es_ancla: esVenueAncla(element.tags),
      coordenadas: { lat, lng }
    });
  }

  console.log(`\n📊 ESTADÍSTICAS DE PROCESAMIENTO:`);
  console.log(`   Elementos totales: ${elementsProcessed}`);
  console.log(`   Sin tags: ${elementsSinTags}`);
  console.log(`   Ways sin centro: ${waysSinCentro}`);
  console.log(`   Fuera de rango (>800m): ${elementosFueraRango}`);
  console.log(`   Venues válidos: ${venues.length}`);


  log('AUDITORÍA', `✅ ${venues.length} venues relevantes encontrados`);

  return venues;
}

// Detectar el tag principal de un venue
function detectarTagPrincipal(tags: any): string {
  // Prioridad de tags
  const prioridad = [
    'amenity',
    'shop',
    'leisure',
    'tourism',
    'highway',
    'public_transport',
    'railway',
    'aeroway'
  ];

  for (const tag of prioridad) {
    if (tags[tag]) {
      const valor = tags[tag];
      return `${tag}=${valor}`;
    }
  }

  // Si no hay tags principales, mostrar todos los tags
  const todosLosTags = Object.keys(tags)
    .filter(k => !k.startsWith('name') && !k.startsWith('addr:') && k !== 'brand')
    .slice(0, 3)
    .map(k => `${k}=${tags[k]}`)
    .join(', ');

  return todosLosTags || 'tags_varios';
}

// Prioridad de tags para ordenamiento
function getPrioridadTag(tag: string): number {
  const prioridades = {
    'shop': 100,
    'amenity': 90,
    'leisure': 80,
    'tourism': 70,
    'public_transport': 60,
    'railway': 50,
    'aeroway': 40
  };
  return prioridades[tag] || 0;
}

// =====================================================================
// CÁLCULO DE SCORES
// =====================================================================

interface ScoresPorPerfil {
  [perfil: string]: number;
}

// =====================================================================
// CÁLCULO DE INTENSIDAD (Score Absoluto 0-100)
// =====================================================================

/**
 * Calcula la intensidad absoluta del área (sin saturación)
 * Sirve para comparar fuerza comercial entre pantallas
 */
function calcularIntensidad(distribucionCategorias: Record<string, number>): number {
  let intensidadTotal = 0;

  // Suma lineal de todos los pesos
  for (const [categoria, cantidad] of Object.entries(distribucionCategorias)) {
    const pesosPerfil = MATRIZ_PERFILES[categoria as keyof typeof MATRIZ_PERFILES];
    if (!pesosPerfil) continue;

    // Tomar el peso máximo de esta categoría para cualquier perfil
    const pesoMaximo = Math.max(...Object.values(pesosPerfil));
    intensidadTotal += cantidad * pesoMaximo;
  }

  // Normalizar a 0-100 asumiendo un máximo teórico
  // Máximo teórico: 100 venues de peso 3.0 = 300 puntos
  const intensidadMaximaTeorica = 300;
  const intensidadNormalizada = Math.min((intensidadTotal / intensidadMaximaTeorica) * 100, 100);

  return Math.round(intensidadNormalizada * 10) / 10;
}

/**
 * Calcula scores de perfiles CON concentración (logarítmica)
 */
function calcularScoresConCentracion(venues: VenueProcesado[]): ScoresPorPerfil {
  log('SCORES', '🧮 Calculando scores con CONCENTRACIÓN EXPONENCIAL (cantidad^0.6)...');

  // Contar venues por categoría (dentro del rango de 400m)
  const venuesEnRango = venues.filter(v => v.zona !== 'FUERA_RANGO');
  const distribucionCategorias: Record<string, number> = {};

  venuesEnRango.forEach(v => {
    distribucionCategorias[v.categoria] = (distribucionCategorias[v.categoria] || 0) + 1;
  });

  log('SCORES', `📊 Distribución de categorías (${venuesEnRango.length} venues):`, distribucionCategorias);

  // Inicializar scores
  const scores: ScoresPorPerfil = {
    business_executive: 0,
    daily_life: 0,
    health_wellness: 0,
    gen_z_lifestyle: 0,
    high_end_luxury: 0,
    travel_transit: 0
  };

  // Calcular score para cada perfil usando CONCENTRACIÓN
  for (const [categoria, cantidad] of Object.entries(distribucionCategorias)) {
    const pesosPerfil = MATRIZ_PERFILES[categoria as keyof typeof MATRIZ_PERFILES];

    if (!pesosPerfil) continue;

    // APLICAR CONCENTRACIÓN EXPONENCIAL (más peso a la cantidad)
    // Score = cantidad^0.6 × peso
    // - 1 venue: 1.0
    // - 5 venues: 2.63
    // - 10 venues: 3.98
    // - 20 venues: 6.03
    const concentracion = Math.pow(cantidad, 0.6);

    for (const [perfil, pesoCategoria] of Object.entries(pesosPerfil)) {
      // Score con concentración
      const contribucion = concentracion * pesoCategoria;
      scores[perfil] += contribucion;
    }
  }

  // Ordenar perfiles por score
  const perfilesOrdenados = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([perfil, score]) => ({ perfil, score: Math.round(score * 100) / 100 }));

  log('SCORES', '📊 Rankings de perfiles (CON concentración):', perfilesOrdenados);

  return scores;
}

/**
 * Calcula scores de perfiles SIN concentración (lineal - para comparación)
 */
function calcularScoresLineales(venues: VenueProcesado[]): ScoresPorPerfil {
  const venuesEnRango = venues.filter(v => v.zona !== 'FUERA_RANGO');
  const distribucionCategorias: Record<string, number> = {};

  venuesEnRango.forEach(v => {
    distribucionCategorias[v.categoria] = (distribucionCategorias[v.categoria] || 0) + 1;
  });

  const scores: ScoresPorPerfil = {
    business_executive: 0,
    daily_life: 0,
    health_wellness: 0,
    gen_z_lifestyle: 0,
    high_end_luxury: 0,
    travel_transit: 0
  };

  for (const [categoria, cantidad] of Object.entries(distribucionCategorias)) {
    const pesosPerfil = MATRIZ_PERFILES[categoria as keyof typeof MATRIZ_PERFILES];

    if (!pesosPerfil) continue;

    // SIN concentración: Score = cantidad × peso (LINEAL)
    for (const [perfil, pesoCategoria] of Object.entries(pesosPerfil)) {
      scores[perfil] += cantidad * pesoCategoria;
    }
  }

  return scores;
}

// Mantener la función original para compatibilidad
function calcularScores(venues: VenueProcesado[]): ScoresPorPerfil {
  return calcularScoresConCentracion(venues);
}

// =====================================================================
// FUNCIÓN PRINCIPAL
// =====================================================================

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 DOOH SMART RECOMMENDER - PRUEBA DE CONCEPTO');
  console.log('='.repeat(80) + '\n');

  log('CONFIG', `📺 Pantalla: ${PANTALLA.nombre}`);
  log('CONFIG', `📍 Coordenadas: [${PANTALLA.coordenadas.lat}, ${PANTALLA.coordenadas.lng}]`);
  log('CONFIG', `📏 Radio análisis: ${PANTALLA.radio}m`);

  try {
    // PASO 1: Extraer venues
    console.log('\n' + '-'.repeat(80));
    log('PASO 1', 'EXTRAYENDO VENUES DE OVERPASS API');
    console.log('-'.repeat(80) + '\n');

    const elements = await extraerVenues(
      PANTALLA.coordenadas.lat,
      PANTALLA.coordenadas.lng,
      PANTALLA.radio
    );

    // PASO 2: Procesar venues
    console.log('\n' + '-'.repeat(80));
    log('PASO 2', 'PROCESANDO VENUES Y CALCULANDO PESOS POR DISTANCIA');
    console.log('-'.repeat(80) + '\n');

    const venues = procesarVenues(elements, PANTALLA.coordenadas.lat, PANTALLA.coordenadas.lng);

    // PASO 2.5: Análisis especial de EDIFICIOS (densidad residencial)
    console.log('\n' + '-'.repeat(80));
    log('PASO 2.5', 'ANALIZANDO DENSIDAD RESIDENCIAL (EDIFICIOS)');
    console.log('-'.repeat(80) + '\n');

    // Filtrar edificios de los venues ya procesados
    const edificiosResidencialesCrudos = venues.filter(v => v.tipo_mapbox.startsWith('building=')).map(v => ({
      tipo: v.tipo_mapbox.replace('building=', ''),
      distancia: v.distancia,
      zona: v.zona
    }));

    log('DEBUG', `🔍 Total venues procesados: ${venues.length}`);
    log('DEBUG', `🏠 Edificios residenciales encontrados: ${edificiosResidencialesCrudos.length}`);

    if (edificiosResidencialesCrudos.length > 0) {
      console.log('🏢 EDIFICIOS DETECTADOS:\n');
      console.log(`   Total: ${edificiosResidencialesCrudos.length} edificios en 400m`);

      // Distribución por zona
      const porZona = { A: 0, B: 0, C: 0 };
      edificiosResidencialesCrudos.forEach(e => {
        if (e && e.zona !== 'FUERA_RANGO') {
          porZona[e.zona as keyof typeof porZona]++;
        }
      });

      console.log('\n   Por zona:');
      console.log(`      Zona A (0-150m):    ${porZona.A} edificios`);
      console.log(`      Zona B (150-300m):  ${porZona.B} edificios`);
      console.log(`      Zona C (300-400m):  ${porZona.C} edificios`);

      // Tipos de edificios con PESOS para cálculo de índice
      const TIPOS_EDIFICIOS: Record<string, number> = {
        'apartments': 3.0,    // Mayor densidad
        'flats': 2.5,         // Alta densidad
        'dormitory': 2.0,     // Residencia estudiantil
        'terrace': 1.5,       // Media densidad
        'residential': 1.5,   // Genérico
        'house': 1.0,         // Baja densidad
        'yes': 1.5            // building=yes (genérico)
      };

      // Contar por tipo y calcular score
      const tipos: Record<string, number> = {};
      let scoreTotal = 0;

      edificiosResidencialesCrudos.forEach(e => {
        if (e) {
          tipos[e.tipo] = (tipos[e.tipo] || 0) + 1;
          const peso = TIPOS_EDIFICIOS[e.tipo] || 1.5;
          scoreTotal += peso;
        }
      });

      console.log('\n   Por tipo (con pesos):');
      Object.entries(tipos).sort(([, a], [, b]) => b - a).forEach(([tipo, count]) => {
        const peso = TIPOS_EDIFICIOS[tipo] || 1.5;
        const contribucion = count * peso;
        const porcentaje = ((count / edificiosResidencialesCrudos.length) * 100).toFixed(1);
        const barra = '█'.repeat(Math.ceil(count / 10));
        console.log(`      ${tipo.padEnd(15)} ${barra.padEnd(12)} ${count} (${porcentaje}%) × ${peso} = ${contribucion.toFixed(1)} pts`);
      });

      // Calcular Índice Residencial (0-100)
      const maximoTeorico = 1500; // Score máximo teórico
      const indiceResidencial = Math.min((scoreTotal / maximoTeorico) * 100, 100);

      console.log(`\n   📊 Score Total: ${scoreTotal.toFixed(1)} / ${maximoTeorico}`);
      console.log(`   🏢 ÍNDICE RESIDENCIAL: ${indiceResidencial.toFixed(1)}/100`);

      // Clasificar el entorno
      let clasificacion = '';
      if (indiceResidencial < 20) {
        clasificacion = 'Baja densidad (zona comercial)';
      } else if (indiceResidencial < 40) {
        clasificacion = 'Densidad media (barrio mixto)';
      } else if (indiceResidencial < 60) {
        clasificacion = 'Densidad alta (residencial)';
      } else if (indiceResidencial < 80) {
        clasificacion = 'Densidad muy alta (departamentos)';
      } else {
        clasificacion = 'Densidad extrema (torres)';
      }

      console.log(`   🏠 Perfil: ${clasificacion}`);

      console.log('\n' + '-'.repeat(80) + '\n');
    } else {
      console.log('🏢 No se detectaron edificios en la zona\n');
      console.log('-'.repeat(80) + '\n');
    }

    // Mostrar distribución por zona
    const porZona = venues.reduce((acc, v) => {
      acc[v.zona] = (acc[v.zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    log('PROCESO', `📍 Distribución por zona:`, porZona);

    // ========================================
    // REPORTE DETALLADO POR ZONAS
    // ========================================
    console.log('\n' + '='.repeat(80));
    log('REPORTE', '📊 REPORTE DETALLADO POR ZONAS DE INFLUENCIA');
    console.log('='.repeat(80) + '\n');

    const zonas = ['A', 'B', 'C', 'ANCLA'] as const;
    const consolidadoCategorias: Record<string, number> = {};

    zonas.forEach(zona => {
      const venuesZona = venues.filter(v => v.zona === zona);
      if (venuesZona.length === 0) return;

      let rango = '';
      let peso = '';
      let descripcion = '';

      if (zona === 'A') {
        rango = '0-150m';
        peso = '1.0';
        descripcion = 'Impacto Directo';
      } else if (zona === 'B') {
        rango = '150-300m';
        peso = '0.5';
        descripcion = 'Influencia Próxima';
      } else if (zona === 'C') {
        rango = '300-400m';
        peso = '0.2';
        descripcion = 'Entorno Extendido';
      } else if (zona === 'ANCLA') {
        rango = '400-800m';
        peso = '0.3';
        descripcion = 'Nodos de Atracción Masiva';
      }

      console.log(`┌──────────────────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│  ZONA ${zona} (${rango}) - Peso: ${peso} - ${descripcion.padEnd(20)} │`);
      console.log(`└──────────────────────────────────────────────────────────────────────────────────────┘\n`);

      console.log(`📏 Total de venues: ${venuesZona.length}`);
      console.log(`⚖️  Peso aplicado: ${peso}\n`);

      // Distribución por categoría en esta zona
      const porCategoriaZona: Record<string, number> = {};
      venuesZona.forEach(v => {
        porCategoriaZona[v.categoria] = (porCategoriaZona[v.categoria] || 0) + 1;
        consolidadoCategorias[v.categoria] = (consolidadoCategorias[v.categoria] || 0) + 1;
      });

      console.log(`📊 Distribución por categoría (${Object.keys(porCategoriaZona).length} tipos):`);
      console.log(''.padEnd(80, '-'));

      const categoriasZonaOrdenadas = Object.entries(porCategoriaZona).sort(([, a], [, b]) => b - a);
      categoriasZonaOrdenadas.forEach(([categoria, count]) => {
        const barra = '█'.repeat(Math.ceil(count / 2));
        const porcentaje = ((count / venuesZona.length) * 100).toFixed(1);
        console.log(`  ${categoria.padEnd(30)} ${barra.padEnd(15)} ${count} (${porcentaje}%)`);
      });

      console.log('\n📍 Listado de venues:\n');
      console.log('  #  ' + 'Nombre'.padEnd(35) + ' ' + 'Categoría'.padEnd(25) + ' ' + 'Distancia');
      console.log(''.padEnd(80, '-'));

      venuesZona.forEach((v, i) => {
        console.log(
          `  ${(i + 1).toString().padStart(2)}. ` +
          `${v.nombre.padEnd(35)} ` +
          `${v.categoria.padEnd(25)} ` +
          `${v.distancia}m`
        );
      });

      console.log('\n' + '='.repeat(80) + '\n');
    });

    // ========================================
    // REPORTE CONSOLIDADO
    // ========================================
    console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 REPORTE CONSOLIDADO (Todas las Zonas)                                            │');
    console.log('└──────────────────────────────────────────────────────────────────────────────────────┘\n');

    console.log(`📍 TOTAL DE VENUES: ${venues.length}\n`);

    console.log('📊 Distribución por zona:');
    console.log(''.padEnd(80, '-'));
    zonas.forEach(zona => {
      const count = venues.filter(v => v.zona === zona).length;
      if (count > 0) {
        const porcentaje = ((count / venues.length) * 100).toFixed(1);
        let rango = '';
        if (zona === 'A') rango = '0-150m';
        else if (zona === 'B') rango = '150-300m';
        else if (zona === 'C') rango = '300-400m';
        else if (zona === 'ANCLA') rango = '400-800m';

        const nombreZona = zona === 'ANCLA' ? 'ZONA ANCLA' : `Zona ${zona}`;
        console.log(`  ${nombreZona} (${rango.padEnd(9)}): ${count.toString().padStart(3)} venues (${porcentaje}%)`);
      }
    });

    console.log('\n📊 Distribución por categoría (todas las zonas):');
    console.log(''.padEnd(80, '-'));

    const categoriasConsolidadasOrdenadas = Object.entries(consolidadoCategorias)
      .sort(([, a], [, b]) => b - a);

    categoriasConsolidadasOrdenadas.forEach(([categoria, count]) => {
      const barra = '█'.repeat(Math.ceil(count / 3));
      const porcentaje = ((count / venues.length) * 100).toFixed(1);
      console.log(`  ${categoria.padEnd(30)} ${barra.padEnd(20)} ${count} (${porcentaje}%)`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Mostrar anclas detectadas
    const anclas = venues.filter(v => v.es_ancla);
    if (anclas.length > 0) {
      log('PROCESO', `⚓ ${anclas.length} VENUES ANCLA detectados:`, anclas.map(a => ({
        nombre: a.nombre,
        distancia: a.distancia + 'm',
        categoria: a.categoria
      })));
    }

    // Mostrar distribución por categoría
    const porCategoria = venues.reduce((acc, v) => {
      acc[v.categoria] = (acc[v.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    log('PROCESO', `📊 Distribución por categoría:`, porCategoria);

    // ========================================
    // LISTADO COMPLETO PARA AUDITORÍA
    // ========================================
    console.log('\n' + '='.repeat(80));
    log('AUDITORÍA', `📋 LISTADO COMPLETO DE ${venues.length} VENUES`);
    console.log('='.repeat(80) + '\n');

    const venuesOrdenados = venues.sort((a, b) => a.distancia - b.distancia);

    if (MODO_AUDITORIA) {
      // Separar por zonas relevantes
      const dentroRango = venuesOrdenados.filter(v => v.zona !== 'FUERA_RANGO');
      const anclas = venuesOrdenados.filter(v => v.es_ancla);

      console.log(`\n📍 RESUMEN:`);
      console.log(`  • ${dentroRango.length} venues dentro de rango (400m)`);
      console.log(`  • ${anclas.length} venues ANCLA detectados`);
      console.log(`  • Total procesados: ${venuesOrdenados.length}\n`);

      // Mostrar ANCLAS primero si hay
      if (anclas.length > 0) {
        console.log('⚓️  VENUES ANCLA DETECTADOS:');
        console.log(''.padEnd(120, '-'));
        anclas.forEach((v, i) => {
          console.log(
            `${(i + 1).toString().padStart(2)}. ` +
            `${v.nombre.padEnd(35)} | ` +
            `${v.tipo_mapbox.padEnd(35)} | ` +
            `${v.distancia.toString().padStart(5)}m`
          );
        });
        console.log('');
      }

      // Top 50 venues más cercanos
      console.log('🏆 TOP 50 VENUES MÁS CERCANOS:');
      console.log(''.padEnd(120, '-'));

      dentroRango.slice(0, 50).forEach((v, i) => {
        console.log(
          `${(i + 1).toString().padStart(2, '0')}. ` +
          `${v.nombre.padEnd(35)} | ` +
          `${v.tipo_mapbox.padEnd(35)} | ` +
          `${v.distancia.toString().padStart(5)}m | ` +
          `${v.zona.padStart(5)}`
        );
      });

      // Análisis de tags encontrados
      console.log('\n' + '='.repeat(80));
      log('AUDITORÍA', '📊 ANÁLISIS DE TAGS MAPBOX ENCONTRADOS (dentro de 400m):');
      console.log('='.repeat(80) + '\n');

      const tagsEncontrados = new Map<string, string[]>(); // tag -> [nombres]

      dentroRango.forEach(v => {
        const tagKey = v.tipo_mapbox;
        if (!tagsEncontrados.has(tagKey)) {
          tagsEncontrados.set(tagKey, []);
        }
        if (tagsEncontrados.get(tagKey)!.length < 3) { // Max 3 ejemplos por tag
          tagsEncontrados.get(tagKey)!.push(v.nombre);
        }
      });

      const tagsOrdenados = Array.from(tagsEncontrados.entries())
        .sort(([a], [b]) => {
          // Ordenar por tag principal primero
          const prioridadA = getPrioridadTag(a.split('=')[0]);
          const prioridadB = getPrioridadTag(b.split('=')[0]);
          return prioridadB - prioridadA;
        });

      tagsOrdenados.forEach(([tag, nombres]) => {
        const [key, value] = tag.split('=');
        const count = dentroRango.filter(v => v.tipo_mapbox === tag).length;
        console.log(`  ${tag.padEnd(40)} ${count} venues`);
        if (nombres.length > 0) {
          console.log(`    Ejemplos: ${nombres.slice(0, 3).join(', ')}`);
        }
        console.log('');
      });

    } else {
      // Modo normal (original)
      venuesOrdenados.forEach((v, i) => {
        console.log(
          `${(i + 1).toString().padStart(2, '0')}. ` +
          `${v.nombre.padEnd(30)} ` +
          `| ${v.tipo_mapbox.padEnd(30)} ` +
          `| ${v.categoria.padEnd(20)} ` +
          `| ${v.zona.padStart(5)} ` +
          `| ${v.distancia.toString().padStart(4)}m ` +
          `| peso: ${v.peso}`
        );
      });
    }

    console.log('\n' + '='.repeat(80));

    // Mostrar top 20 venues más cercanos (versión resumida)
    log('PROCESO', `🏆 Top 20 venues más cercanos:`, venuesOrdenados.slice(0, 20).map(v => ({
      nombre: v.nombre,
      categoria: v.categoria,
      distancia: v.distancia + 'm',
      zona: v.zona,
      peso: v.peso
    })));

    // PASO 3: Calcular scores (solo si NO es modo auditoría)
    if (!MODO_AUDITORIA) {
      console.log('\n' + '-'.repeat(80));
      log('PASO 3', '🎯 ANÁLISIS COMPLETO DE LA PANTALLA (3 SISTEMAS DE SCORE)');
      console.log('-'.repeat(80) + '\n');

      // ========================================
      // PARTE 1: INTENSIDAD ABSOLUTA (0-100)
      // ========================================
      const distribucionCategorias = venues.reduce((acc, v) => {
        acc[v.categoria] = (acc[v.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const intensidad = calcularIntensidad(distribucionCategorias);

      console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│  📊 PARTE 1: INTENSIDAD ABSOLUTA (Fuerza Comercial del Área)                        │');
      console.log('└──────────────────────────────────────────────────────────────────────────────────────┘\n');

      log('INTENSIDAD', `💪 Score de Intensidad: ${intensidad}/100`, {
        descripcion: 'Medida lineal de fuerza comercial absoluta (sin saturación)',
        categorias: Object.keys(distribucionCategorias).length,
        venues_totales: Object.values(distribucionCategorias).reduce((a, b) => a + b, 0)
      });

      console.log('\n' + '·'.repeat(80) + '\n');

      // ========================================
      // PARTE 2: PERFIL CON CONCENTRACIÓN LOGARÍTMICA
      // ========================================
      const scoresConCentracion = calcularScoresConCentracion(venues);

      console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│  🎯 PARTE 2: PERFIL DOOH (Con Concentración Logarítmica)                            │');
      console.log('└──────────────────────────────────────────────────────────────────────────────────────┘\n');

      const perfilPrimario = Object.entries(scoresConCentracion)
        .sort(([, a], [, b]) => b - a)[0];

      log('PERFIL', `🏆 PERFIL PRIMARIO: ${perfilPrimario[0].toUpperCase()}`, {
        score: Math.round(perfilPrimario[1] * 10) / 10,
        descripcion: 'Score ajustado por concentración (Math.log) para evitar saturación'
      });

      console.log('\n' + '-'.repeat(80));
      log('PERFIL', '📊 TODOS LOS PERFILES (ordenados por score):');
      console.log('-'.repeat(80) + '\n');

      const totalScore = Object.values(scoresConCentracion).reduce((a, b) => a + b, 0);
      Object.entries(scoresConCentracion)
        .sort(([, a], [, b]) => b - a)
        .forEach(([perfil, score]) => {
          const porcentaje = ((score / totalScore) * 100).toFixed(1);
          console.log(`  ${perfil.padEnd(25)} ${score.toFixed(1).padStart(8)} pts (${porcentaje}%)`);
        });

      console.log('\n' + '·'.repeat(80) + '\n');

      // ========================================
      // PARTE 3: COMPARATIVA (LINEAL vs LOGARÍTMICA)
      // ========================================
      console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│  ⚖️  PARTE 3: COMPARATIVA (Impacto de la Concentración Logarítmica)                  │');
      console.log('└──────────────────────────────────────────────────────────────────────────────────────┘\n');

      const scoresLineales = calcularScoresLineales(venues);

      log('COMPARATIVA', `📈 Impacto de la concentración en rankings:`, {
        descripcion: 'Comparación entre scoring lineal (sin corrección) y logarítmico (con corrección)'
      });

      console.log('\n' + '-'.repeat(80));
      console.log('  PERFIL'.padEnd(25) + 'LINEAL'.padStart(12) + 'LOGARÍTMICO'.padStart(12) + 'DIFERENCIA'.padStart(10));
      console.log('-'.repeat(80));

      Object.entries(scoresConCentracion)
        .sort(([, a], [, b]) => b - a)
        .forEach(([perfil, scoreLog]) => {
          const scoreLin = scoresLineales[perfil];
          const diff = (scoreLog - scoreLin).toFixed(1);
          const diffStr = diff.startsWith('-') ? diff : `+${diff}`;
          const diffColor = diff.startsWith('-') ? '🔴' : '🟢';

          console.log(
            `  ${perfil.padEnd(25)}` +
            `${scoreLin.toFixed(1).padStart(10)} pts ` +
            `${scoreLog.toFixed(1).padStart(10)} pts ` +
            `${diffStr.padStart(10)} ${diffColor}`
          );
        });
    } else {
      console.log('\n' + '='.repeat(80));
      log('FINAL', '🔍 AUDITORÍA COMPLETADA - Revisa los resultados para crear filtros');
      console.log('='.repeat(80) + '\n');
    }

    // ========================================
    // ANÁLISIS DE DENSIDAD RESIDENCIAL (BUILDINGS)
    // ========================================
    const edificios = venues.filter(v => v.categoria === 'residencial');
    if (edificios.length > 0) {
      console.log('┌──────────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│  🏢 ANÁLISIS DE DENSIDAD RESIDENCIAL (Edificios)                                    │');
      console.log('└──────────────────────────────────────────────────────────────────────────────────────┘\n');

      console.log(`📍 Total de edificios residenciales: ${edificios.length}`);

      // Distribuir por zona
      const porZona = { A: 0, B: 0, C: 0, ANCLA: 0 };
      edificios.forEach(v => {
        if (v.zona !== 'FUERA_RANGO') {
          porZona[v.zona as keyof typeof porZona]++;
        }
      });

      console.log('\n📊 Distribución por zona:');
      console.log(''.padEnd(80, '-'));
      Object.entries(porZona).forEach(([zona, count]) => {
        if (count > 0) {
          const rango = zona === 'A' ? '0-150m' : zona === 'B' ? '150-300m' : zona === 'C' ? '300-400m' : '400-800m';
          console.log(`  Zona ${zona} (${rango.padEnd(9)}): ${count} edificios`);
        }
      });

      // Estimar población (asumiendo promedio)
      const poblacionEstimada = edificios.length * 50; // 50 personas por edificio en promedio
      console.log(`\n👥 Población estimada en 400m: ~${poblacionEstimada} personas`);
      console.log(`   (Asumiendo 50 personas por edificio en promedio)`);

      // Tipos de edificios
      const tiposEdificios: Record<string, number> = {};
      edificios.forEach(v => {
        const tipo = v.tipo_mapbox.replace('building=', '');
        tiposEdificios[tipo] = (tiposEdificios[tipo] || 0) + 1;
      });

      console.log('\n📊 Tipos de edificios:');
      console.log(''.padEnd(80, '-'));
      Object.entries(tiposEdificios).sort(([, a], [, b]) => b - a).forEach(([tipo, count]) => {
        const porcentaje = ((count / edificios.length) * 100).toFixed(1);
        const barra = '█'.repeat(Math.ceil(count / 3));
        console.log(`  ${tipo.padEnd(20)} ${barra.padEnd(15)} ${count} (${porcentaje}%)`);
      });

      console.log('\n📍 Top 20 edificios más cercanos:\n');
      console.log('  #  ' + 'Nombre'.padEnd(35) + ' ' + 'Tipo'.padEnd(20) + 'Distancia');
      console.log(''.padEnd(80, '-'));

      edificios.slice(0, 20).forEach((v, i) => {
        const tipo = v.tipo_mapbox.replace('building=', '');
        console.log(
          `  ${(i + 1).toString().padStart(2)}. ` +
          `${v.nombre.padEnd(35)} ` +
          `${tipo.padEnd(20)} ` +
          `${v.distancia}m`
        );
      });

      console.log('\n' + '='.repeat(80) + '\n');
    } else {
      console.log('🏢 No se detectaron edificios residenciales en la zona\n');
      console.log('='.repeat(80) + '\n');
    }

    console.log('\n' + '='.repeat(80));

    if (!MODO_AUDITORIA) {
      log('FINAL', '✅ ANÁLISIS COMPLETADO EXITOSAMENTE');
    } else {
      log('FINAL', '✅ AUDITORÍA COMPLETADA - Ahora podemos crear filtros basados en datos reales');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
main();
