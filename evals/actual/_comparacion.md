# Comparación: actual frente a baseline

Casos en actual: 15 · en baseline: 5. El baseline se corrió sin medidor de costo (n/d).

## Por caso

| Caso | Latencia (s) base → actual | Costo USD | Búsquedas | Fuentes | Citas (inválidas) | Investigación | Revisión | cifras | consis | conclu | huecos | mercad |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01-cafeteria-roma-norte | 20.7 → 63.6 | $0.236 | 5 | 23 | 5 (0) | ok | rewrite | 1→5 | 5→5 | 5→5 | 3→5 | 5→5 |
| 02-plantillas-notion | 14.2 → 51.5 | $0.231 | 5 | 20 | 6 (0) | ok | rewrite | 1→5 | 5→5 | 5→5 | 5→5 | 3→5 |
| 03-curso-ingles-ingenieros | 14.5 → 65.2 | $0.241 | 5 | 31 | 3 (0) | ok | rewrite | 1→4 | 5→5 | 5→5 | 5→5 | 5→5 |
| 04-comida-para-llevar-vaga | 11 → 68.3 | $0.241 | 5 | 17 | 12 (0) | ok | rewrite | 1→5 | 5→5 | 5→5 | 5→5 | 5→5 |
| 05-tienda-de-cassettes | 13.8 → 61.2 | $0.24 | 5 | 24 | 0 (0) | ok | rewrite | 1→1 | 5→5 | 5→5 | 5→5 | 5→5 |
| 06-taller-bicicletas-guadalajara | n/d → 177.1 | $0.247 | 5 | 26 | 0 (0) | ok | none | 1 | 5 | 5 | 5 | 5 |
| 07-saas-facturas-freelancers-mx | n/d → 55.8 | $0.231 | 5 | 23 | 6 (0) | ok | none | 4 | 5 | 5 | 5 | 5 |
| 08-foodtruck-bogota | n/d → 64 | $0.246 | 5 | 31 | 13 (0) | ok | rewrite | 5 | 5 | 5 | 5 | 5 |
| 09-ropa-sostenible-buenos-aires | n/d → 60.2 | $0.24 | 5 | 26 | 12 (0) | ok | failed | 5 | 5 | 5 | 5 | 5 |
| 10-consultoria-pymes-chile | n/d → 80.8 | $0.249 | 5 | 22 | 8 (0) | ok | rewrite | 4 | 4 | 5 | 4 | 5 |
| 11-turismo-rural-cusco | n/d → 56.8 | $0.233 | 5 | 10 | 3 (0) | ok | rewrite | 4 | 5 | 5 | 5 | 5 |
| 12-panaderia-existente-segunda-sucursal | n/d → 62.8 | $0.244 | 5 | 22 | 2 (0) | ok | rewrite | 5 | 5 | 5 | 5 | 5 |
| 13-app-vaga | n/d → 61.6 | $0.237 | 5 | 24 | 4 (0) | ok | rewrite | 4 | 5 | 5 | 5 | 5 |
| 14-tacos-latinos-houston | n/d → 83.3 | $0.268 | 5 | 26 | 6 (0) | ok | rewrite | 5 | 5 | 5 | 5 | 5 |
| 15-gadget-sin-demanda | n/d → 60.5 | $0.242 | 5 | 20 | 7 (0) | ok | rewrite | 5 | 5 | 5 | 5 | 5 |

## Promedios

| Métrica | Baseline (5 casos) | Actual, mismos 5 | Actual, todos |
|---|---|---|---|
| Latencia (s) | 14.84 | 61.96 | 71.513 |
| Costo USD | n/d | $0.238 | $0.242 |
| Búsquedas | n/d | 5 | 5 |
| Citas [F#] válidas | 0 | 5.2 | 5.8 |
| Juez · Cifras con fuente y fecha | 1 | 4 | 4.133 |
| Juez · Consistencia entre secciones | 5 | 5 | 4.933 |
| Juez · Las conclusiones siguen de los números | 5 | 5 | 5 |
| Juez · Huecos declarados | 4.6 | 5 | 4.933 |
| Juez · Mercado analizado = mercado objetivo | 4.6 | 5 | 5 |

Citas inválidas totales: 0 (debe ser 0).
