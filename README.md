# Tupantalla Asistente - DOOH Smart Recommender

Sistema inteligente de recomendación de pantallas digitales (DOOH - Digital Out of Home) con enriquecimiento geoespacial y perfilado semántico de audiencias.

## 📋 Brief de Producto: DOOH Smart Recommendation Engine

### 1. Descripción del Proyecto

Este sistema transforma un listado estático de ubicaciones GPS de pantallas digitales (DOOH) en un motor de recomendación inteligente. Mediante el enriquecimiento geoespacial con Mapbox y el perfilamiento semántico, el sistema identifica el "mindset" de la audiencia en cada punto y sugiere anunciantes ideales, desde grandes corporaciones hasta negocios locales.

### 2. Matriz Maestra de Perfilamiento (Inteligencia de Negocio)

Esta matriz actúa como el "cerebro" del Chatbot. El LLM utiliza las **Keywords de Anamnesis** para categorizar al cliente, ejecuta una query SQL basada en el **ID de Perfil**, y construye el pitch usando el **Argumento Maestro**.

| Perfil (ID SQL) | Keywords de Anamnesis (Input) | Mindset / Contexto | Clientes Ideales (Marcas / Pros / Pymes) | Argumento Maestro (Pitch) |
| :--- | :--- | :--- | :--- | :--- |
| **Business / Executive** | Corporativo, B2B, finanzas, inversión, oficinas, gerentes, legal, software, networking. | Profesional, enfocado en productividad, toma de decisiones, alto poder adquisitivo. | **Marcas:** SaaS, Fintech, Real Estate, Aerolíneas, Autos Premium. <br> **Pros:** Estudios de abogados, contadores, headhunters. <br> **Pymes:** Coworkings, cafeterías, mensajería. | "Impacta a los tomadores de decisiones en su entorno de trabajo. Tu marca gana autoridad al estar rodeada de centros de poder y negocios." |
| **Daily Life / Household** | Familia, hogar, mascotas, farmacia, rutina, barrio, niños, limpieza, supermercado, reparaciones. | Pragmático, enfocado en resolución de necesidades diarias y bienestar del hogar. | **Marcas:** Consumo masivo (FMCG), Telcos, Seguros, Banca Retail. <br> **Pros:** Veterinarios, inmobiliarias, tutores. <br> **Pymes:** Panaderías, ferreterías, lavanderías. | "Conecta con la audiencia en su trayecto de compra cotidiano. Ideal para productos de necesidad inmediata y servicios de proximidad en zonas de alta densidad." |
| **High-End / Luxury** | Exclusivo, premium, estatus, lujo, arte, gourmet, inversión, moda, coleccionismo. | Aspiracional, busca gratificación, calidad excepcional y experiencias exclusivas. | **Marcas:** Relojería, Alta Joyería, Perfumes, Banca Privada, Inmobiliarias de Lujo. <br> **Pros:** Arquitectos, Wealth Management. <br> **Pymes:** Galerías de arte, vinerías boutique. | "Posiciona tu marca en un entorno de exclusividad y prestigio. Tu anuncio será visto por una audiencia selecta en momentos de ocio de alto nivel." |
| **Gen Z / Lifestyle** | Social, tendencia, gaming, música, universidad, moda, snacks, streaming, tecnología. | Conectado, busca gratificación instantánea, sensible a tendencias y experiencias sociales. | **Marcas:** Streaming, Gaming, Bebidas Energéticas, App Tech, Fast Fashion. <br> **Pros:** Academias de baile, tatuadores, influencers. <br> **Pymes:** Ropa vintage, escape rooms, bubble tea. | "Tu marca en el epicentro de la vida social y universitaria. Captura la atención de una audiencia joven y dinámica que dicta las tendencias del mañana." |
| **Health & Wellness** | Deporte, gimnasio, salud, bienestar, dieta, orgánico, prevención, cuidado, médico. | Consciente del cuerpo, enfocado en longevidad, prevención y mejora personal. | **Marcas:** Suplementos, Ropa Deportiva, Aseguradoras, Clínicas, Cuidado Personal. <br> **Pros:** Nutricionistas, psicólogos, fisioterapeutas. <br> **Pymes:** Centros de Yoga, tiendas orgánicas. | "Aparece cuando el usuario está activamente cuidando de sí mismo. Mindset de receptividad total hacia productos que promuevan una vida sana." |
| **Travel & Transit** | Turismo, viaje, hotel, transporte, movilidad, aeropuerto, vacaciones, mudanza, logística. | En movimiento, con necesidades de urgencia o planificación de ocio y logística. | **Marcas:** Hoteles, Plataformas de Viaje, Apps de Movilidad (Uber), Logística Global. <br> **Pros:** Asesores de visas, traductores. <br> **Pymes:** Taxis locales, parkings, tiendas de souvenirs. | "Captura el flujo de personas en transición. Ideal para marcas que ofrecen conveniencia, movilidad y soluciones para el viajero nacional e internacional." |

