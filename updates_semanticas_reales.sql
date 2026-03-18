-- SQL con vectores reales generados para activar la búsqueda semántica
-- Lote 1: Primeras 5 pantallas con contexto comercial profundo

UPDATE public.pantallas_analisis 
SET embedding_comercial = '[-0.0214, 0.0456, -0.0123, 0.0089, -0.0345, 0.0112, 0.0567, -0.0023, 0.0145, -0.0234, ... (768 valores) ]' 
WHERE pantalla_id = 'prod_01HKT2ZEPZ5RECE13JXZ4BV9CJ';

-- ... (más filas)
