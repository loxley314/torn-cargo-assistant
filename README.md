# ✈️ Torn Travel Planner

Calculadora de viajes para **Torn City**: te dice **a qué hora despegar** para aterrizar en el
destino justo cuando el shop abroad hace **restock**.

Caso típico: *Shark Fin en Hawaii*. Vuelo de 1h29m, el shop restockea 1h después de quedarse
vacío y el stock aguanta 10–20 min. Como el vuelo es más largo que el ciclo del shop, el
resultado sorprende: **no puedes salir cuando queda 1h, tienes que calcularlo**.

Todo es parametrizable: destino, artículo, nivel de vuelo, tiempo de restock, duración del
stock, capacidad, coste y precio de venta. Funciona para cualquier país y artículo.

## Uso

Sin instalación ni build: abre `index.html` en el navegador, o publica la carpeta con
GitHub Pages.

```
index.html   interfaz
styles.css   estilos
app.js       lógica (sin dependencias)
```

1. **Ancla el shop**: cuando lo veas a **0**, pon qué día y a qué hora lo viste y deja
   *«Se ha quedado VACÍA»*. Es el dato más preciso que existe (el primer restock queda
   clavado, sin la incertidumbre de cuánto duró el stock).
2. Si viste el **restock**, usa *«Ha RESTOCKEADO»*: el cálculo sale con una horquilla
   (`16:38 – 16:48`) porque no sabemos cuánto tardará en vaciarse.
3. El hero te da la hora exacta de salida. La tabla muestra las siguientes ventanas y la
   línea de tiempo pinta vuelo + ventana de stock.

### Tiempo de vuelo por nivel

Los vuelos tienen cuatro velocidades según tus mejoras, más el *travel book*: **Standard,
Airstrip, WLT benefit y Business Class**, con y sin book. La app trae los tiempos del wiki
para los 11 destinos, así que basta con elegir destino + nivel y la duración se rellena sola
(Hawaii · Airstrip · sin book = 1h29m). Si tu personaje va distinto, puedes sobrescribir la
duración a mano.

### Cadencia de restock por artículo

Cada artículo restockea a su ritmo: Shark Fin a los 60 min, pero Xanax a los 120, otros a 15
o a 180. La app guarda la cadencia y la duración del stock **por artículo y país**, y las
resuelve con esta prioridad:

1. **Tus medidas** (si tienes 2 o más del mismo artículo).
2. **Referencia de la comunidad** (datos de TornW3B para el artículo más movido de cada país),
   solo para la cadencia.
3. **Valores por defecto** editables.

El botón «↺ datos del artículo» borra lo manual y vuelve a lo aprendido.

### Aprendizaje con tus observaciones

Pulsa **📌 Guardar esta observación** cada vez que mires el shop. Con dos anclas alternas
(vacía → restock) ya calcula la cadencia, y de (restock → vacía) saca cuánto aguanta el stock,
con su dispersión (p25–p75) para darte la horquilla.

El aprendizaje **separa por franja horaria**: los restocks de madrugada (hora europea) tardan
más en vaciarse, así que si eliges una hora de madrugada usa tus medidas de madrugada y, si
no las tienes, te avisa. Puedes anotar observaciones de días pasados con el selector de fecha.

### Importar datos de la comunidad

La API de TornW3B está detrás de Cloudflare y sin CORS, así que **no se puede leer desde la
web**. Como puente, abre <https://weav3r.dev/travel-stock>, en DevTools → Network busca la
petición `history/batch`, copia su respuesta y pégala en el desplegable de importación: la app
se queda con la cadencia y la duración de todos los artículos de una tacada.

### Comparador de artículos

Coste real de cada artículo del país (YATA) contra tu precio de venta, ordenado por
**beneficio por hueco de carga** — que es lo que manda cuando la capacidad es limitada: no
importa el artículo más caro, sino el que más rinde por hueco. Los precios de venta se guardan
en el navegador, así que solo se teclean una vez, y con la API key se pueden rellenar todos de
golpe desde `market_value`. El botón **usar** carga ese artículo en el cálculo de arriba.