---

### 3. Matriz de Datos Técnicos (Configuración Geoespacial)

Esta tabla define los criterios técnicos que el script de enriquecimiento utiliza para clasificar las coordenadas GPS.

| Perfil DOOH | Venues (Mapbox / OSM Tags) para Query SQL |
| :--- | :--- |
| **Business** | **Mapbox:** bank, atm, business_center, office, government_office, townhall, courthouse, embassy, coworking_space, conference_centre. <br> **OSM:** office=*, amenity=bank, amenity=business_centre, amenity=townhall. |
| **Daily Life** | **Mapbox:** grocery, pharmacy, supermarket, laundry, convenience, bakery, butcher, hardware_store, beauty_salon, hairdresser, dentist, doctor. <br> **OSM:** shop=supermarket, shop=convenience, shop=bakery, shop=hardware, amenity=pharmacy, amenity=doctors. |
| **High-End** | **Mapbox:** jewelry, luxury_store, fine_dining, museum, art_gallery, boutique, antiques, wine_shop, perfumery, watch_store, golf_course, casino, spa. <br> **OSM:** shop=jewelry, shop=boutique, tourism=museum, tourism=art_gallery, amenity=casino, leisure=spa. |
| **Gen Z** | **Mapbox:** cafe, coffee_shop, fast_food, cinema, university, college, stadium, nightclub, bar, pub, video_games, tattoo, gaming_center, escape_room. <br> **OSM:** amenity=cafe, amenity=fast_food, amenity=cinema, amenity=university, amenity=nightclub, leisure=stadium, leisure=escape_room. |
| **Health** | **Mapbox:** gym, fitness_centre, sports_centre, park, hospital, clinic, yoga_studio, pilates_studio, health_food, swimming_pool, rehabilitation. <br> **OSM:** leisure=fitness_centre, leisure=sports_centre, leisure=park, amenity=hospital, amenity=clinic, shop=health_food. |
| **Travel** | **Mapbox:** airport, bus_station, train_station, gas_station, ev_station, hotel, motel, hostel, car_rental, taxi, parking, ferry_terminal, subway_station. <br> **OSM:** amenity=bus_station, amenity=fuel, amenity=parking, tourism=hotel, railway=station, aeroway=aerodrome. |

---

### 4. Lógica Técnica y Algoritmos (Pipeline Híbrido)

El sistema opera bajo un flujo de tres capas que garantiza precisión técnica y persuasión comercial:

#### Capa 1: Anamnesis y Clasificación (LLM)
- **Input:** Lenguaje natural del cliente ("Vendo vitaminas para deportistas").
- **Acción:** El LLM mapea el input a un **ID de Perfil** (ej: `Health & Wellness`) usando las keywords de la Matriz de Inteligencia.
- **Detección de Segmento:** Identifica si es Marca, Pro o Pyme para ajustar la prioridad de búsqueda (Cobertura vs Proximidad).

#### Capa 2: Extracción y Scoring (SQL Exacto)
- **Query SQL:** Busca en la base de datos de pantallas aquellas con `perfil_primario = 'health_wellness'`.
- **Filtros Adicionales:** Se pueden aplicar filtros por `intensidad > X` o por `distrito`.
- **Contexto de Datos:** La BD devuelve la lista de pantallas junto con su distribución de categorías y Venues Ancla cercanos.

#### Capa 3: Pitch Persuasivo (LLM)
- **Input:** Datos técnicos de la BD + Matriz de Inteligencia.
- **Acción:** El LLM construye el mensaje final integrando el **Argumento Maestro** con los datos reales del entorno.
- **Output:** "Te sugiero esta pantalla porque está en una zona de perfil Wellness (Score 85/100). Estarás a pocos metros de 3 gimnasios importantes, captando a tu audiencia en su momento de mayor receptividad."

