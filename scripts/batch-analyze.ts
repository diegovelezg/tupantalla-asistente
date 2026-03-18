import { execSync } from 'child_process';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://unlboiebaoniophxoyeo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Iniciando Enriquecimiento Geoespacial Dinámico ---');
  
  // 1. Obtener todas las pantallas de la base de datos
  const { data: allPantallas, error } = await supabase
    .from('pantallas')
    .select('id, metadata_latitude, metadata_longitude');

  if (error || !allPantallas) {
    console.error('Error al obtener pantallas:', error);
    return;
  }

  // Selección aleatoria de 5 pantallas
  const pantallas = allPantallas.sort(() => 0.5 - Math.random()).slice(0, 5);
  console.log(`📺 Se seleccionaron ${pantallas.length} pantallas al azar para la prueba.`);

  const sqlFile = 'updates.sql';
  fs.writeFileSync(sqlFile, ''); // Limpiar archivo
  
  // 2. Agrupar por coordenadas para evitar llamadas duplicadas a Overpass
  const coordenadasUnicas = new Map<string, string[]>();
  for (const p of pantallas) {
    if (!p.metadata_latitude || !p.metadata_longitude) continue;
    
    const lat = p.metadata_latitude.toString().replace(',', '.').trim();
    const lng = p.metadata_longitude.toString().replace(',', '.').trim();
    
    if (lat === '0' || lng === '0' || !lat || !lng) continue;

    const key = `${lat}_${lng}`;
    if (!coordenadasUnicas.has(key)) coordenadasUnicas.set(key, []);
    coordenadasUnicas.get(key)!.push(p.id);
  }

  console.log(`📍 Ubicaciones únicas a procesar: ${coordenadasUnicas.size}`);

  let procesadas = 0;
  for (const [coordKey, ids] of coordenadasUnicas.entries()) {
    procesadas++;
    const [lat, lng] = coordKey.split('_');
    let retryCount = 0;
    let success = false;
    let data: any = null;

    console.log(`[${procesadas}/${coordenadasUnicas.size}] Ubicación [${lat}, ${lng}]...`);

    while (retryCount < 3 && !success) {
      try {
        const output = execSync(`npx tsx scripts/analyze-coords.ts "${lat}" "${lng}"`, { encoding: 'utf8' });
        data = JSON.parse(output);
        if (data.error) throw new Error(data.error);
        success = true;
      } catch (e: any) {
        retryCount++;
        console.error(`  ⚠️ Intento ${retryCount} fallido: ${e.message}`);
        if (retryCount < 3) await new Promise(r => setTimeout(r, 10000)); // Esperar 10s para reintento
      }
    }

    if (success && data) {
      for (const id of ids) {
        // SQL para pantallas_analisis
        const sql = `INSERT INTO public.pantallas_analisis (pantalla_id, perfil_primario, perfil_secundario, score_intensidad, scores_full_json, resumen_entorno, updated_at)
        VALUES ('${id}', '${data.perfil_primario}', '${data.perfil_secundario}', ${data.score_intensidad}, '${JSON.stringify(data.scores_full_json)}'::jsonb, '${JSON.stringify(data.resumen_entorno).replace(/'/g, "''")}'::jsonb, NOW())
        ON CONFLICT (pantalla_id) DO UPDATE SET 
          perfil_primario = EXCLUDED.perfil_primario,
          perfil_secundario = EXCLUDED.perfil_secundario,
          score_intensidad = EXCLUDED.score_intensidad,
          scores_full_json = EXCLUDED.scores_full_json,
          resumen_entorno = EXCLUDED.resumen_entorno,
          updated_at = NOW();\n`;
        fs.appendFileSync(sqlFile, sql);
      }
      console.log(`  ✅ OK (${ids.length} pantallas vinculadas)`);
    } else {
      console.error(`  ❌ Fallo definitivo en [${lat}, ${lng}]`);
    }
    
    // Pequeño delay para no saturar Overpass
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n--- Proceso Geoespacial Finalizado ---`);
  console.log(`📄 Archivo generado: ${sqlFile}`);
  console.log(`🚀 Siguiente paso: Ejecutar el SQL y luego scripts/generate-commercial-embeddings.ts`);
}

run();

