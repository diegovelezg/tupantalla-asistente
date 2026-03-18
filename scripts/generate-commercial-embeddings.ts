import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://unlboiebaoniophxoyeo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración Gemini (@google/genai)
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateEmbeddings() {
    console.log('--- Iniciando Generación de Embeddings (gemini-embedding-001) ---');

    const { data: pantallas, error } = await supabase.rpc('get_narrativas_comerciales');
    if (error) {
        console.error('Error al obtener narrativas:', error);
        return;
    }

    console.log(`Procesando ${pantallas.length} pantallas...`);

    for (const pantalla of pantallas) {
        try {
            console.log(`Generando embedding para: ${pantalla.product_title}...`);
            
            // 1. Llamada exacta al modelo solicitado
            const response = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: pantalla.narrativa,
            });

            // 2. TRUNCADO MANUAL A 768 (Garantiza compatibilidad con Supabase)
            // Si el API devuelve 3072, tomamos los primeros 768 (Matryoshka)
            const fullVector = response.embeddings[0].values;
            const embedding = fullVector.slice(0, 768);

            if (embedding.length !== 768) {
                console.error(`Error de dimensiones: Obtenidos ${embedding.length} para ${pantalla.product_title}`);
                continue;
            }

            // 3. Actualización en DB
            const { error: updateError } = await supabase
                .from('pantallas_analisis')
                .update({ embedding_comercial: embedding })
                .eq('pantalla_id', pantalla.pantalla_id);

            if (updateError) {
                console.error(`Error Supabase [${pantalla.product_title}]:`, updateError.message);
            } else {
                console.log(`✓ ${pantalla.product_title} actualizado correctamente.`);
            }

        } catch (e: any) {
            console.error(`Fallo crítico en ${pantalla.product_title}:`, e.message);
        }
    }

    console.log('--- Proceso Finalizado con Éxito ---');
}

generateEmbeddings();
