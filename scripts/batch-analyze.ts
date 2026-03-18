import { execSync } from 'child_process';
import * as fs from 'fs';

const pantallas = [
  {"id":"prod_01JY4N99DKNDNZZKKY1M8AAZ2P","lat":"-12.130542","lng":"-77.019543"},
  {"id":"prod_01JD9ZH2JBWSPVQ89P78X33AT1","lat":"-12.06519","lng":"-77.01341"},
  {"id":"prod_01JBM432SERQFHVJNFJNTAKX7Y","lat":"-5.18713","lng":"-80.64133"},
  {"id":"prod_01JN6E2048TXXGKHYH8QF9YWZH","lat":"-12.145327","lng":"-76.98294"},
  {"id":"prod_01JN6E209GTXXGKHYH8QF9ZVQH","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01HKT2ZEP2J9ASFMMDRN46K8RD","lat":"-12.13142508","lng":"-76.97791517"},
  {"id":"prod_01JN6E20DKTXXGKHYH8QF9ZZPZ","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E216KTXYGKHYH8QF9ZZYG","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01HKT2ZF3NZHG7H5S6H3RB3V5D","lat":"-12.077725","lng":"-77.082797"},
  {"id":"prod_01HKT2ZF2SDX11FBW8F21NPBDC","lat":"-12.18012952","lng":"-76.94342364"},
  {"id":"prod_01HKT2ZES1FJJ81RAJZ6N3BGEG","lat":"-12.00813093","lng":"-77.06092696"},
  {"id":"prod_01HKT2ZFZGF51JCWYWV12WZX9D","lat":"-13.415817","lng":"-76.141949"},
  {"id":"prod_01HKT2ZG4RPFQ7K7880CPA4CWN","lat":"-8.13197","lng":"-79.03373"},
  {"id":"prod_01JRG9EJBP2ZKWSJWMBPSMSP29","lat":"-12.12555","lng":"-77.02147"},
  {"id":"prod_01HKT2ZF43V9M4F4F8DE38PGCX","lat":"-12.08942727","lng":"-77.01118285"},
  {"id":"prod_01JY4N998NG6T7JGFMH2KAZ6WM","lat":"-12.109182","lng":"-77.053067"},
  {"id":"prod_01JY4N9971K7D4KERFE22RD4GW","lat":"-12.109182","lng":"-77.053067"},
  {"id":"prod_01JY4N99A9VZBRRF7FGSF1X1ZJ","lat":"-12.117112","lng":"-77.028133"},
  {"id":"prod_01JY4N99CJ08DRR0CN4HB17MS2","lat":"-12.129311","lng":"-77.0239"},
  {"id":"prod_01JY4N99D2SSRKRVAWMY3JD2KB","lat":"-12.129311","lng":"-77.0239"},
  {"id":"prod_01JY4N999RHTP2G6HX2J82AW2Z","lat":"-12.107136","lng":"-77.027294"},
  {"id":"prod_01JBM432QD7V50XE1YTWX7D1D2","lat":"-13.5317","lng":"-71.96894"},
  {"id":"prod_01JRG9EJCY0V448C00JJX3R197","lat":"-12.04129","lng":" -76.93438"},
  {"id":"prod_01JN6E1F7G8XZ7QT3KYH8SF7W5","lat":"-12.001512","lng":"-76.987617"},
  {"id":"prod_01JN6E1F8SWVYHFQ7P4WZHZFWZ","lat":"-12.001512","lng":"-76.987617"},
  {"id":"prod_01JN6E1F9W5VYHFQ7P4WZHXL9B","lat":"-12.001512","lng":"-76.987617"},
  {"id":"prod_01JN6E1FA6P8XQKHYH8QF9RJV7","lat":"-12.147742","lng":"-76.98487"},
  {"id":"prod_01JN6E202C4TXXGKHYH8QF9YH8","lat":"-12.147742","lng":"-76.98487"},
  {"id":"prod_01JBM432R8TA7QK5YN8YE9JN86","lat":"-12.06856","lng":"-75.21047"},
  {"id":"prod_01JN6E206QTXXGKHYH8QF9ZKWH","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E207CTXXGKHYH8QF9ZRBH","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E20ACTXXGKHYH8QF9ZW5M","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E20BJTXXGKHYH8QF9ZXZ7","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E20CKTXXGKHYH8QF9ZYXB","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E20EKTXYGKHYH8QF9ZW7J","lat":"-12.207003","lng":"-76.96988"},
  {"id":"prod_01JN6E20GKTXYGKHYH8QF9ZXDN","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E205BTXXGKHYH8QF9ZPB4","lat":"-12.145327","lng":"-76.98294"},
  {"id":"prod_01JN6E20KKTXYGKHYH8QF9ZYK5","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E20MKTXYGKHYH8QF9ZZW6","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E20WKTXYGKHYH8QF9ZZZH","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E213KTXYGKHYH8QF9ZZYJ","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E217KTXYGKHYH8QF9ZZZ3","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E20VKTXYGKHYH8QF9ZZRN","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21CKTXYGKHYH8QF9ZZXP","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21FKTXYGKHYH8QF9ZZRK","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21GKTXYGKHYH8QF9ZZMC","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21RKTXYGKHYH8QF9ZZYD","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21SKTXYGKHYH8QF9ZZKM","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01JN6E21UKTXYGKHYH8QF9ZZY8","lat":"-12.08836","lng":"-77.00769"},
  {"id":"prod_01HKT2ZEY7YCZ17YQBN56BCMMH","lat":"-12.170112","lng":"-76.979918"},
  {"id":"prod_01HKT2ZFTN064MQ9RT0ZJK18DG","lat":"-12.0938156","lng":"-76.9630906"},
  {"id":"prod_01HKT2ZEZZ5AX3AAQF6SRATD98","lat":"-12.05685228","lng":"-76.96990331"},
  {"id":"prod_01HKT2ZEKT3551PNM94GHSMD4A","lat":"-12.06639456","lng":"-77.09749227"},
  {"id":"prod_01HKT2ZEGYP9WH7PXZ3JND85YV","lat":"-12.03412651","lng":"-77.01262057"},
  {"id":"prod_01HKT2ZEXBFHH07WQG2BECXHQ9","lat":"-12.0887778","lng":"-77.0105833"},
  {"id":"prod_01HKT2ZF1QCV59AYENQHYA38AJ","lat":"-12.09404148","lng":"-76.9674091"},
  {"id":"prod_01HKT2ZEKA2A007MEHJ0AZRRNK","lat":"-12.09177467","lng":"-76.95368894"},
  {"id":"prod_01HKT2ZF0DB346P1T2H4KJVDC6","lat":"-12.10982","lng":"-76.974636"},
  {"id":"prod_01HKT2ZF6S5TZMXMWYXAVPQT19","lat":"-12.092861","lng":"-77.053214"},
  {"id":"prod_01HKT2ZEHXERDEJRHAGZ8QQMFK","lat":"-12.15123654","lng":"-76.97832517"},
  {"id":"prod_01HKT2ZETJYJQ9TD01R06QCE0F","lat":"-12.09078889","lng":"-76.9510412"},
  {"id":"prod_01HKT2ZEMAVZXKFN8BNN42H74E","lat":"-12.057191","lng":"-76.970954"},
  {"id":"prod_01HKT2ZEXSFYN88DTWWCQMEBV4","lat":"-12.14987362","lng":"-76.98278411"},
  {"id":"prod_01HKT2ZF1957DFBCAQPSS83K62","lat":"-12.0842847","lng":"-76.9782108"},
  {"id":"prod_01HKT2ZEGGMDQTZS0RG0RC0GNP","lat":"-12.18137191","lng":"-77.01222802"},
  {"id":"prod_01HKT2ZEWDVEJV53CQJE223CF2","lat":"-12.10431117","lng":"-77.01876836"},
  {"id":"prod_01HKT2ZFG1ZX72S3XAYX9B7XB1","lat":"-12.09003 ","lng":"-77.05747"},
  {"id":"prod_01HKT2ZFEBFXHXRGF9N4JEN317","lat":"-12.085358","lng":"-76.986703"},
  {"id":"prod_01HKT2ZFQ6617297NVD99DRN6F","lat":"-12.10064","lng":"-76.99463"},
  {"id":"prod_01HKT2ZFT5G4WX5PBY5TJSEPGW","lat":"-13.43255","lng":"-76.13446"},
  {"id":"prod_01HKT2ZFKJZZYCC85VYPXC6WQY","lat":"-12.1098 ","lng":"-76.97511"},
  {"id":"prod_01HKT2ZF9E4PF0024QMZF6CB2P","lat":"-8.116222","lng":"-79.025944"},
  {"id":"prod_01HKT2ZFWV8V2JXW7704PVS67W","lat":"-12.087192","lng":"-76.973511"},
  {"id":"prod_01HKT2ZFS25G3XP969MWTJC5NC","lat":"-12.10194","lng":"-76.97028"},
  {"id":"prod_01HKT2ZF84ESX6B3B6GQ5KK9VZ","lat":"-12.049435","lng":"-77.109779"},
  {"id":"prod_01HKT2ZFYP4FEDD3Y3FZAA4FB6","lat":"-14.076538","lng":"-75.738313"},
  {"id":"prod_01HKT2ZG31RBVRTMSR6VCFBZMH","lat":"-12.053212","lng":"-75.225357"},
  {"id":"prod_01HKT2ZG1QRH2PBASRXDYNTGGP","lat":"-13.537660","lng":"-71.905650"},
  {"id":"prod_01HKN73RGFYEQKEPC8B4FDHVC5","lat":"-12.1133693","lng":"-77.0249175"},
  {"id":"prod_01HKN73RK6NXDSKYEZN5EGKSQ9","lat":"-12.099137","lng":"-76.979505"},
  {"id":"prod_01HKT2ZG60ZFW9SJ95HX90TFHT","lat":"-12,006140","lng":"-77.005616"},
  {"id":"prod_01HKT2ZG1A2R7YMGEPCR81FJ4S","lat":"-8.107362","lng":"-79.021919"},
  {"id":"prod_01HKT2ZG3YH9MNXMAKZN80653V","lat":"-3.7693802","lng":"-73.2761529"}
];