---

### 5. Integración con n8n: Chatbot Anti-Alucinaciones

Para garantizar que el chatbot sea preciso, escalable y libre de alucinaciones, se utiliza **n8n** como orquestador. Este flujo separa la "creatividad" del LLM de la "rigurosidad" de los datos en Supabase.

#### A. Flujo del Workflow en n8n

1.  **Trigger:** El usuario envía un mensaje (vía Webhook o Chat).
2.  **AI Agent (Anamnesis):** Un nodo de AI extrae el tipo de negocio y la ubicación deseada.
    -   *Output:* `{"negocio": "veterinaria", "ubicacion": "San Isidro"}`.
3.  **Supabase (Clasificación):** Se busca el término "veterinaria" en la tabla `config_perfiles_dooh` (columna `keywords`).
    -   *Resultado:* Se obtiene el **ID de Perfil: `daily_life`** y su `argumento_maestro`.
4.  **Supabase (Búsqueda de Inventario):** Se realiza una query SQL exacta para encontrar pantallas que hagan match.
    -   *Filtro:* `perfil_primario = 'daily_life' AND metadata_location LIKE '%San Isidro%'`.
    -   *Orden:* `ORDER BY score_intensidad DESC`.
5.  **Lógica de "Mínimo 3 Resultados":**
    -   Si la búsqueda devuelve < 3 resultados, el flujo realiza una **segunda búsqueda expandida** en distritos aledaños o bajando el umbral de intensidad.
6.  **AI Agent (Pitch Final):** El LLM recibe los datos de las 3 pantallas y el `argumento_maestro`.
    -   *Restricción:* "Solo usa estos datos. No inventes lugares ni distancias".

#### B. Ejemplo Real: "Veterinaria en San Isidro"

**1. Input del Usuario:** *"Quiero anunciar mi veterinaria en San Isidro, busco gente del barrio."*

**2. Proceso Interno:**
- **Match de Perfil:** "Veterinaria" → **Daily Life / Household**.
- **Query SQL:** `SELECT * FROM pantallas WHERE perfil_primario = 'daily_life' AND location = 'San Isidro' LIMIT 3;`
- **Resultados de la BD:**
    1.  *Pantalla Av. Pezet:* Intensidad 85, a 50m de Supermercado Vivanda.
    2.  *Pantalla Calle Las Camelias:* Intensidad 72, en zona residencial densa.
    3.  *Pantalla Av. Dos de Mayo:* Intensidad 68, rodeada de cafés y farmacias.

**3. Output del Chatbot:**
> "He seleccionado las **3 mejores pantallas** para tu veterinaria en San Isidro, optimizadas para el perfil **Daily Life**:
>
> 1.  **Av. Pezet (Top Choice):** Con un score de intensidad de 85/100, es ideal porque está a solo 50m de Vivanda. Captarás a los dueños de mascotas en su ruta de compra diaria.
> 2.  **Las Camelias:** Ubicada en el corazón residencial, perfecta para generar recordación en el público que vive y camina por la zona.
> 3.  **Av. Dos de Mayo:** Una zona de alto tráfico local rodeada de servicios, donde tu marca ganará confianza por proximidad.
>
> ¿Te gustaría ver las métricas detalladas de alguna de ellas?"

---

### 6. Algoritmos de Enriquecimiento (Offline)

#### A. Enriquecimiento Geoespacial con Overpass API

Para cada pantalla, se realiza una consulta radial a **Overpass API** (OpenStreetMap) que extrae **todos los venues** en un radio de 800m. Cada Venue encontrado recibe un peso basado en su distancia:

##### Zonas de Influencia por Distancia

**Zona A (0 - 150m): Impacto Directo**
- **Peso:** 1.0 (Máximo)
- Lugares con visibilidad inmediata. Define el uso primario del suelo.

**Zona B (150m - 300m): Influencia Próxima**
- **Peso:** 0.5 (Medio)
- Lugares a una distancia de caminata breve. Aportan al perfil sociodemográfico.

**Zona C (300m - 400m): Entorno Extendido**
- **Peso:** 0.2 (Bajo)
- Define el contexto general de la zona.

**Zona Especial: Factor Ancla (400m - 800m)**
- **Peso:** 0.3 (Fijo)
- Se activa solo si el Venue pertenece a la lista de Nodos de Atracción Masiva.

