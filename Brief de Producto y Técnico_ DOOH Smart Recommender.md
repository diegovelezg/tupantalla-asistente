# **Brief de Producto: DOOH Smart Recommendation Engine**

## **1\. Descripción del Proyecto**

Este sistema transforma un listado estático de ubicaciones GPS de pantallas digitales (DOOH) en un motor de recomendación inteligente. Mediante el enriquecimiento geoespacial con Mapbox y el perfilamiento semántico, el sistema identifica el "mindset" de la audiencia en cada punto y sugiere anunciantes ideales, desde grandes corporaciones hasta negocios locales.

## **2\. Matriz Maestra de Perfilamiento (Inteligencia de Negocio)**

Esta matriz actúa como el "cerebro" del Chatbot. El LLM utiliza las **Keywords de Anamnesis** para categorizar al cliente, ejecuta una query SQL basada en el **ID de Perfil**, y construye el pitch usando el **Argumento Maestro**.

| Perfil (ID SQL) | Keywords de Anamnesis (Input) | Mindset / Contexto | Clientes Ideales (Marcas / Pros / Pymes) | Argumento Maestro (Pitch) |
| :--- | :--- | :--- | :--- | :--- |
| **Business / Executive** | Corporativo, B2B, finanzas, inversión, oficinas, gerentes, legal, software, networking. | Profesional, enfocado en productividad, toma de decisiones, alto poder adquisitivo. | **Marcas:** SaaS, Fintech, Real Estate, Aerolíneas, Autos Premium. <br> **Pros:** Estudios de abogados, contadores, headhunters. <br> **Pymes:** Coworkings, cafeterías, mensajería. | "Impacta a los tomadores de decisiones en su entorno de trabajo. Tu marca gana autoridad al estar rodeada de centros de poder y negocios." |
| **Daily Life / Household** | Familia, hogar, mascotas, farmacia, rutina, barrio, niños, limpieza, supermercado, reparaciones. | Pragmático, enfocado en resolución de necesidades diarias y bienestar del hogar. | **Marcas:** Consumo masivo (FMCG), Telcos, Seguros, Banca Retail. <br> **Pros:** Veterinarios, inmobiliarias, tutores. <br> **Pymes:** Panaderías, ferreterías, lavanderías. | "Conecta con la audiencia en su trayecto de compra cotidiano. Ideal para productos de necesidad inmediata y servicios de proximidad en zonas de alta densidad." |
| **High-End / Luxury** | Exclusivo, premium, estatus, lujo, arte, gourmet, inversión, moda, coleccionismo. | Aspiracional, busca gratificación, calidad excepcional y experiencias exclusivas. | **Marcas:** Relojería, Alta Joyería, Perfumes, Banca Privada, Inmobiliarias de Lujo. <br> **Pros:** Arquitectos, Wealth Management. <br> **Pymes:** Galerías de arte, vinerías boutique. | "Posiciona tu marca en un entorno de exclusividad y prestigio. Tu anuncio será visto por una audiencia selecta en momentos de ocio de alto nivel." |
| **Gen Z / Lifestyle** | Social, tendencia, gaming, música, universidad, moda, snacks, streaming, tecnología. | Conectado, busca gratificación instantánea, sensible a tendencias y experiencias sociales. | **Marcas:** Streaming, Gaming, Bebidas Energéticas, App Tech, Fast Fashion. <br> **Pros:** Academias de baile, tatuadores, influencers. <br> **Pymes:** Ropa vintage, escape rooms, bubble tea. | "Tu marca en el epicentro de la vida social y universitaria. Captura la atención de una audiencia joven y dinámica que dicta las tendencias del mañana." |
| **Health & Wellness** | Deporte, gimnasio, salud, bienestar, dieta, orgánico, prevención, cuidado, médico. | Consciente del cuerpo, enfocado en longevidad, prevención y mejora personal. | **Marcas:** Suplementos, Ropa Deportiva, Aseguradoras, Clínicas, Cuidado Personal. <br> **Pros:** Nutricionistas, psicólogos, fisioterapeutas. <br> **Pymes:** Centros de Yoga, tiendas orgánicas. | "Aparece cuando el usuario está activamente cuidando de sí mismo. Mindset de receptividad total hacia productos que promuevan una vida sana." |
| **Travel & Transit** | Turismo, viaje, hotel, transporte, movilidad, aeropuerto, vacaciones, mudanza, logística. | En movimiento, con necesidades de urgencia o planificación de ocio y logística. | **Marcas:** Hoteles, Plataformas de Viaje, Apps de Movilidad (Uber), Logística Global. <br> **Pros:** Asesores de visas, traductores. <br> **Pymes:** Taxis locales, parkings, tiendas de souvenirs. | "Captura el flujo de personas en transición. Ideal para marcas que ofrecen conveniencia, movilidad y soluciones para el viajero nacional e internacional." |

