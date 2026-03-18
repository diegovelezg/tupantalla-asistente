# Plan de Implementación: Búsqueda Semántica Integral (Gemini Embeddings)

Este plan detalla la transición de una búsqueda basada en palabras clave (trigramas) a una búsqueda semántica profunda utilizando embeddings de 768 dimensiones con el modelo `gemini-embedding-001`.

## Objetivo
Capacitar al asistente para que recomiende pantallas basándose en la **intención comercial** del usuario (ej: "quiero anunciar una marca de lujo" o "busco zonas con alta afluencia de ejecutivos"), incluso si los términos exactos no están en los tags.

## Key Files & Context
- **Base de Datos**: `public.pantallas_analisis` (tabla base), `public.v_inventario_comercial` (vista de consulta).
- **Tablas de Inteligencia**: `public.config_perfiles_dooh` (ADN del perfil).
- **Nuevo Script**: `scripts/generate-commercial-embeddings.ts` (poblamiento de vectores).
- **Nueva Función**: `match_pantallas_comerciales` (RPC de búsqueda).

## Pasos de Implementación

### 1. Preparación de la Base de Datos
- Asegurar que la extensión `vector` esté activa.
- Confirmar la columna `embedding_comercial vector(768)` en `public.pantallas_analisis`.
- Crear un índice **HNSW** para búsquedas de alta velocidad por distancia de coseno.

### 2. Generación de Narrativa Comercial (Data Synthesis)
No se enviarán tags crudos al modelo. El script construirá una "historia" para cada pantalla uniendo:
- **Identidad**: Nombre y ubicación exacta.
- **Perfil Psicológico**: Mindset de la audiencia y perfiles (Primario/Secundario).
- **Valor de Negocio**: Clientes ideales, argumentos de venta y palabras clave.
- **Entorno Geoespacial**: Puntos de interés (anclas) detectados por el motor de análisis.

### 3. Script de Poblamiento (`scripts/generate-commercial-embeddings.ts`)
Desarrollar un script que:
1. Extraiga la data unificada de todas las tablas involucradas.
2. Formatee la "Narrativa Comercial" para cada pantalla.
3. Invoque a `gemini-embedding-001` mediante el SDK de Google Generative AI.
4. Actualice la tabla `pantallas_analisis` con los vectores generados.

### 4. Función de Búsqueda Semántica (RPC)
Crear una función en Postgres para ser llamada desde el cliente:
```sql
CREATE OR REPLACE FUNCTION match_pantallas_comerciales (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  pantalla_id text,
  nombre_pantalla text,
  targets_comerciales text,
  similitud float
)
...
```

## Verificación & Testing
- **Test 1 (Semántica Pura)**: Buscar "servicios financieros" y verificar que encuentre pantallas con perfiles "Bancario/Corporativo" aunque no tengan el tag exacto.
- **Test 2 (Intención)**: Buscar "padres con niños pequeños" y verificar que priorice zonas con anclas como "Nidos" o "Jugueterías".
- **Test 3 (Fuzzy)**: Validar que errores tipográficos mínimos no afecten el resultado gracias a la robustez del embedding.

## Rollback
- La vista `v_inventario_comercial` seguirá funcionando con búsquedas tradicionales si el campo de embedding está vacío.
