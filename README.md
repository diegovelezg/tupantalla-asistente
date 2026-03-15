# Tupantalla Asistente - DOOH Smart Recommender

Sistema inteligente de recomendación de pantallas digitales (DOOH - Digital Out of Home) con enriquecimiento geoespacial y perfilado semántico de audiencias.

## 📋 Brief de Producto: DOOH Smart Recommendation Engine

### 1. Descripción del Proyecto

Este sistema transforma un listado estático de ubicaciones GPS de pantallas digitales (DOOH) en un motor de recomendación inteligente. Mediante el enriquecimiento geoespacial con Mapbox y el perfilamiento semántico, el sistema identifica el "mindset" de la audiencia en cada punto y sugiere anunciantes ideales, desde grandes corporaciones hasta negocios locales.

### 2. Matriz Maestra de Perfilamiento (Eje Central)

| Perfil DOOH | Venues (Mapbox Class/Type) | Mindset / Contexto | Marcas Grandes | Servicios Prof. | Pymes Locales |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Business / Executive** | office, bank, coworking, government | Profesional, toma de decisiones, B2B. | SaaS, Fintech, Real Estate, Aerolíneas. | Abogados, Contadores, Marketing. | Cafeterías, Copisterías. |
| **Daily Life / Household** | grocery, pharmacy, supermarket, laundry | Rutina, abastecimiento, pragmatismo. | FMCG, Telcos, Seguros, Banca. | Veterinarios, Inmobiliarias. | Panaderías, Ferreterías. |
| **High-End / Luxury** | jewelry, luxury_store, fine_dining, museum | Aspiracional, estatus, gratificación. | Relojería, Autos Premium, Perfumes. | Arquitectos, Wealth Management. | Galerías de Arte, Vinerías. |
| **Gen Z / Lifestyle** | cafe, fast_food, university, cinema, stadium | Social, tendencia, bajo dwell time. | Streaming, Gaming, Energéticas. | Tattoo, Academias, Influencers. | Ropa Vintage, Escape Rooms. |
| **Health & Wellness** | gym, hospital, park, doctor, sports_center | Cuidado personal, bienestar, prevención. | Suplementos, Athleisure, Salud. | Psicólogos, Nutricionistas. | Yoga/Pilates, Herbolarios. |
| **Travel & Transit** | airport, bus_station, gas_station, hotel | En movimiento, atención, urgencia. | Turismo, Uber/Cabify, Hoteles. | Traductores, Asesores de Visas. | Taxis, Souvenirs, Parkings. |

### 3. Lógica Técnica y Algoritmos

#### A. Enriquecimiento Geoespacial con Overpass API

Para cada pantalla, se realiza una consulta radial a **Overpass API** (OpenStreetMap) que extrae **todos los venues** en un radio de 500m. Cada Venue encontrado recibe un peso basado en su distancia:

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

**Solución:** Aplicamos **concentración logarítmica** usando `Math.log(cantidad + 1)`:

```typescript
ScorePerfil = Σ( log(cantidad_categoría + 1) × peso_perfil )
```

**Ejemplo:**
- 1 restaurante: `log(2) = 0.69` × peso = X
- 10 restaurantes: `log(11) = 2.40` × peso = 3.5X (no 10X)

La categoría con el score más alto se convierte en el **Perfil Primario**.

##### 3. COMPARATIVA (Lineal vs Logarítmico)

**Propósito:** Muestra el impacto de la corrección por concentración.

Muestra lado a lado:
- **Score Lineal:** Sin corrección (cantidad × peso)
- **Score Logarítmico:** Con corrección (Math.log × peso)
- **Diferencia:** Cuánto redujo la saturación

Esto permite validar que el algoritmo está funcionando correctamente.

#### C. Por Qué Funciona Este Enfoque

**1. Evita la Saturación**
- Sin corrección: 10 farmacias = 10x más peso que 1 farmacia
- Con logaritmo: 10 farmacias = 3.5x más peso (razón `log(11)/log(2)`)

**2. Captura Variedad y Cantidad**
- **Intensidad (0-100):** "¿Cuánta actividad comercial hay?"
- **Perfil:** "¿Qué tipo de audiencia predomina?"
- **Comparativa:** "¿Cuánto impacta la concentración?"

**3. Escalabilidad**
- Procesa cualquier coordenada GPS automáticamente
- No requiere clasificación manual del entorno
- Funciona consistentemente en cualquier país/ciudad

### 4. Flujo de Datos (Pipeline)

1. **Ingesta:** Carga de coordenadas GPS de las pantallas
2. **Enriquecimiento (Offline):** Consulta a Overpass API → Extracción de Venues → Cálculo de 3 Métricas (Intensidad + Perfil + Comparativa)
3. **Almacenamiento (DB):** Se guarda cada pantalla con:
   - Perfil primario y scores de todos los perfiles
   - Intensidad (0-100)
   - Distribución de categorías de venues
   - Lista de venues clave (ej. "Real Plaza Salaverry a 400m")
4. **Capa de Inteligencia (Chatbot):**
   - El usuario describe su negocio
   - El LLM clasifica el negocio en un **Perfil DOOH**
   - El sistema ejecuta una **Query SQL** exacta (Filtro por Perfil + Distrito + Intensidad mínima)
5. **Comunicación:** El bot genera un "Pitch" persuasivo usando los datos técnicos

### 5. 🔧 Parámetros Ajustables para Experimentación

El sistema está diseñado para permitir ajustes finos sin modificar la lógica central. Estos son los parámetros principales en el script:

#### A. Zonas de Influencia por Distancia

**Archivo:** `scripts/test-pantalla-1.ts`

```typescript
// Zona A (0-150m): Impacto Directo
const ZONA_A_PESO = 1.0;

// Zona B (150-300m): Influencia Próxima
const ZONA_B_PESO = 0.5;

// Zona C (300-400m): Entorno Extendido
const ZONA_C_PESO = 0.2;

// Factor Ancla (400-800m): Nodos de atracción masiva
const ZONA_ANCLA_PESO = 0.3;
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