---

## **3\. Matriz de Datos Técnicos (Configuración Geoespacial)**

| Perfil DOOH | Venues (Mapbox / OSM Tags) para Query SQL |
| :--- | :--- |
| **Business** | **Mapbox:** bank, atm, business_center, office, government_office, townhall, courthouse, embassy, coworking_space, conference_centre. <br> **OSM:** office=*, amenity=bank, amenity=business_centre, amenity=townhall. |
| **Daily Life** | **Mapbox:** grocery, pharmacy, supermarket, laundry, convenience, bakery, butcher, hardware_store, beauty_salon, hairdresser, dentist, doctor. <br> **OSM:** shop=supermarket, shop=convenience, shop=bakery, shop=hardware, amenity=pharmacy, amenity=doctors. |
| **High-End** | **Mapbox:** jewelry, luxury_store, fine_dining, museum, art_gallery, boutique, antiques, wine_shop, perfumery, watch_store, golf_course, casino, spa. <br> **OSM:** shop=jewelry, shop=boutique, tourism=museum, tourism=art_gallery, amenity=casino, leisure=spa. |
| **Gen Z** | **Mapbox:** cafe, coffee_shop, fast_food, cinema, university, college, stadium, nightclub, bar, pub, video_games, tattoo, gaming_center, escape_room. <br> **OSM:** amenity=cafe, amenity=fast_food, amenity=cinema, amenity=university, amenity=nightclub, leisure=stadium, leisure=escape_room. |
| **Health** | **Mapbox:** gym, fitness_centre, sports_centre, park, hospital, clinic, yoga_studio, pilates_studio, health_food, swimming_pool, rehabilitation. <br> **OSM:** leisure=fitness_centre, leisure=sports_centre, leisure=park, amenity=hospital, amenity=clinic, shop=health_food. |
| **Travel** | **Mapbox:** airport, bus_station, train_station, gas_station, ev_station, hotel, motel, hostel, car_rental, taxi, parking, ferry_terminal, subway_station. <br> **OSM:** amenity=bus_station, amenity=fuel, amenity=parking, tourism=hotel, railway=station, aeroway=aerodrome. |

---

## **4\. Lógica Técnica y Algoritmos**

### **A. Enriquecimiento Geoespacial**

Para cada pantalla, se realiza una consulta radial a **Overpass API** (OpenStreetMap) que extrae **todos los venues** en un radio de 800m. Cada Venue encontrado recibe un peso basado en su zona de influencia:

* **Zona A (0 - 150m):** Impacto Directo (Peso 1.0).
* **Zona B (150m - 300m):** Influencia Próxima (Peso 0.5).
* **Zona C (300m - 400m):** Entorno Extendido (Peso 0.2).
* **Factor Ancla (400m - 800m):** Nodos de atracción masiva (Peso 0.3).

### **B. Sistema de Scoring (3 Métricas)**

1. **Intensidad Absoluta (0-100):** Medida lineal de fuerza comercial.
2. **Perfil DOOH (Concentración):** Score ajustado por `Math.pow(cantidad, 0.6)` para evitar la saturación de categorías dominantes.
3. **Índice Residencial (0-100):** Basado en la densidad de edificios `building=*` circundantes.

## **5\. Arquitectura del Chatbot (Flujo Híbrido)**

* **Paso 1 (Semántico):** El LLM realiza la **anamnesis** del cliente y lo clasifica en un **Perfil DOOH** usando las keywords de la matriz.
* **Paso 2 (Precisión SQL):** El sistema ejecuta una **Query SQL** exacta en la base de datos de pantallas (Filtro por Perfil + Intensidad).
* **Paso 3 (Pitch Persuasivo):** El LLM construye la respuesta integrando el **Argumento Maestro** con los datos reales encontrados (ej: "A 50m de Gold's Gym").

## **6\. Variables de Éxito (KPIs)**

* **Relevancia Comercial:** El anunciante siente que la pantalla está puesta "a medida".  
* **Eficiencia de Inventario:** Se venden pantallas que antes se consideraban "secundarias" al encontrarles un nicho específico.  
* **Escalabilidad:** El sistema puede procesar miles de puntos GPS sin intervención humana manual.