##### Definición Automática del Factor Ancla

Para que el sistema procese esto sin intervención manual, se consideran "Anclas" los Venues que cumplan con las siguientes clases/tipos en OpenStreetMap:

- **Transporte Masivo:** `aeroway=aerodrome`, `amenity=airport`, `amenity=bus_station`, `railway=station`
- **Grandes Superficies:** `shop=mall` (centros comerciales de escala regional)
- **Entretenimiento y Eventos:** `leisure=stadium`, `amenity=stadium`, `amenity=exhibition_center`

**Lógica de Selección:** Si uno de estos Venues se encuentra en el rango de 400m a 800m, se incluye en el cálculo de afinidad de la pantalla con un peso de 0.3, reconociendo que el flujo de personas hacia ese punto impacta la audiencia de la pantalla aunque no esté "al lado".

#### B. Sistema de Scoring (3 Métricas Complementarias)

El sistema implementa **tres métricas complementarias** para evitar la saturación y proporcionar una visión completa del perfil de cada pantalla:

##### 1. INTENSIDAD ABSOLUTA (0-100)

**Propósito:** Medida lineal de fuerza comercial absoluta para comparar pantallas.

**Cálculo:**
```typescript
Intensidad = MIN( (Σ(cantidad × peso_máximo) / intensidad_máxima_teorica) × 100, 100)
```

**Uso:** Permite decir "esta pantalla es 3x más fuerte que esa otra" en términos absolutos.

##### 2. PERFIL DOOH (Con Concentración Logarítmica)

**Propósito:** Identifica el mindset de la audiencia evitando saturación por concentración de venues.

**Problema que resuelve:** No es lo mismo 1 farmacia que 10 farmacias. Sin corrección, 10 farmacias darían 10x más peso (saturación).

**Solución:** Aplicamos **concentración logarítmica** usando `Math.pow(cantidad, 0.6)`:

```typescript
ScorePerfil = Σ( (cantidad^0.6) × peso_perfil )
```

**Ejemplo:**
- 1 restaurante: `1^0.6 = 1.0` × peso = X
- 10 restaurantes: `10^0.6 = 3.98` × peso = ~4X (no 10X)

La categoría con el score más alto se convierte en el **Perfil Primario**.

##### 3. COMPARATIVA (Lineal vs Logarítmico)

**Propósito:** Muestra el impacto de la corrección por concentración.

Muestra lado a lado:
- **Score Lineal:** Sin corrección (cantidad × peso)
- **Score Logarítmico:** Con corrección (Math.pow × peso)
- **Diferencia:** Cuánto redujo la saturación

Esto permite validar que el algoritmo está funcionando correctamente.

#### C. Por Qué Funciona Este Enfoque

**1. Evita la Saturación**
- Sin corrección: 10 farmacias = 10x más peso que 1 farmacia
- Con potencia 0.6: 10 farmacias = ~4x más peso.

**2. Captura Variedad y Cantidad**
- **Intensidad (0-100):** "¿Cuánta actividad comercial hay?"
- **Perfil:** "¿Qué tipo de audiencia predomina?"
- **Comparativa:** "¿Cuánto impacta la concentración?"

**3. Escalabilidad**
- Procesa cualquier coordenada GPS automáticamente
- No requiere clasificación manual del entorno
- Funciona consistentemente en cualquier país/ciudad

### 6. 🔧 Parámetros Ajustables para Experimentación
```

**Cómo ajustar:**
- **Más sensible a distancia:** Aumentar `ZONA_C_PESO` de 0.2 a 0.3
- **Más agresivo con anclas:** Aumentar `ZONA_ANCLA_PESO` de 0.3 a 0.5
- **Menos peso a distancia:** Reducir `ZONA_C_PESO` de 0.2 a 0.1

#### B. Concentración Logarítmica

**Función:** `calcularScoresConCentracion()`

```typescript
// Actual: Math.log(cantidad + 1)
const concentracionLogaritmica = Math.log(cantidad + 1);
```

**Alternativas para probar:**
```typescript
// Más agresivo (más reducción de saturación)
Math.sqrt(cantidad) // Raíz cuadrada

// Menos agresivo (menos reducción)
Math.log(cantidad + 2) // Base e, offset +2