async function run() {
  const sqlFile = 'updates.sql';
  fs.writeFileSync(sqlFile, ''); // Limpiar archivo
  
  const coordenadasUnicas = new Map<string, string[]>();
  for (const p of pantallas) {
    const key = `${p.lat.replace(',', '.').trim()}_${p.lng.replace(',', '.').trim()}`;
    if (!coordenadasUnicas.has(key)) coordenadasUnicas.set(key, []);
    coordenadasUnicas.get(key)!.push(p.id);
  }

  console.log(`Ubicaciones únicas: ${coordenadasUnicas.size}`);

  for (const [coordKey, ids] of coordenadasUnicas.entries()) {
    const [lat, lng] = coordKey.split('_');
    let retryCount = 0;
    let success = false;
    let data: any = null;

    while (retryCount < 3 && !success) {
      try {
        console.log(`Ubicación [${lat}, ${lng}]...`);
        const output = execSync(`npx tsx scripts/analyze-coords.ts "${lat}" "${lng}"`, { encoding: 'utf8' });
        data = JSON.parse(output);
        if (data.error) throw new Error(data.error);
        success = true;
      } catch (e: any) {
        retryCount++;
        console.error(`  Error en ${lat},${lng}: ${e.message}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    if (success && data) {
      for (const id of ids) {
        const sql = `UPDATE public.pantallas_analisis SET 
          perfil_primario = '${data.perfil_primario}',
          perfil_secundario = '${data.perfil_secundario}',
          score_intensidad = ${data.score_intensidad},
          scores_full_json = '${JSON.stringify(data.scores_full_json)}'::jsonb,
          resumen_entorno = '${JSON.stringify(data.resumen_entorno).replace(/'/g, "''")}'::jsonb,
          updated_at = NOW()
          WHERE pantalla_id = '${id}';\n`;
        fs.appendFileSync(sqlFile, sql);
      }
      console.log(`  ✅ OK (${ids.length} pantallas)`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

run();
