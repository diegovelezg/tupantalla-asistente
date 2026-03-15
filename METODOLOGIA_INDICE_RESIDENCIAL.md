# 🏢 ÍNDICE RESIDENCIAL - Metodología Propuesta

## 🎯 Objetivo

Calcular la **densidad residencial** de la zona sin estimar población, usando la misma metodología que para Intensidad y Perfiles DOOH.

---

## 📊 Métrica 4: ÍNDICE RESIDENCIAL (0-100)

### Cálculo

```typescript
ÍndiceResidencial = (TotalEdificios / MáximoTeórico) × 100
```

**Máximo Teórico:** ~500 edificios en 400m (zona extremadamente densa)

### Interpretación

| Score | Interpretación |
|-------|----------------|
| 0-20 | Baja densidad residencial (zonas comerciales) |
| 20-40 | Densidad media (mezcla residencial/comercial) |
| 40-60 | Densidad alta (zonas residenciales) |
| 60-80 | Densidad muy alta (apartamentos) |
| 80-100 | Densidad extrema (torres de apartamentos) |

---

## 🏠 Tipo de Vivienda (Clasificación)

### Por Tipo de Edificio

```typescript
const TIPO_VIVIENDA = {
  apartments: 'Departamentos',      // Alta densidad
  residential: 'Residencial',       // Media densidad
  house: 'Casas',                  // Baja densidad
  dormitory: 'Residencia estudiantil',
  terrace: 'Casas en fila',
  flats: 'Departamentos'
}
```

### Score por Tipo

| Tipo | Peso | Descripción |
|------|------|-------------|
| **apartments** | 3.0 | Mayor densidad, más personas |
| **flats** | 2.5 | Alta densidad |
| **dormitory** | 2.0 | Residencia temporal |
| **terrace** | 1.5 | Media densidad |
| **residential** | 1.5 | Genérico |
| **house** | 1.0 | Baja densidad |

---

## 🧮 Cálculo del Score Residencial

```typescript
ScoreResidencial = Σ(TipoEdificio × PesoTipo) / MáximoTeórico × 100
```

### Ejemplo

```
Zona con 228 edificios:
  • 15 apartments:    15 × 3.0 = 45.0
  • 213 residential:  213 × 1.5 = 319.5
  • Total: 364.5

Índice Residencial = (364.5 / 1500) × 100 = 24.3/100
```

**Interpretación:** Densidad media-alta

---

## 📍 Clasificación del Entorno Residencial

### Perfiles Residenciales

| Perfil | Características | Tipos de edificios dominantes |
|--------|----------------|-------------------------------|
| **Condominios** | Alta densidad, apartments | apartments > 50% |
| **Barrio Mixto** | Residencial + comercial | mezcla equilibrada |
| **Zona Residencial** | Baja densidad, casas | house > 60% |
| **Estudiantil** | Dormitorios, universidades | dormitory > 30% |

---

## 📋 Output Propuesto

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  🏢 ÍNDICE RESIDENCIAL (Densidad Vivienda)                                        │
└──────────────────────────────────────────────────────────────────────────────────────┘

📊 Score Residencial: 45.6/100
   • 228 edificios en 400m
   • Densidad: ALTA
   • Tipo predominante: Departamentos (15) + Residencial (213)

📈 Distribución por tipo:
   apartments (15)       ███ 6.6%   × 3.0 = 45.0 pts
   residential (213)     ████████████ 93.4%   × 1.5 = 319.5 pts

   Total Score: 364.5 / 1500 = 24.3/100

🏠 Perfil Residencial: BARRIO MIXTO
   • Mezcla de departamentos y residencial
   • Densidad media-alta
   • Compatibilidad con Daily Life, Gen Z Lifestyle
```

---

## 🔧 Integración con Métricas Existentes

### 4 Métricas Finales

1. **Intensidad Absoluta (0-100)** - Fuerza comercial
2. **Perfil DOOH** - Mindset de audiencia
3. **Comparativa** - Impacto de concentración
4. **ÍNDICE RESIDENCIAL (0-100)** - ⭐ NUEVA ⭐

### Uso Comercial

**Para anunciantes:**
> "Zona con índice residencial de 45.6/100 (densidad media-alta). 228 edificios en el área de influencia inmediata. Mezcla de departamentos y vivienda residencial. Compatible con campañas de productos de consumo masivo."

**Para clasificación de pantallas:**
> "Pantallas con índice residencial > 40 son ideales para FMCG, retail y servicios recurrentes. Pantallas con índice < 20 son mejores para B2B y servicios profesionales."

---

## ✅ Ventajas de este Enfoque

1. **Sin sobre-optimismos** - No estimamos población
2. **Metodológicamente consistente** - Igual que otros scores
3. **Comparativo** - Se puede comparar entre pantallas
4. **Útil para ventas** - Da contexto sin inventar números
5. **Honesto** - Basado en datos reales de OSM

---

**Fecha:** 2026-03-15
**Métrica propuesta:** Índice Residencial (0-100)
**Basada en:** Conteo de edificios `building=*` en 400m
