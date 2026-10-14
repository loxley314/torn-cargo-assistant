'use strict';

/* ============================================================
   Textos de la interfaz. Añadir un idioma = añadir una clave
   aquí y un botón con bandera en el selector del header.
   ============================================================ */

const I18N = {
  es: {
    'app.name': 'Torn Cargo Assistant',
    'app.title': 'Torn Cargo Assistant · ¿A qué hora salgo para el restock?',
    'app.tagline': '¿A qué hora despego para aterrizar justo en el <b>restock</b> del shop?',
    'app.langLabel': 'Idioma',

    'params.title': 'Parámetros',
    'params.dest': 'Destino y artículo',
    'params.country': 'País (abroad)',
    'params.item': 'Artículo',
    'params.onlyProfitable': 'Solo los rentables',
    'params.customItem': '✎ Escribir otro artículo…',

    'yata.checking': 'Comprobando stock de la comunidad…',
    'yata.reload': '↻ Recargar stock del país',
    'yata.loading': 'Cargando stock de la comunidad…',
    'yata.noData': 'YATA no tiene datos de este país.',
    'yata.loaded': 'Stock de <b>{country}</b> vía YATA · última lectura de la comunidad hace <b>{age} min</b> · {count} artículos.',
    'yata.item': '{name}: <b>{qty}</b> uds a {cost}.',
    'yata.error': 'No pude leer YATA (<code>{msg}</code>). Podés poner el coste a mano.',

    'flight.title': 'Vuelo',
    'flight.tier': 'Nivel de vuelo',
    'flight.book': 'Con travel book',
    'flight.duration': 'Duración del vuelo',
    'flight.margin': 'Aterrizar antes o después del restock',
    'flight.formats': 'Formatos: 89 · 1h29m · 1:29',
    'flight.simple': '= {dur} ({min} min)',
    'flight.detail': '= <b>{dur}</b> ({min} min) · {country} · {tier}{book} · wiki: <b>{wiki}</b>{manual} · vuelo {cost}',
    'flight.changedManually': ' (lo has cambiado a mano)',
    'margin.onTime': 'justo en el restock',
    'margin.before': '{n} min <b>antes</b> del restock',
    'margin.after': '{n} min <b>después</b> del restock',

    'anchorHint.some': 'Ancla <b>{time}</b> (hace {ago}) · primer restock <b>{restock}</b>',
    'anchorHint.none': 'Elegí cuándo lo viste (vacío o recién restockeado) para anclar el cálculo.',
    'cycleHint.some': 'Ciclo completo: <b>{cycle}</b> (restock {delay} + stock ~{dur})',

    'shop.title': 'Shop y restock',
    'shop.mode': '¿Qué has visto?',
    'shop.modeEmpty': 'Se ha quedado VACÍA',
    'shop.modeRestock': 'Ha RESTOCKEADO',
    'shop.when': '¿Cuándo?',
    'shop.cadence': 'Tiempo hasta el restock',
    'shop.stockBetween': 'El stock dura <em>entre</em>',
    'shop.and': 'y',
    'shop.min': 'min',
    'shop.reset': '↺ datos del artículo',
    'shop.projected': '⚡ Usar restock proyectado ({time})',

    'chips.now': 'Ahora',

    'obs.saveBtn': '📌 Guardar esta observación',
    'obs.title': '📚 Mis observaciones (aprendizaje)',
    'obs.clearBtn': 'Borrar historial',

    'import.title': '⬇️ Importar datos de la comunidad (TornW3B)',
    'import.hint': 'Su API está detrás de Cloudflare, así que no se puede leer desde la web. Abre <code>weav3r.dev/travel-stock</code>, en DevTools → Network busca <code>history/batch</code>, copia la respuesta y pégala aquí: la app guarda la cadencia de restock y la duración del stock de cada artículo.',
    'import.go': 'Importar',
    'import.clearBtn': 'Borrar importado',

    'numbers.title': 'Números del viaje',
    'numbers.capacity': 'Artículos por viaje (capacidad)',
    'numbers.buyPrice': 'Coste por artículo (abroad)',
    'numbers.sellPrice': 'Precio de venta en Torn',
    'numbers.fee': 'Comisión de venta (%)',

    'cap.title': '🧳 Calculadora de capacidad (según el wiki)',
    'cap.base': 'Base: vuelo + facción + maleta',
    'cap.company': 'Compañía',
    'cap.companyNone': 'Ninguna',
    'cap.companyFlower': 'Flower Shop / Toy Shop (+5)',
    'cap.companyCruise': 'Cruise Line 10★ (+5)',
    'cap.companySmall': 'Lingerie 3★ o Cruise 3★ (+2)',
    'cap.tourism': 'Tourism Day (dobla la capacidad)',
    'cap.use': 'Usar este total',
    'cap.companyShort': 'compañía',
    'cap.hint': '{parts} = <b>{total}</b>{tourism} · Ahora llevas <b>{now}</b>.',
    'cap.hintTourism': ' · Tourism Day = <b>{grand}</b>{note}',
    'cap.hintNoDouble': ' (el bonus de Flower/Toy no se dobla)',

    'explain.title': '¿Cómo se calcula?',
    'explain.p1': 'Asumimos que el shop restockea <b>«tiempo hasta el restock»</b> después de quedarse a 0 (y, como el stock siempre vuela, el ciclo completo es <code>restock + duración del stock</code>). Para aterrizar justo en el restock:',
    'explain.formula': 'salida = restock − duración del vuelo − margen',
    'explain.p2': 'Ancla el cálculo justo cuando veas la tienda a 0: es el dato más preciso que existe (el primer restock queda clavado, sin la incertidumbre de cuánto ha durado el stock).',

    'results.title': 'Próximos restocks',
    'alarm.on': '🔔 Aviso activado',
    'alarm.off': '🔔 Avisarme antes de la salida',
    'alarm.leadA': 'Avisar',
    'alarm.leadB': 'min antes',
    'alarm.hint': 'Te aviso <b>{lead} min</b> antes de la hora de salida. Deja la pestaña abierta.',

    'cmp.title': 'Comparar artículos del país',
    'cmp.hint': 'Coste real de cada artículo del país (YATA) contra tu precio de venta. Se ordena por <b>beneficio por hueco de carga</b>, que es lo que manda cuando la capacidad es limitada: no importa el artículo más caro, sino el que más rinde por hueco.',
    'cmp.apiBtn': '↻ Valores de mercado (API)',
    'cmp.listingsBtn': '💵 Precios reales (listados)',
    'cmp.shopsBtn': '🏪 Shops de la ciudad (API)',
    'cmp.headCityShop': 'Shop ciudad',
    'cmp.cityShopTitle': '{shop} · {stock} en stock',
    'cmp.shopsLoading': 'Consultando los shops de la ciudad…',
    'cmp.shopsUpdated': 'Shops de la ciudad: <b>{n}</b> artículos indexados de {shops} tiendas.',
    'cmp.shopsError': 'No pude leer los shops: <code>{msg}</code>. Necesitás una API key (nivel Public basta).',
    'cmp.clearBtn': 'Borrar precios guardados',
    'cmp.note': '«Stock leído» viene de YATA y puede estar desfasado. Los precios de venta se guardan en este navegador, así que solo hay que teclearlos una vez.',

    'api.title': 'Opcional · conectar con la API de Torn',
    'api.hint': 'La API de Torn <b>no</b> expone el stock de los shops abroad, así que el restock siempre hay que anclarlo a mano. Lo que sí puede hacer es leer <b>tu vuelo actual</b> (<code>time_left</code>) para decirte si vas a llegar a tiempo, darte el <b>valor de mercado</b> de un artículo y mirar los <b>shops de la ciudad</b>.',
    'api.keyLabel': 'API key (deja el scope mínimo: <em>Public</em> o <em>Minimal</em>)',
    'api.remember': 'Recordar en este navegador',
    'api.travelBtn': 'Consultar mi vuelo',
    'api.priceBtn': 'Sugerir precio de venta',
    'api.warn': '⚠️ La key viaja desde tu navegador directamente a <code>api.torn.com</code> y (si la marcas) se guarda en el <code>localStorage</code> de este sitio. No la uses en un PC compartido ni con una key de acceso completo.',

    'footer.sources': 'Todas las horas son de tu reloj local. ⏱ Datos de stock y precios abroad: <a href="https://yata.yt/" target="_blank" rel="noopener">YATA</a> (crowdsourced) · vuelo y precios: <a href="https://api.torn.com" target="_blank" rel="noopener">Torn API</a> · cadencia de restock: <a href="https://weav3r.dev/travel-stock" target="_blank" rel="noopener">TornW3B</a> · capacidades: <a href="https://wiki.torn.com/wiki/Travel" target="_blank" rel="noopener">wiki de Torn</a>.',
    'footer.disclaimer': 'Herramienta de fan sin relación con Torn City. Si mueves los parámetros (tiempo de vuelo, restock, duración del stock) el cálculo sigue valiendo para cualquier destino y artículo.',

    'time.tomorrow': 'mañana',
    'time.yesterday': 'ayer',

    'err.flight': 'duración del vuelo',
    'err.restock': 'tiempo hasta el restock',
    'err.anchor': 'hora del ancla',
    'hero.errors': 'Completá <b>{list}</b> para calcular la hora de salida.',
    'hero.noCycles': 'Sin restocks proyectados en las próximas {h} h.',
    'hero.departLabel': 'Despegá a las',
    'hero.in': 'en',
    'hero.land': 'Aterrizas',
    'hero.restock': 'Restock',
    'hero.stockUntil': 'Stock hasta',
    'hero.flightMargin': 'Vuelo + margen',
    'hero.ifLeaveNow': 'Si salís ya',
    'hero.objective': '🎯 Objetivo: ciclo <b>V{n}</b>, {waitNote}.',
    'hero.waitRange': 'llegando al restock más temprano esperarías hasta <b>{d}</b> si tarda en caer',
    'hero.waitExact': 'el primer restock queda clavado',

    'run.in': '🚨 <b>Si salís ahora</b> aterrizás {at}, {since} después del restock de las {restock}. Con un stock que dura {min}–{max} <b>todavía lo pillás</b>.',
    'run.maybe': '⚠️ <b>Si salís ahora</b> aterrizás {at}, {since} después del restock. El stock puede estar ya agotado: empieza a ser lotería.',
    'run.early': '🧳 <b>Si salís ahora</b> aterrizás {at} y el próximo restock es a las {restock}: esperarías {wait} en el destino. La salida óptima es a las {depart}.',

    'warn.oldAnchor': '📌 El ancla es de hace <b>{age}</b>: cada ciclo arrastra la incertidumbre del stock (±{spread} por ciclo). Reanclá el shop a 0 cuando puedas.',
    'warn.nextCycle': '⏳ El próximo restock ya no es alcanzable saliendo después de ahora; esta es la ventana <b>V{n}</b>.',

    'table.noWindows': 'Sin ventanas que mostrar.',
    'table.headRestock': 'Restock',
    'table.headDepart': 'Salir',
    'table.headWait': 'Espera máx.',
    'table.headStockEnd': 'Stock hasta',
    'table.badgeLeave': 'salir',
    'table.badgePast': 'pasada',
    'table.note': '«Stock hasta» es el peor caso (el stock aguanta {dur} desde el restock). Anclando el shop a 0 la primera fila queda exacta; las siguientes arrastran la horquilla.',

    'tl.title': 'Línea de tiempo',
    'tl.restock': 'restock',
    'tl.legend': 'Azul = vuelo · Ámbar = stock disponible estimado · Rojo = ahora.',

    'num.complete': 'Completá los parámetros.',
    'num.capacity': 'Capacidad',
    'num.items': '{n} items',
    'num.invest': 'Inversión',
    'num.income': 'Ingreso',
    'num.profitTrip': 'Beneficio / viaje',
    'num.profitHour': 'Beneficio / hora',
    'num.roundTrip': 'Ida y vuelta',
    'num.note': '{fee}, cada viaje cuesta {invest} y rinde {profit}. «Beneficio/hora» cuenta solo el vuelo de ida y vuelta.',
    'num.withFee': 'Con un {fee}% de comisión',
    'num.noFee': 'Sin comisión',
    'num.needSell': 'Poné el <b>precio de venta en Torn</b> (item market o bazaar) para ver el beneficio. El coste abroad lo rellena el stock de YATA.',

    'badge.manual': 'manual',
    'badge.mine': 'tus datos',
    'badge.comm': 'referencia',
    'badge.default': 'defecto',
    'timings.pickItem': 'Elegí un artículo para ver su cadencia de restock.',
    'timings.cadence': 'cadencia <b>{v}</b> {badge}',
    'timings.stock': 'stock <b>{v}</b>{range} {badge}',
    'timings.noteCadence1': '{n} medida tuya de cadencia',
    'timings.noteCadenceN': '{n} medidas tuyas de cadencia',
    'timings.noteDuration': '{n} de duración',
    'timings.noteNeed': 'con {n} ya las uso yo',
    'timings.noteCommunity': 'comunidad: {bits} ({samples} muestras, {conf}% fiabilidad)',
    'timings.noteBands': 'de <b>madrugada</b> aguanta {night} y de día {day} (tus datos)',
    'timings.usingBand': 'usando tu media de {band}',
    'band.noche': 'madrugada',
    'band.dia': 'día',

    'obs.summarySome': 'Tienes <b>{total}</b> observaciones guardadas{ofItem}.',
    'obs.noneOfItem': ' (ninguna de este artículo)',
    'obs.ofItem': ', <b>{n}</b> de este artículo',
    'obs.summaryNone': 'Anota lo que ves en el shop y la app aprende la cadencia y lo que aguanta el stock. Con dos anclas del mismo artículo ya saca datos.',
    'obs.statCadence': 'Cadencia medida',
    'obs.statStock': 'Aguanta el stock',
    'obs.statNight': 'Madrugada',
    'obs.statDay': 'Día',
    'obs.needTwo': 'Con dos anclas alternas del mismo artículo (vacía → restock) ya se calcula la cadencia.',
    'obs.headTime': 'Hora',
    'obs.headItem': 'Artículo',
    'obs.headState': 'Estado',
    'obs.stateEmpty': 'vacío',
    'obs.stateRestock': 'restock',
    'obs.needData': 'Necesito un artículo y una hora de ancla para guardar la observación.',
    'obs.alreadySaved': 'Esa observación ya estaba guardada.',
    'obs.saved': 'Guardada: <b>{item}</b> {state} a las {time}.',
    'obs.stateEmptyLong': 'vacío',
    'obs.stateRestockLong': 'restockeado',

    'import.badJson': 'No pude leerlo como JSON: copia la respuesta completa de la petición.',
    'import.noAnalyses': 'No encuentro el bloque "analyses" en ese JSON.',
    'import.noItems': 'El JSON no traía artículos reconocibles (formato "país-itemId").',
    'import.ok': 'Importados <b>{n}</b> artículos. Ahora la cadencia y el stock salen de esos datos si no tienes medidas propias.',
    'import.cleared': 'Datos importados borrados.',

    'cmp.noStock': 'Sin stock cargado para este país: usá «Recargar stock del país».',
    'cmp.summaryBest': '<b>{name}</b> en {country}: {perSlot} por hueco, {perTrip} llenando {capacity} huecos.{missing}',
    'cmp.missing': ' Faltan {n} precios de venta.',
    'cmp.summaryNone': 'Poné un precio de venta (o cargá los valores de mercado con tu API key) para ver el ranking de {country}.',
    'cmp.headItem': 'Artículo',
    'cmp.headCost': 'Coste',
    'cmp.headSell': 'Venta',
    'cmp.headPerSlot': 'Beneficio/hueco',
    'cmp.headPerTrip': 'Beneficio/viaje',
    'cmp.headOnSale': 'En venta',
    'cmp.headStockRead': 'Stock leído',
    'cmp.useBtn': 'usar',
    'cmp.usedItem': '{name} cargado en el cálculo de arriba.',
    'cmp.units': '{n} uds',
    'cmp.loadingPrices': 'Buscando valores de mercado…',
    'cmp.pricesUpdated': 'Actualizados <b>{n}</b> precios de mercado desde la API de Torn.',
    'cmp.pricesField': '(usé el campo <code>{field}</code>)',
    'cmp.pricesError': 'No pude cargar los precios: <code>{msg}</code>. Necesitás una API key en «Opcional · conectar con la API de Torn».',
    'cmp.listingsNoStock': 'Cargá el stock de un país primero.',
    'cmp.listingsLoading': 'Consultando listados… {i}/{total}',
    'cmp.listingsUpdated': 'Listados actualizados en <b>{ok}</b> artículos{fail}.',
    'cmp.listingsFail': ', {n} sin datos',
    'cmp.listingsError': 'No pude leer los listados: <code>{msg}</code>. Necesitás una API key (nivel Public basta).',
    'cmp.noData': 'sin datos',
    'cmp.cleared': 'Precios de venta guardados borrados.',

    'api.querying': 'Consultando…',
    'api.notFlying': 'No estás volando ahora mismo.',
    'api.flight': 'Vuelo a <b>{dest}</b> · {left} · aterrizás <b>{arrival}</b>',
    'api.left': 'quedan <b>{d}</b>',
    'api.in': '✅ Llegás <b>{since}</b> después del restock: estás dentro de la ventana de stock.',
    'api.maybe': '⚠️ Llegás <b>{since}</b> después del restock: puede que ya esté agotado.',
    'api.early': '🧳 Aterrizás antes: el próximo restock es a las <b>{restock}</b>, esperarías {wait}.',
    'api.far': 'No hay restocks proyectados en ese tramo.',
    'api.error': 'Error: <code>{msg}</code>',
    'api.searching': 'Buscando valores de mercado…',
    'api.updated': 'Actualizados <b>{n}</b> precios de mercado. Mirá el comparador de artículos.',

    'torn.noKey': 'Falta la API key',
    'torn.badResponse': 'respuesta inesperada',
    'torn.noMarketValue': 'la API no devolvió valor de mercado (claves: {top} · artículo: {keys})',

    'alarm.flash': '⏰ ¡Hora de salir!',
    'alarm.late': '¡Se te pasa! La salida para {item}{country} ya venció.',
    'alarm.soon': 'Salida para {item}{country} en <b>{left}</b>{restock}.',
    'alarm.country': ' en {country}',
    'alarm.restock': ' · restock {time}',
    'alarm.itemFallback': 'tu artículo',
    'alarm.notifTitle': 'Torn Cargo Assistant',
  },

  en: {
    'app.name': 'Torn Cargo Assistant',
    'app.title': 'Torn Cargo Assistant · When should I leave for the restock?',
    'app.tagline': 'What time do I take off to land right on the shop <b>restock</b>?',
    'app.langLabel': 'Language',

    'params.title': 'Settings',
    'params.dest': 'Destination and item',
    'params.country': 'Country (abroad)',
    'params.item': 'Item',
    'params.onlyProfitable': 'Only profitable ones',
    'params.customItem': '✎ Type another item…',

    'yata.checking': 'Checking community stock…',
    'yata.reload': '↻ Reload country stock',
    'yata.loading': 'Loading community stock…',
    'yata.noData': 'YATA has no data for this country.',
    'yata.loaded': '<b>{country}</b> stock via YATA · last community reading <b>{age} min</b> ago · {count} items.',
    'yata.item': '{name}: <b>{qty}</b> units at {cost}.',
    'yata.error': 'Could not read YATA (<code>{msg}</code>). You can type the cost by hand.',

    'flight.title': 'Flight',
    'flight.tier': 'Flight tier',
    'flight.book': 'With travel book',
    'flight.duration': 'Flight time',
    'flight.margin': 'Land before or after the restock',
    'flight.formats': 'Formats: 89 · 1h29m · 1:29',
    'flight.simple': '= {dur} ({min} min)',
    'flight.detail': '= <b>{dur}</b> ({min} min) · {country} · {tier}{book} · wiki: <b>{wiki}</b>{manual} · flight {cost}',
    'flight.changedManually': ' (you changed it by hand)',
    'margin.onTime': 'right on the restock',
    'margin.before': '{n} min <b>before</b> the restock',
    'margin.after': '{n} min <b>after</b> the restock',

    'anchorHint.some': 'Anchor <b>{time}</b> ({ago} ago) · first restock <b>{restock}</b>',
    'anchorHint.none': 'Pick when you saw it (empty or freshly restocked) to anchor the calculation.',
    'cycleHint.some': 'Full cycle: <b>{cycle}</b> (restock {delay} + stock ~{dur})',

    'shop.title': 'Shop and restock',
    'shop.mode': 'What did you see?',
    'shop.modeEmpty': 'It went OUT OF STOCK',
    'shop.modeRestock': 'It RESTOCKED',
    'shop.when': 'When?',
    'shop.cadence': 'Time until restock',
    'shop.stockBetween': 'Stock lasts <em>between</em>',
    'shop.and': 'and',
    'shop.min': 'min',
    'shop.reset': '↺ item data',
    'shop.projected': '⚡ Use projected restock ({time})',

    'chips.now': 'Now',

    'obs.saveBtn': '📌 Save this observation',
    'obs.title': '📚 My observations (learning)',
    'obs.clearBtn': 'Clear history',

    'import.title': '⬇️ Import community data (TornW3B)',
    'import.hint': 'Their API sits behind Cloudflare, so it cannot be read from the web. Open <code>weav3r.dev/travel-stock</code>, in DevTools → Network find <code>history/batch</code>, copy the response and paste it here: the app keeps the restock cadence and stock duration for every item.',
    'import.go': 'Import',
    'import.clearBtn': 'Clear imported',

    'numbers.title': 'Trip numbers',
    'numbers.capacity': 'Items per trip (capacity)',
    'numbers.buyPrice': 'Cost per item (abroad)',
    'numbers.sellPrice': 'Sale price in Torn',
    'numbers.fee': 'Sale fee (%)',

    'cap.title': '🧳 Capacity calculator (per the wiki)',
    'cap.base': 'Base: flight + faction + suitcase',
    'cap.company': 'Company',
    'cap.companyNone': 'None',
    'cap.companyFlower': 'Flower Shop / Toy Shop (+5)',
    'cap.companyCruise': 'Cruise Line 10★ (+5)',
    'cap.companySmall': 'Lingerie 3★ or Cruise 3★ (+2)',
    'cap.tourism': 'Tourism Day (doubles capacity)',
    'cap.use': 'Use this total',
    'cap.companyShort': 'company bonus',
    'cap.hint': '{parts} = <b>{total}</b>{tourism} · You carry <b>{now}</b> now.',
    'cap.hintTourism': ' · Tourism Day = <b>{grand}</b>{note}',
    'cap.hintNoDouble': ' (the Flower/Toy bonus is not doubled)',

    'explain.title': 'How is this calculated?',
    'explain.p1': 'We assume the shop restocks <b>«time until restock»</b> after hitting zero (and since stock always flies, the full cycle is <code>restock + stock duration</code>). To land exactly on the restock:',
    'explain.formula': 'departure = restock − flight time − margin',
    'explain.p2': 'Anchor the calculation the moment you see the shop at 0: that is the most precise data available (the first restock is exact, with no uncertainty about how long the stock lasted).',

    'results.title': 'Upcoming restocks',
    'alarm.on': '🔔 Alert armed',
    'alarm.off': '🔔 Alert me before departure',
    'alarm.leadA': 'Alert',
    'alarm.leadB': 'min before',
    'alarm.hint': 'I will alert you <b>{lead} min</b> before departure time. Keep the tab open.',

    'cmp.title': 'Compare items in the country',
    'cmp.hint': 'Real cost of every item in the country (YATA) against your sale price. Sorted by <b>profit per cargo slot</b>, which is what matters when capacity is limited: the most expensive item is not the point, the one that pays best per slot is.',
    'cmp.apiBtn': '↻ Market values (API)',
    'cmp.listingsBtn': '💵 Real prices (listings)',
    'cmp.shopsBtn': '🏪 City shops (API)',
    'cmp.headCityShop': 'City shop',
    'cmp.cityShopTitle': '{shop} · {stock} in stock',
    'cmp.shopsLoading': 'Checking city shops…',
    'cmp.shopsUpdated': 'City shops: <b>{n}</b> items indexed from {shops} stores.',
    'cmp.shopsError': 'Could not read the shops: <code>{msg}</code>. You need an API key (Public level is enough).',
    'cmp.clearBtn': 'Clear saved prices',
    'cmp.note': '«Stock read» comes from YATA and may be stale. Sale prices are stored in this browser, so you only have to type them once.',

    'api.title': 'Optional · connect to the Torn API',
    'api.hint': 'The Torn API does <b>not</b> expose abroad shop stock, so the restock always has to be anchored by hand. What it can do is read <b>your current flight</b> (<code>time_left</code>) to tell you whether you will make it, give you an item\'s <b>market value</b> and look at the <b>city shops</b>.',
    'api.keyLabel': 'API key (keep the lowest scope: <em>Public</em> or <em>Minimal</em>)',
    'api.remember': 'Remember in this browser',
    'api.travelBtn': 'Check my flight',
    'api.priceBtn': 'Suggest sale price',
    'api.warn': '⚠️ The key travels from your browser straight to <code>api.torn.com</code> and (if you tick the box) is stored in this site\'s <code>localStorage</code>. Do not use it on a shared PC or with a full-access key.',

    'footer.sources': 'All times are in your local clock. ⏱ Stock and abroad prices: <a href="https://yata.yt/" target="_blank" rel="noopener">YATA</a> (crowdsourced) · flight and prices: <a href="https://api.torn.com" target="_blank" rel="noopener">Torn API</a> · restock cadence: <a href="https://weav3r.dev/travel-stock" target="_blank" rel="noopener">TornW3B</a> · capacities: <a href="https://wiki.torn.com/wiki/Travel" target="_blank" rel="noopener">Torn wiki</a>.',
    'footer.disclaimer': 'Fan-made tool, not affiliated with Torn City. Change the parameters (flight time, restock, stock duration) and the maths still works for any destination and item.',

    'time.tomorrow': 'tomorrow',
    'time.yesterday': 'yesterday',

    'err.flight': 'flight time',
    'err.restock': 'time until restock',
    'err.anchor': 'anchor time',
    'hero.errors': 'Fill in <b>{list}</b> to work out the departure time.',
    'hero.noCycles': 'No restocks projected in the next {h} h.',
    'hero.departLabel': 'Take off at',
    'hero.in': 'in',
    'hero.land': 'You land',
    'hero.restock': 'Restock',
    'hero.stockUntil': 'Stock until',
    'hero.flightMargin': 'Flight + margin',
    'hero.ifLeaveNow': 'If you leave now',
    'hero.objective': '🎯 Target: cycle <b>V{n}</b>, {waitNote}.',
    'hero.waitRange': 'arriving at the earliest restock you may wait up to <b>{d}</b> if it takes a while',
    'hero.waitExact': 'the first restock is spot on',

    'run.in': '🚨 <b>If you leave now</b> you land {at}, {since} after the {restock} restock. With stock lasting {min}–{max} <b>you can still grab it</b>.',
    'run.maybe': '⚠️ <b>If you leave now</b> you land {at}, {since} after the restock. Stock may already be gone: it is a lottery now.',
    'run.early': '🧳 <b>If you leave now</b> you land {at} and the next restock is at {restock}: you would wait {wait} at the destination. The best departure is {depart}.',

    'warn.oldAnchor': '📌 The anchor is <b>{age}</b> old: every cycle drags the stock uncertainty (±{spread} per cycle). Re-anchor the shop at 0 when you can.',
    'warn.nextCycle': '⏳ The next restock is no longer reachable by leaving after now; this is window <b>V{n}</b>.',

    'table.noWindows': 'No windows to show.',
    'table.headRestock': 'Restock',
    'table.headDepart': 'Leave',
    'table.headWait': 'Max wait',
    'table.headStockEnd': 'Stock until',
    'table.badgeLeave': 'go',
    'table.badgePast': 'past',
    'table.note': '«Stock until» is the worst case (stock lasts {dur} from the restock). Anchoring the shop at 0 makes the first row exact; the following ones carry the spread.',

    'tl.title': 'Timeline',
    'tl.restock': 'restock',
    'tl.legend': 'Blue = flight · Amber = estimated stock available · Red = now.',

    'num.complete': 'Fill in the settings.',
    'num.capacity': 'Capacity',
    'num.items': '{n} items',
    'num.invest': 'Investment',
    'num.income': 'Income',
    'num.profitTrip': 'Profit / trip',
    'num.profitHour': 'Profit / hour',
    'num.roundTrip': 'Round trip',
    'num.note': '{fee}, each trip costs {invest} and returns {profit}. «Profit/hour» counts the round trip only.',
    'num.withFee': 'With a {fee}% fee',
    'num.noFee': 'With no fee',
    'num.needSell': 'Enter the <b>sale price in Torn</b> (item market or bazaar) to see the profit. The abroad cost is filled in from YATA stock.',

    'badge.manual': 'manual',
    'badge.mine': 'your data',
    'badge.comm': 'reference',
    'badge.default': 'default',
    'timings.pickItem': 'Pick an item to see its restock cadence.',
    'timings.cadence': 'cadence <b>{v}</b> {badge}',
    'timings.stock': 'stock <b>{v}</b>{range} {badge}',
    'timings.noteCadence1': '{n} measurement of yours for cadence',
    'timings.noteCadenceN': '{n} measurements of yours for cadence',
    'timings.noteDuration': '{n} for duration',
    'timings.noteNeed': 'with {n} I will use them',
    'timings.noteCommunity': 'community: {bits} ({samples} samples, {conf}% reliability)',
    'timings.noteBands': 'during the <b>small hours</b> it lasts {night} and {day} during the day (your data)',
    'timings.usingBand': 'using your {band} average',
    'band.noche': 'small-hours',
    'band.dia': 'daytime',

    'obs.summarySome': 'You have <b>{total}</b> saved observations{ofItem}.',
    'obs.noneOfItem': ' (none for this item)',
    'obs.ofItem': ', <b>{n}</b> for this item',
    'obs.summaryNone': 'Log what you see in the shop and the app learns the cadence and how long stock lasts. Two anchors of the same item are enough.',
    'obs.statCadence': 'Measured cadence',
    'obs.statStock': 'Stock lasts',
    'obs.statNight': 'Small hours',
    'obs.statDay': 'Daytime',
    'obs.needTwo': 'Two alternating anchors of the same item (out → restock) already give you the cadence.',
    'obs.headTime': 'Time',
    'obs.headItem': 'Item',
    'obs.headState': 'State',
    'obs.stateEmpty': 'out',
    'obs.stateRestock': 'restock',
    'obs.needData': 'I need an item and an anchor time to save the observation.',
    'obs.alreadySaved': 'That observation was already saved.',
    'obs.saved': 'Saved: <b>{item}</b> {state} at {time}.',
    'obs.stateEmptyLong': 'out of stock',
    'obs.stateRestockLong': 'restocked',

    'import.badJson': 'Could not read it as JSON: copy the full response of the request.',
    'import.noAnalyses': 'I cannot find the "analyses" block in that JSON.',
    'import.noItems': 'The JSON had no recognisable items (format "country-itemId").',
    'import.ok': 'Imported <b>{n}</b> items. Cadence and stock now come from that data unless you have your own measurements.',
    'import.cleared': 'Imported data cleared.',

    'cmp.noStock': 'No stock loaded for this country: use «Reload country stock».',
    'cmp.summaryBest': '<b>{name}</b> in {country}: {perSlot} per slot, {perTrip} filling {capacity} slots.{missing}',
    'cmp.missing': ' {n} sale prices missing.',
    'cmp.summaryNone': 'Enter a sale price (or load market values with your API key) to see the {country} ranking.',
    'cmp.headItem': 'Item',
    'cmp.headCost': 'Cost',
    'cmp.headSell': 'Sale',
    'cmp.headPerSlot': 'Profit/slot',
    'cmp.headPerTrip': 'Profit/trip',
    'cmp.headOnSale': 'On sale',
    'cmp.headStockRead': 'Stock read',
    'cmp.useBtn': 'use',
    'cmp.usedItem': '{name} loaded into the calculation above.',
    'cmp.units': '{n} units',
    'cmp.loadingPrices': 'Fetching market values…',
    'cmp.pricesUpdated': 'Updated <b>{n}</b> market values from the Torn API.',
    'cmp.pricesField': '(used the <code>{field}</code> field)',
    'cmp.pricesError': 'Could not load prices: <code>{msg}</code>. You need an API key in «Optional · connect to the Torn API».',
    'cmp.listingsNoStock': 'Load a country\'s stock first.',
    'cmp.listingsLoading': 'Checking listings… {i}/{total}',
    'cmp.listingsUpdated': 'Listings updated for <b>{ok}</b> items{fail}.',
    'cmp.listingsFail': ', {n} with no data',
    'cmp.listingsError': 'Could not read the listings: <code>{msg}</code>. You need an API key (Public level is enough).',
    'cmp.noData': 'no data',
    'cmp.cleared': 'Saved sale prices cleared.',

    'api.querying': 'Checking…',
    'api.notFlying': 'You are not flying right now.',
    'api.flight': 'Flight to <b>{dest}</b> · {left} · you land <b>{arrival}</b>',
    'api.left': '<b>{d}</b> left',
    'api.in': '✅ You land <b>{since}</b> after the restock: you are inside the stock window.',
    'api.maybe': '⚠️ You land <b>{since}</b> after the restock: it may already be gone.',
    'api.early': '🧳 You land early: the next restock is at <b>{restock}</b>, you would wait {wait}.',
    'api.far': 'No restocks projected in that stretch.',
    'api.error': 'Error: <code>{msg}</code>',
    'api.searching': 'Fetching market values…',
    'api.updated': 'Updated <b>{n}</b> market values. Check the item comparator.',

    'torn.noKey': 'API key missing',
    'torn.badResponse': 'unexpected response',
    'torn.noMarketValue': 'the API returned no market value (keys: {top} · item: {keys})',

    'alarm.flash': '⏰ Time to leave!',
    'alarm.late': 'You are late! Departure for {item}{country} has already gone.',
    'alarm.soon': 'Departure for {item}{country} in <b>{left}</b>{restock}.',
    'alarm.country': ' in {country}',
    'alarm.restock': ' · restock {time}',
    'alarm.itemFallback': 'your item',
    'alarm.notifTitle': 'Torn Cargo Assistant',
  },
};

const LOCALES = { es: 'es-ES', en: 'en-GB' };
const LANG_KEY = 'torn-cargo-assistant:lang';

let lang = 'es';

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
  } catch { /* ignorar */ }
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return I18N[nav] ? nav : 'en';
}

/** t('clave', {var: valor}) — con respaldo al inglés si falta la traducción */
function t(key, vars) {
  const table = I18N[lang] || I18N.en;
  let s = table[key] ?? I18N.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      s = s.split(`{${name}}`).join(value);
    }
  }
  return s;
}

const locale = () => LOCALES[lang] || 'en-GB';

/** aplica los textos del HTML a los nodos con data-i18n* */
function applyStatic(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  for (const el of root.querySelectorAll('[data-i18n-ph]')) {
    el.placeholder = t(el.dataset.i18nPh);
  }
  for (const el of root.querySelectorAll('[data-i18n-title]')) {
    el.title = t(el.dataset.i18nTitle);
  }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  }
  document.documentElement.lang = lang;
}

function setLang(next, { persist = true } = {}) {
  if (!I18N[next]) return;
  lang = next;
  if (persist) {
    try { localStorage.setItem(LANG_KEY, next); } catch { /* ignorar */ }
  }
  document.title = t('app.title');
  applyStatic();
}