// Personalizado
Math.pow(cantidad, 0.7) // Potencia 0.7 (entre lineal y log)
```

**Ejemplo de impacto:**
- `log(10 + 1) = 2.40` → 10 venues = 3.5x más que 1 venue
- `sqrt(10) = 3.16` → 10 venues = 4.6x más que 1 venue
- `10^0.7 = 5.01` → 10 venues = 7.2x más que 1 venue

#### C. Pesos de Perfiles por Categoría

**Archivo:** `scripts/test-pantalla-1.ts`

```typescript
const MATRIZ_PERFILES = {
  gastronomia: {
    daily_life: 3.0,           // ← Ajustar estos pesos
    gen_z_lifestyle: 2.5,
    high_end_luxury: 1.5,
    // ...
  },
  // ... más categorías
};
```

**Cómo ajustar:**
- **Aumentar peso:** Cambiar `3.0` a `4.0` (más impacto)
- **Reducir peso:** Cambiar `3.0` a `2.0` (menos impacto)
- **Validación:** Correr el script y ver la comparativa lineal vs logarítmico

#### D. Categorías de Venues (Mapbox Tags)

**Archivo:** `scripts/test-pantalla-1.ts`

```typescript
const CATEGORIAS_MAPBOX = {
  // Agregar nuevos tags
  'amenity=co_working': 'servicios_personales',
  'tourism=hotel': 'turismo_hospedaje',
  // ...
};
```

**Cómo agregar:**
1. Ejecutar en modo auditoría: `MODO_AUDITORIA = true`
2. Ver qué tags aparecen en los resultados
3. Agregar el tag a `CATEGORIAS_MAPBOX`
4. Asignar a una categoría existente o crear nueva

#### E. Venues ANCLA

**Archivo:** `scripts/test-pantalla-1.ts`

```typescript
const VENUES_ANCLA = [
  'aeroway=aerodrome',
  'amenity=airport',
  'amenity=bus_station',
  'railway=station',
  'shop=mall',                   // ⚠️ ANCLA: Centro comercial
  'leisure=stadium',
  'amenity=stadium',
  'amenity=exhibition_center'
];
```

**Cómo ajustar:**
- **Agregar nueva ancla:** `'tourism=museum'` (si es un museum muy grande)
- **Eliminar ancla:** Remover `'leisure=stadium'` si no quieres considerarlos

#### F. Radio de Análisis

**Archivo:** `scripts/test-pantalla-1.ts`

```typescript
const PANTALLA = {
  nombre: 'Pantalla Test 2 - Lima',
  coordenadas: {
    lat: -12.092636672879879,
    lng: -77.0504236313318
  },
  radio: 500  // ← Ajustar este valor
};
```

**Recomendaciones:**
- **Zona urbana densa:** 300-400m (más precisión)
- **Zona suburbana:** 500-800m (más contexto)
- **Zona rural:** 1000-1500m (capturar todo)

### 6. Metodología de Validación

#### Paso 1: Auditoría de Datos
```typescript
// Activar modo auditoría
const MODO_AUDITORIA = true;
```

**Qué muestra:**
- Todos los venues encontrados (sin filtros)
- Tags de OpenStreetMap reales
- Top 50 venues más cercanos
- Distribución por zona

#### Paso 2: Validación de Scoring
```typescript
// Modo normal (con scoring)
const MODO_AUDITORIA = false;
```

**Qué validar:**
1. **Intensidad (0-100):** ¿Es razonable para esa zona?
2. **Perfil:** ¿Coincide con la realidad del lugar?
3. **Comparativa:** ¿La diferencia lineal vs logarítmica tiene sentido?

#### Paso 3: Iteración
1. Ajustar UN parámetro a la vez
2. Correr el script
3. Comparar resultados
4. Documentar qué funcionó mejor

---

### 7. Arquitectura del Chatbot (Flujo Híbrido)

* **Paso 1 (Semántico):** El bot entiende que "venta de vitaminas" pertenece al perfil **Health & Wellness**
* **Paso 2 (Precisión):** El sistema busca en la base de datos las pantallas en el distrito solicitado que tengan el tag Wellness
* **Paso 3 (Venta):** El bot construye la respuesta: *"Te sugiero la Pantalla A en el Distrito X porque, según los datos de entorno, el 70% de los lugares cercanos son centros deportivos y parques, lo que garantiza que tu público objetivo verá el anuncio en el momento de mayor relevancia. Intensidad comercial: 45/100."*

### 8. Variables de Éxito (KPIs)

* **Relevancia Comercial:** El anunciante siente que la pantalla está puesta "a medida"
* **Eficiencia de Inventario:** Se venden pantallas que antes se consideraban "secundarias" al encontrarles un nicho específico
* **Escalabilidad:** El sistema puede procesar miles de puntos GPS sin intervención humana manual
* **Transparencia:** La comparativa lineal vs logarítmica permite explicar POR QUÉ una pantalla tiene cierto perfil

---

## 🗺️ Extracción de Datos Geoespaciales

### Tecnologías Utilizadas

Este proyecto integra dos fuentes principales de datos geoespaciales:

#### 1. Overpass API (OpenStreetMap) - Extracción de Venues

**Uso principal:** Análisis de venues alrededor de pantallas DOOH

**Ventajas:**
- ✅ **Gratis y sin límites** (a diferencia de Mapbox Places API)
- ✅ **Datos completos** de OpenStreetMap (más venues que Mapbox)
- ✅ **Flexibilidad total** para consultar cualquier tag de OSM
- ✅ **Actualizado por la comunidad** (datos frescos)

**Query ejemplo:**
```typescript
[out:json][timeout:90];
(
  node["amenity"](around:500,-12.0926,-77.0504);
  way["amenity"](around:500,-12.0926,-77.0504);
);
out center;
```

#### 2. Mapbox Geocoding API - Direcciones ↔ Coordenadas

**Uso principal:** Convertir direcciones a coordenadas y viceversa

```typescript
const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
  `?access_token=${mapboxToken}` +
  `&country=${normalizedCountry}` +           // Filtrar por país (PE, CO, etc)
  `&types=${typesParam}` +                    // Tipos: address, place, locality, etc
  `&language=es` +                           // Respuesta en español
  `&limit=5` +                               // Máximo 5 resultados
  `&proximity=${proximity[0]},${proximity[1]}`; // Priorizar por cercanía (opcional)