Con **💵 Precios reales (listados)** la app consulta `market/itemmarket` (nivel *Public*)
artículo por artículo y usa **el precio más barato que hay a la venta**, que es lo que de verdad
te van a pagar, en lugar de la estimación de Torn. La columna **En venta** muestra las unidades
disponibles a ese precio: si son menos que tu capacidad, la app lo marca en rojo, porque no
podrás colocar toda la carga a ese precio.

### Calculadora de capacidad

La capacidad no es fija: depende del nivel de vuelo, la facción, la maleta, el *travel book*,
la compañía y si es **Tourism Day**. La calculadora reproduce las siete combinaciones de la
tabla del wiki con exactitud (43 → 86, 38 → 76, 33 → 66/61, 30 → 60, 28 → 56), incluido el
detalle de que el bonus de *Flower Shop / Toy Shop* no se dobla en Tourism Day. El *travel
book* es el mismo en el cálculo de capacidad y en el tiempo de vuelo, así que marcar la casilla
aplica las dos cosas.

### Aviso antes de salir

Activa **🔔 Avisarme antes de la salida** y elige con cuántos minutos de antelación. Cuando
llegue el momento: suena un pitido (Web Audio, sin ficheros externos), parpadea el título de la
pestaña, sale un aviso en pantalla y, si le das permiso, una **notificación del sistema** — útil
para dejarlo abierto mientras juegas. Funciona incluso con la pestaña en segundo plano (no con
ella cerrada) y no repite el aviso para la misma salida.

### Restock proyectado

Si importas los datos de la comunidad, la app guarda su `projectedRestockAt` y aparece el botón
**⚡ Usar restock proyectado**: ancla el cálculo en el próximo restock que estima TornW3B, sin
que tengas que mirar el shop.

### El modelo

```
salida    = restock − tiempo de vuelo − margen
restock₁  = ancla + cadencia del artículo      (modo «vacía»)
ciclo     = cadencia del artículo + duración del stock
```

La cadencia y la duración son **por artículo** (no globales): Shark Fin restockea a los 60 min
y aguanta ~10 min, pero Xanax tarda 120 min y otros artículos 15 o 180. Si tienes medidas
propias, la duración además cambia según la franja horaria del restock.

Si el vuelo dura más que un ciclo, el próximo restock es inalcanzable: la app salta
automáticamente a la siguiente ventana factible (por eso verás `V2`, `V3`…) y te avisa de que
salir ahora también podía servir (*«Si salís ahora aterrizás 16:13, 6m después del restock»*).

## Datos

- **Stock y precios abroad: [YATA](https://yata.yt/api/)** (`/api/v1/travel/export/`). Sin API
  key. Rellena el artículo y el coste real de cada país (Hawaii → Shark Fin, item 1485,
  `$20,603`). Es **crowdsourced y cacheado**: se actualiza cuando algún cliente verificado
  publica una lectura, así que puede llevar unos minutos de retraso.
- **Vuelo y precios de venta: [Torn API](https://www.torn.com/preferences.php#tab=api)**,
  opcional. Lee tu `time_left` actual para decirte si vas a llegar a tiempo, y el
  `market_value` de todos los artículos para ordenar el comparador.
- **Cadencia de restock: [TornW3B](https://weav3r.dev/travel-stock)**, importable a mano (ver
  arriba). Su API no se puede consultar desde el navegador.

### Qué nivel de API key necesitas

Según la tabla oficial de *Access Levels*:

| Selección | Para qué | Nivel |
|---|---|---|
| `torn/items` → `market_value` | precios de venta del comparador | **Public** |
| `market/itemmarket` → `listings` | precio real más barato + unidades en venta | **Public** |
| `user/travel` → `time_left` | saber si llegas a tiempo al restock | **Minimal Access** |
| `user/inventory` | (no se usa) | Limited Access |

Con una key **Public** (la que se genera por defecto) ya funcionan los precios; para el vuelo
hace falta **Minimal**. No hay nada hardcodeado: la key la pegas tú y se guarda en el
`localStorage` de tu navegador.

La API de Torn **no expone el stock de los shops abroad**, así que el restock siempre hay que
anclarlo a mano: no hay forma de automatizarlo.

Si pegas tu API key, usa la de **mínimo acceso** que necesites (no la de acceso completo) y no
la guardes en un ordenador compartido.

## Publicar en GitHub Pages

```bash
git init
git add index.html styles.css app.js README.md
git commit -m "Torn Travel Planner"
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
