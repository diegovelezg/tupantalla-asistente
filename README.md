# Tupantalla Asistente - DOOH Smart Recommender

Sistema de recomendación de pantallas digitales (DOOH) potenciado por **Búsqueda Semántica Integral** y enriquecimiento geoespacial profundo.

## 🧠 El Nuevo Cerebro: Búsqueda Semántica Integral

El asistente ha evolucionado de una búsqueda basada en palabras clave exactas a un sistema que entiende la **intención comercial**. Utiliza embeddings de última generación para mapear la relación entre marcas y ubicaciones.

### 1. Metodología: Narrativa Comercial Enriquecida
En lugar de buscar etiquetas sueltas, el sistema genera una "historia" para cada pantalla antes de convertirla en un vector matemático. Esta narrativa amalgama:
*   **Identidad y Ubicación**: Contexto geográfico exacto.
*   **Perfil Psicológico**: El *mindset* de la audiencia (ej: "¿están de compras?" o "¿están trabajando?").
*   **Valor de Negocio (Generación de Afinidad)**: 
    *   Tras identificar los perfiles primarios y secundarios de la pantalla (vía scoring de venues), el sistema consulta una **Matriz de Clientes Ideales**.
    *   Esta matriz traduce categorías técnicas (ej: `amenity=bank`) en **negocios afines del mundo real** (ej: "Estudios de abogados, Coworkings, Fintechs").
    *   Esta lista de "negocios afines" se inyecta en la narrativa, permitiendo que una búsqueda de "oficinas contables" haga match semántico con una pantalla de perfil "Business" aunque no haya una oficina contable exacta detectada en el mapa.
*   **Argumentos Maestros**: Justificaciones de venta pre-configuradas para cada perfil.
*   **Entorno Vivo**: Puntos de interés (anclas) reales detectados vía Overpass API (OpenStreetMap).

---

## 🗺️ Enriquecimiento Geoespacial (The Data Engine)

El análisis de cada pantalla parte de su coordenada GPS exacta ("El Centro"). Desde este punto, el sistema evalúa el entorno en anillos concéntricos de influencia.

### 1. Sistema de Zonas y Distancia al Centro
La relevancia de un local o servicio está directamente ligada a su proximidad a la pantalla. Aplicamos pesos decrecientes para reflejar el impacto real en la audiencia:

| Zona | Radio (Distancia al Centro) | Peso | Significado Comercial |
| :--- | :--- | :--- | :--- |
| **Zona A** | **0 - 150m** | **1.0** | **Impacto Directo**: Audiencia con visibilidad inmediata y flujo peatonal primario. |
| **Zona B** | **150 - 300m** | **0.5** | **Influencia Próxima**: Área de influencia a 5 minutos caminando (buyer's journey). |
| **Zona C** | **300 - 400m** | **0.2** | **Entorno Extendido**: Contexto sociodemográfico y comercial general. |

### 2. Factor Ancla (Nodos de Atracción Masiva)
Existe una zona especial para infraestructuras que, a pesar de estar alejadas, actúan como imanes de audiencia que definen el perfil de la zona:

*   **Rango**: **400m - 800m**
*   **Peso**: **0.3**
*   **Venues Calificados**: Malls (`shop=mall`), Estadios, Terminales de Bus, Estaciones de Tren, Aeropuertos y Recintos Feriales.
*   **Propósito**: Capturar flujos masivos que una búsqueda radial estándar de 400m ignoraría.

### 3. Construcción del Perfil (Mindset)
El perfil se construye mediante una **Agregación Ponderada** y una corrección de **Concentración Exponencial**:

*   **Fórmula**: `Score Perfil = Σ(pesos_zona)^0.6 × peso_perfil`
*   **Factor `n^0.6`**: Este ajuste permite que tener 10 bancos en Zona A pese más que tener 1, pero no 10 veces más (pesa ~4 veces más). Esto garantiza que el perfil refleje la **variedad** comercial y no solo la acumulación de un solo tipo de local.

---

## 📊 Métricas de Análisis

### A. Intensidad Absoluta (0-100)
Mide la "fuerza comercial" total del área. Es una suma lineal ponderada que indica qué tan "viva" está la ubicación comercialmente, ideal para comparar el potencial de ventas entre pantallas.

### B. Afinidad de Perfil (%)
Indica la especialización de la pantalla. Una pantalla puede tener baja Intensidad comercial pero una **Afinidad de Lujo del 90%** si está rodeada exclusivamente de galerías de arte y boutiques.

---

## 📋 Arquitectura del Sistema

### Capa 1: Anamnesis Semántica (Input)
El sistema convierte la frase del usuario ("Quiero anunciar mi veterinaria") en un vector de 768 dimensiones que representa su intención comercial.

### Capa 2: Match Semántico (SQL RPC)
Calcula la distancia de coseno entre la intención del usuario y la narrativa enriquecida (que incluye los datos de proximidad y anclas) de cada pantalla.

### Capa 3: Pitch Persuasivo (Output)
Construye el argumento final integrando el **Argumento Maestro** del perfil con los datos reales encontrados (ej: "Ideal para tu marca ya que tienes un Centro Comercial Ancla a 600m").

---

## 🚀 Guía de Uso Rápido

### Analizar una Coordenada (JSON Output)
```bash
npx ts-node scripts/analyze-coords.ts -12.0915 -77.0369
```

### Generar/Actualizar Embeddings de Inventario
```bash
npx ts-node scripts/generate-commercial-embeddings.ts
```

### Tecnologías Clave
*   **AI**: Google Gemini (Embeddings `gemini-embedding-001`).
*   **Geo**: Overpass API (OSM) + Mapbox Taxonomy.
*   **DB**: Supabase + pgvector (HNSW Index).

---

## 📁 Estructura del Proyecto

```
tupantalla-asistente/
├── scripts/
│   ├── analyze-coords.ts        # Motor de análisis geoespacial real-time
│   ├── batch-analyze.ts         # Análisis masivo de inventario
│   └── generate-commercial-embeddings.ts  # Generación de vectores semánticos
├── conductor/
│   └── plan-busqueda-semantica.md  # Especificación técnica del sistema
└── README.md                    # Esta guía
```

---

## 📝 Licencia
Propiedad de Tupantalla.com - Todos los derechos reservados.