```

#### 2. Reverse Geocoding (Coordenadas → Dirección)

```typescript
const [lng, lat] = coords; // Array de coordenadas [longitud, latitud]
const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
  `access_token=${token}` +
  `&language=es` +
  `&limit=1` +
  `&types=address,place,locality`;
```

#### 3. Análisis de Venues por Coordenadas

```typescript
export async function analyzeVenues(
  propertyId: string,
  latitude: number,
  longitude: number,
  options: {
    radius?: number;  // Radio en metros (default: 1000)
    useCache?: boolean;
  }
): Promise<VenueAnalysisResult> {
  // Genera "MEGA QUERY" para Overpass API
  const megaQuery = generateMegaQuery(latitude, longitude);

  // Retorna venues categorizados por distancia
  return {
    property_id,
    latitude,
    longitude,
    radius_meters: radius,
    total_venues: allVenues.length,
    categories: {
      gastronomia, supermercados_tiendas, salud_bienestar,
      educacion, bancos, parques_areas_verdes, deportes,
      cultura_entretenimiento, transporte, veterinarias
    },
    venues: allVenues.sort((a, b) => a.distance - b.distance)
  };
}
```

#### 4. Batch de Coordenadas (Procesamiento Múltiple)

```typescript
// Procesar array de propiedades/pantallas con coordenadas
const bounds = new mapboxgl.LngLatBounds(); // Bounding box para zoom automático

properties.forEach((property) => {
  if (property.latitude && property.longitude) {
    // Extender bounds para incluir todas las coordenadas
    bounds.extend([property.longitude, property.latitude]);

    // Crear marker para cada coordenada
    const marker = new mapboxgl.Marker({ element: container })
      .setLngLat([property.longitude, property.latitude]) // [lng, lat]
      .addTo(map.current);
  }
});
```

### Formatos de Coordenadas Soportados

- **Mapbox/GeoJSON:** `[longitud, latitud]` → `[-77.0428, -12.0464]`
- **Base de Datos:** `{ lat: -12.0464, lon: -77.0428 }`
- **Feature Mapbox:** `{ center: [lng, lat], geometry: { coordinates: [lng, lat] } }`

### Categorías de Venues Analizadas

El sistema categoriza automáticamente los venues encontrados en 10 categorías principales:

1. **Gastronomía:** Restaurantes, cafés, bares, panaderías
2. **Supermercados/Tiendas:** Supermercados, malls, tiendas comerciales
3. **Salud/Bienestar:** Hospitales, clínicas, farmacias
4. **Educación:** Escuelas, colegios, universidades
5. **Bancos:** Bancos, cajeros automáticos
6. **Parques/Áreas Verdes:** Parques, jardines, plazas
7. **Deportes:** Gimnasios, centros deportivos
8. **Cultura/Entretenimiento:** Teatros, cines, museos
9. **Transporte:** Paradas de bus, estacionamientos
10. **Veterinarias:** Veterinarias, tiendas de mascotas

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Overpass API access (gratis, no requiere token)
- (Opcional) Mapbox Access Token para geocoding

### Installation

```bash
# Install dependencies
npm install

