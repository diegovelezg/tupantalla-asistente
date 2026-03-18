# Tupantalla Asistente - DOOH Smart Recommender

Sistema de recomendación de pantallas digitales (DOOH) potenciado por **Búsqueda Semántica Integral** y enriquecimiento geoespacial profundo.

## 🧠 El Nuevo Cerebro: Búsqueda Semántica Integral

El asistente ha evolucionado de una búsqueda basada en palabras clave exactas a un sistema que entiende la **intención comercial**. Utiliza embeddings de última generación para mapear la relación entre marcas y ubicaciones.

### 1. Metodología: Narrativa Comercial Enriquecida
En lugar de buscar etiquetas sueltas, el sistema genera una "historia" para cada pantalla antes de convertirla en un vector matemático. Esta narrativa amalgama:
*   **Identidad y Ubicación**: Contexto geográfico exacto.
*   **Perfil Psicológico**: El *mindset* de la audiencia (ej: "¿están de compras?" o "¿están trabajando?").
*   **Valor de Negocio**: Clientes ideales y argumentos de venta maestros.
*   **Entorno Vivo**: Puntos de interés (anclas) reales detectados vía Overpass API (OpenStreetMap).

**Ejemplo de Narrativa:**
> *"Pantalla Argentina Cdra 30 en Callao. Audiencia con mindset de 'Hogar y Ejecutivo'. Ideal para: Supermercados, Farmacias y Servicios B2B. Negocios cercanos: Plaza Vea, Inkafarma. Categorías: Retail, Salud."*

### 2. Infraestructura Técnica
*   **Modelo**: `gemini-embedding-001` (@google/genai).
*   **Vectores**: 768 dimensiones (truncado Matryoshka para máxima eficiencia y compatibilidad).
*   **Base de Datos**: Supabase (PostgreSQL) con la extensión `pgvector`.
*   **Índice**: HNSW (Hierarchical Navigable Small World) para búsquedas de alta velocidad por similitud de coseno.

---

## 📋 Arquitectura del Sistema

El sistema opera bajo un flujo de tres capas que garantiza precisión técnica y persuasión comercial:

### Capa 1: Anamnesis Semántica (Input)
*   **Input**: Lenguaje natural ("Quiero anunciar mi veterinaria").
*   **Acción**: El sistema convierte la frase del usuario en un vector de 768 dimensiones.
*   **Inteligencia**: Entiende que "perros", "mascotas" y "clínica veterinaria" son conceptos cercanos en el espacio vectorial.

### Capa 2: Match Semántico (SQL RPC)
*   **Función**: `match_pantallas_comerciales(query_embedding, threshold, count)`.
*   **Proceso**: Calcula la distancia de coseno entre la intención del usuario y la narrativa de cada pantalla.
*   **Ranking**: Devuelve las pantallas ordenadas por **Afinidad Conceptual**, no solo por coincidencia de texto.

### Capa 3: Pitch Persuasivo (Output)
*   **Acción**: El asistente construye el pitch final integrando el **Argumento Maestro** del perfil con los datos reales del entorno.
*   **Output**: *"Te sugiero esta pantalla porque, aunque no mencionaste 'bancos', tu perfil de cliente ejecutivo coincide con el entorno financiero de esta ubicación (Score 92/100)."*

---

## 🗺️ Enriquecimiento Geoespacial (The Data Engine)

Antes de la fase semántica, cada pantalla es analizada mediante un motor geoespacial propio:

### 1. Extracción vía Overpass API (OSM)
Analizamos un radio de hasta 800m alrededor de cada pantalla para detectar Venues clave (Bancos, Centros Comerciales, Gimnasios, etc.).

### 2. Sistema de Scoring Logarítmico
Para evitar la saturación (que 10 farmacias pesen 10 veces más que una), aplicamos una corrección logarítmica:
`Score = Σ( (cantidad^0.6) × peso_distancia )`

---

## 🚀 Guía de Uso Rápido

### Generar/Actualizar Embeddings
Si el inventario cambia, ejecuta el script de poblamiento:
```bash
npx ts-node scripts/generate-commercial-embeddings.ts
```

### Probar la Búsqueda en Supabase
```sql
SELECT * FROM match_pantallas_comerciales([TU_VECTOR], 0.5, 5);
```

### Tecnologías Clave
*   **Backend**: Node.js + TypeScript.
*   **AI**: Google Gemini (Embeddings).
*   **DB**: Supabase + pgvector.
*   **Geo**: Overpass API + Mapbox.

---

## 📁 Estructura del Proyecto

```
tupantalla-asistente/
├── scripts/
│   ├── generate-commercial-embeddings.ts  # CEREBRO: Generación de vectores Gemini
│   └── test-pantalla-1.ts                 # POC: Análisis geoespacial
├── src/
│   ├── lib/
│   │   ├── venueAnalysis.ts               # Lógica de extracción Overpass
│   │   └── coordinateUtils.ts             # Utilidades GPS
└── conductor/
    └── plan-busqueda-semantica.md         # Especificación técnica del sistema
```

---

## 📝 Licencia
Propiedad de Tupantalla.com - Todos los derechos reservados.
