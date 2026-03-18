import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno Supabase no configuradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

// CONFIGURACIÓN: true = solo procesa vacíos, false = procesa todo
const ONLY_PROCESS_EMPTY = true; 

async function generateEmbeddings() {
    console.log(`--- Iniciando Generación Secuencial de Embeddings (1 a 1) ---`);
    console.log(`Modo: ${ONLY_PROCESS_EMPTY ? 'SOLO FILAS VACÍAS' : 'REPROCESAR TODO'}`);

    // 1. Obtener todas las narrativas desde el RPC
    const { data: pantallas, error } = await supabase.rpc('get_narrativas_comerciales');
    if (error) {
        console.error('❌ Error RPC:', error.message);
        return;
    }

    // 2. Filtrar por ID si ya tienen narrativa guardada (si el flag está activo)
    let aProcesar = pantallas;
    if (ONLY_PROCESS_EMPTY) {
        // Obtenemos los IDs que tienen análisis completo pero no tienen narrativa comercial aún
        const { data: candidatos } = await supabase
            .from('pantallas_analisis')
            .select('pantalla_id')
            .not('scores_full_json', 'is', null)
            .is('narrativa_comercial', null);
        
        const idsAceptados = new Set(candidatos?.map(p => p.pantalla_id) || []);
        aProcesar = pantallas.filter(p => idsAceptados.has(p.pantalla_id));
    }

    if (aProcesar.length === 0) {
        console.log('✅ No hay pantallas pendientes de procesar.');
        return;
    }

    console.log(`📺 Total a procesar: ${aProcesar.length} pantallas individualmente.`);

    // 3. Procesamiento estrictamente lineal
    for (const pantalla of aProcesar) {
        console.log(`\n✨ Procesando ID: ${pantalla.pantalla_id} | "${pantalla.product_title}"...`);

        try {
            // Generar embedding
            const response = await genAI.models.embedContent({
                model: 'gemini-embedding-001',
                contents: [pantalla.narrativa],
            });

            const embedding = response.embeddings[0].values.slice(0, 768);

            // Preparar payload para esta pantalla específica
            const payload = {
                pantalla_id: pantalla.pantalla_id,
                embedding_comercial: embedding,
                narrativa_comercial: pantalla.narrativa,
                updated_at: new Date().toISOString()
            };

            // Actualizar fila individual
            const { error: upsertError } = await supabase
                .from('pantallas_analisis')
                .upsert(payload, { onConflict: 'pantalla_id' });

            if (upsertError) {
                console.error(`  ❌ Error Supabase en ID ${pantalla.pantalla_id}:`, upsertError.message);
            } else {
                console.log(`  ✅ OK: Fila actualizada correctamente.`);
            }

        } catch (e: any) {
            console.error(`  ❌ Fallo en ID ${pantalla.pantalla_id}:`, e.message);
        }

        // Delay de seguridad entre llamadas
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n--- Proceso Finalizado ---');
}

generateEmbeddings();