# Install TypeScript runtime para scripts
npm install -g tsx
```

### Probar el Sistema de Análisis

```bash
# Ejecutar análisis de una pantalla de prueba
npx tsx scripts/test-pantalla-1.ts
```

**Salida esperada:**
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  📊 PARTE 1: INTENSIDAD ABSOLUTA (Fuerza Comercial del Área)                        │
└──────────────────────────────────────────────────────────────────────────────────────┘

💪 Score de Intensidad: 31.8/100

┌──────────────────────────────────────────────────────────────────────────────────────┐
│  🎯 PARTE 2: PERFIL DOOH (Con Concentración Logarítmica)                            │
└──────────────────────────────────────────────────────────────────────────────────────┘

🏆 PERFIL PRIMARIO: DAILY_LIFE (20.8 pts, 31.4%)

┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ⚖️  PARTE 3: COMPARATIVA (Impacto de la Concentración Logarítmica)                  │
└──────────────────────────────────────────────────────────────────────────────────────┘

  PERFIL                       LINEAL      LOGARÍTMICO   DIFERENCIA
  daily_life                   55.0 pts    20.8 pts      -34.2 🔴
```

### Modo Auditoría (Para Desarrollo)

Para ver TODOS los venues encontrados sin filtros:

```typescript
// En scripts/test-pantalla-1.ts
const MODO_AUDITORIA = true;
```

Esto muestra:
- Top 50 venues más cercanos
- Tags de OpenStreetMap encontrados
- Distribución por zona
- Venues ANCLA detectados

### Probar con Tus Propias Coordenadas

Edita `scripts/test-pantalla-1.ts`:

```typescript
const PANTALLA = {
  nombre: 'Mi Pantalla - Ciudad',
  coordenadas: {
    lat: -12.0464,  // ← Tu latitud
    lng: -77.0428   // ← Tu longitud
  },
  radio: 500  // Radio en metros
};
```

### Adding Components (Para UI)

This project uses shadcn/ui for UI components. To add new components:

```bash
npx shadcn@latest add button
```

Components are placed in the `components` directory.

### Using Components

```tsx
import { Button } from "@/components/ui/button";
```

---

## 📁 Project Structure

```
tupantalla-asistente/
├── scripts/                # TypeScript scripts de análisis
│   └── test-pantalla-1.ts  # Script principal POC de análisis
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── search/         # Search-related components
│   │   └── property/       # Property-related components
│   ├── lib/                # Utility libraries
│   │   ├── venueAnalysis.ts        # Venue analysis logic
│   │   └── coordinateUtils.ts      # Coordinate utilities
│   ├── services/           # API services
│   │   └── propertyService.ts      # Property data service
│   └── utils/              # Utility functions
│       ├── mapbox.ts       # Mapbox API utilities
│       └── format.ts       # Formatting utilities
├── Brief de Producto y Técnico_ DOOH Smart Recommender.md
└── README.md
```

---

## 🛠️ Tech Stack

### Backend / Análisis
- **Runtime:** Node.js 18+ con TypeScript
- **Venue Data:** Overpass API (OpenStreetMap)
- **Geocoding:** Mapbox Geocoding API v5
- **Scripts:** tsx (TypeScript executor)

### Frontend (Futuro)
- **Framework:** Next.js 14 (App Router)
- **UI Library:** shadcn/ui + Chakra UI
- **Maps:** Mapbox GL JS
- **Database:** Supabase
- **Styling:** Tailwind CSS

---

## 📝 License

[Your License Here]
