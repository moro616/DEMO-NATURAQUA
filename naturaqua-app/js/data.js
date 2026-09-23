/* =========================================================
   Naturaqua · Datos de ejemplo de la demo
   Todo lo de acá es inventado. Precios y zonas se pueden
   cambiar libremente sin tocar el resto de la app.
   ========================================================= */

const NEGOCIO = {
  nombre: 'Naturaqua',
  planta: { nombre: 'Planta Naturaqua', lat: -32.7505, lng: -60.7445 },
  repartidor: 'Carlos',
};

const PRODUCTOS = {
  b20: { nombre: 'Bidón 20 L', corto: 'bidón 20L', plural: 'bidones 20L', precio: 5500 },
  b12: { nombre: 'Bidón 12 L', corto: 'bidón 12L', plural: 'bidones 12L', precio: 4200 },
  sif: { nombre: 'Sifón 1,5 L', corto: 'sifón', plural: 'sifones', precio: 1600 },
};

// día: 1 = lunes ... 6 = sábado
const ZONAS = [
  { id: 'norte', nombre: 'Zona Norte', dia: 1, color: '#7B61C9', lat: -32.822, lng: -60.716 },
  { id: 'ricardone', nombre: 'Ricardone', dia: 2, color: '#1A8FA8', lat: -32.772, lng: -60.782 },
  { id: 'sanlorenzo', nombre: 'San Lorenzo', dia: 3, color: '#3E9B5A', lat: -32.745, lng: -60.737 },
  { id: 'beltran', nombre: 'Fray Luis Beltrán', dia: 4, color: '#D9822B', lat: -32.790, lng: -60.728 },
  { id: 'psm', nombre: 'Puerto San Martín', dia: 5, color: '#C94F7C', lat: -32.715, lng: -60.733 },
  { id: 'timbues', nombre: 'Timbúes', dia: 6, color: '#4A6FA5', lat: -32.671, lng: -60.790 },
];

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const CALLES = {
  norte: ['Av. San Lorenzo', 'Sarmiento', 'Pellegrini', 'Italia', 'Brown', 'Alvear', 'Lamadrid', 'Castelli'],
  ricardone: ['Av. Libertad', 'San Martín', 'Belgrano', 'Mitre', 'Rivadavia', 'Sgto. Cabral', 'Moreno', 'Güemes'],
  sanlorenzo: ['Av. San Martín', 'Dorrego', 'Urquiza', 'Sgto. Cabral', 'Rivadavia', 'Belgrano', 'Moreno', 'J. B. Alberdi', 'Bv. Urquiza'],
  beltran: ['San Martín', 'Mitre', 'Sarmiento', 'Dorrego', 'Av. Ruta 11', 'España', 'Salta'],
  psm: ['Av. Dorrego', 'San Martín', 'Irigoyen', 'Pte. Perón', 'Mitre', 'Brown', 'Belgrano'],
  timbues: ['San Martín', 'Belgrano', 'Av. Libertad', 'Rivadavia', 'Sarmiento', 'Moreno'],
};

const NOMBRES = [
  'Juan Pérez', 'María López', 'Pedro Gómez', 'Ana Díaz', 'Carlos Romero', 'Lucía Fernández', 'Jorge Benítez',
  'Silvia Acosta', 'Raúl Medina', 'Graciela Sosa', 'Martín Herrera', 'Claudia Ruiz', 'Diego Castro', 'Patricia Molina',
  'Sergio Ortiz', 'Mónica Giménez', 'Fernando Rojas', 'Laura Aguirre', 'Gustavo Peralta', 'Andrea Ríos',
  'Héctor Suárez', 'Verónica Luna', 'Ricardo Vega', 'Natalia Correa', 'Oscar Méndez', 'Carina Figueroa',
  'Pablo Cabrera', 'Susana Paz', 'Walter Domínguez', 'Romina Ledesma', 'Daniel Vera', 'Cecilia Quiroga',
  'Hugo Navarro', 'Florencia Ramos', 'Alberto Ferreyra', 'Gabriela Torres', 'Luis Maldonado', 'Marta Blanco',
  'Rubén Ibarra', 'Paola Villalba', 'Eduardo Godoy', 'Sandra Cáceres', 'Marcelo Juárez', 'Valeria Arias',
  'Esteban Ponce', 'Alicia Mansilla', 'Gerardo Pereyra', 'Noemí Vázquez', 'Cristian Farías', 'Liliana Coria',
];

const COMERCIOS = [
  'Almacén Don Tito', 'Taller Mecánico Ríos', 'Estudio Contable Ferro', 'Gimnasio Fuerza', 'Panadería La Espiga',
  'Kiosco El Paso', 'Consultorio Dra. Vidal', 'Ferretería Central',
];

const OBSERVACIONES = [
  'Dejar en el portón', 'Llamar antes de llegar', 'Timbre no anda, golpear', 'Perro suelto, avisar',
  'Entregar en el local (horario comercio)', 'Si no está, dejar con la vecina del 2°', 'Pagar siempre por transferencia',
  '', '', '', '', '',
];

const MODELOS_DISP = [
  { modelo: 'Frío/Calor de pie', mensualidad: 9500 },
  { modelo: 'Frío/Calor de mesada', mensualidad: 8000 },
  { modelo: 'Natural de mesada', mensualidad: 5500 },
];

const STOCK_INICIAL = [
  { id: 's1', nombre: 'Bidones 20 L llenos', cat: 'Envases', unidad: 'u', actual: 186, minimo: 120 },
  { id: 's2', nombre: 'Bidones 20 L vacíos', cat: 'Envases', unidad: 'u', actual: 94, minimo: 40 },
  { id: 's3', nombre: 'Bidones 12 L llenos', cat: 'Envases', unidad: 'u', actual: 48, minimo: 40 },
  { id: 's4', nombre: 'Sifones llenos', cat: 'Envases', unidad: 'u', actual: 310, minimo: 200 },
  { id: 's5', nombre: 'Sifones vacíos', cat: 'Envases', unidad: 'u', actual: 140, minimo: 60 },
  { id: 's6', nombre: 'Tapas de bidón', cat: 'Envases', unidad: 'u', actual: 150, minimo: 200 },
  { id: 's7', nombre: 'Válvulas de sifón', cat: 'Repuestos', unidad: 'u', actual: 64, minimo: 30 },
  { id: 's8', nombre: 'Picos de dispenser', cat: 'Repuestos', unidad: 'u', actual: 12, minimo: 10 },
  { id: 's9', nombre: 'Filtros de dispenser', cat: 'Repuestos', unidad: 'u', actual: 3, minimo: 6 },
  { id: 's10', nombre: 'Hipoclorito de sodio', cat: 'Limpieza', unidad: 'L', actual: 42, minimo: 20 },
  { id: 's11', nombre: 'Desinfectante', cat: 'Limpieza', unidad: 'L', actual: 8, minimo: 10 },
  { id: 's12', nombre: 'Detergente industrial', cat: 'Limpieza', unidad: 'L', actual: 25, minimo: 15 },
  { id: 's13', nombre: 'Sanitizante', cat: 'Limpieza', unidad: 'L', actual: 18, minimo: 10 },
  { id: 's14', nombre: 'Precintos de seguridad', cat: 'Insumos', unidad: 'u', actual: 300, minimo: 500 },
  { id: 's15', nombre: 'Etiquetas Naturaqua', cat: 'Insumos', unidad: 'u', actual: 1200, minimo: 500 },
  { id: 's16', nombre: 'Cajas para sifones', cat: 'Insumos', unidad: 'u', actual: 85, minimo: 50 },
  { id: 's17', nombre: 'Garrafas de CO₂', cat: 'Insumos', unidad: 'u', actual: 4, minimo: 2 },
];

const PLANTILLAS_INICIALES = [
  {
    id: 'reparto', titulo: 'Aviso de reparto',
    texto: 'Hola {nombre} 👋\nMañana estaremos realizando el reparto por tu zona.\nTu pedido habitual es de {pedido}.\n¿Querés agregar algo más?\n\nNaturaqua 💧',
  },
  {
    id: 'deuda', titulo: 'Recordatorio de pago',
    texto: 'Hola {nombre}, te recordamos que tenés pendiente el pago de {deuda} correspondiente a tus últimas entregas.\nPodés abonar al repartidor o por transferencia.\n\n¡Gracias! Naturaqua 💧',
  },
  {
    id: 'dispenser', titulo: 'Mensualidad del dispenser',
    texto: 'Hola {nombre} 👋\nTe recordamos que la mensualidad de tu dispenser ({mensualidad}) vence el {vence}.\n\nNaturaqua 💧',
  },
  {
    id: 'ausente', titulo: 'No te encontramos',
    texto: 'Hola {nombre}, hoy pasamos con tu pedido pero no te encontramos 😕\n¿Querés que volvamos más tarde o lo dejamos para el próximo reparto?\n\nNaturaqua 💧',
  },
];

/* ---------- Generador determinístico (siempre los mismos datos) ---------- */
function crearRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function generarDatos(hoy) {
  const rnd = crearRng(20260923);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const porZona = { norte: 8, ricardone: 9, sanlorenzo: 11, beltran: 8, psm: 8, timbues: 6 };
  const clientes = [];
  let n = 0;
  let comercioIdx = 0;

  ZONAS.forEach((z) => {
    for (let i = 0; i < porZona[z.id]; i++) {
      n++;
      const esComercio = rnd() < 0.15 && comercioIdx < COMERCIOS.length;
      const nombre = esComercio ? COMERCIOS[comercioIdx++] : NOMBRES[(n - 1) % NOMBRES.length];

      // Pedido habitual
      const pedido = {};
      const r = rnd();
      if (esComercio) { pedido.b20 = entre(3, 6); }
      else if (r < 0.55) { pedido.b20 = entre(1, 3); }
      else if (r < 0.8) { pedido.sif = entre(2, 6); }
      else if (r < 0.9) { pedido.b12 = entre(1, 2); }
      else { pedido.b20 = entre(1, 2); pedido.sif = entre(2, 4); }

      const totalPedido = Object.entries(pedido).reduce((t, [k, c]) => t + PRODUCTOS[k].precio * c, 0);

      // Dispenser
      let dispenser = null;
      if (rnd() < (esComercio ? 0.8 : 0.35)) {
        const m = pick(MODELOS_DISP);
        const vence = pick([10, 15, 20, 25, 28]);
        const pagado = rnd() < 0.55;
        dispenser = {
          modelo: m.modelo,
          mensualidad: m.mensualidad,
          instalado: `${entre(2023, 2025)}-${String(entre(1, 12)).padStart(2, '0')}-${String(entre(1, 28)).padStart(2, '0')}`,
          venceDia: vence,
          pagadoMes: pagado,
          serie: 'NQ-' + entre(1000, 9999),
        };
      }

      // Deuda
      let deuda = 0;
      if (rnd() < 0.38) deuda = totalPedido * entre(1, 3);

      const frecuencia = esComercio ? 'semanal' : pick(['semanal', 'semanal', 'semanal', 'quincenal']);

      // Posición: alrededor del centro de la zona
      const lat = z.lat + (rnd() - 0.5) * 0.022;
      const lng = z.lng + (rnd() - 0.5) * 0.028;

      const tel = `341 ${entre(500, 699)}-${String(entre(0, 9999)).padStart(4, '0')}`;

      // Historial de pedidos (últimos 12)
      const pasoDias = frecuencia === 'semanal' ? 7 : 14;
      const historial = [];
      const pagos = [];
      for (let k = 1; k <= 12; k++) {
        const f = new Date(hoy);
        const atras = ((f.getDay() - z.dia + 7) % 7) || 7; // último día de reparto de la zona antes de hoy
        f.setDate(f.getDate() - atras - (k - 1) * pasoDias);
        const items = {};
        Object.entries(pedido).forEach(([p, c]) => { items[p] = Math.max(1, c + (rnd() < 0.2 ? entre(-1, 1) : 0)); });
        const total = Object.entries(items).reduce((t, [p, c]) => t + PRODUCTOS[p].precio * c, 0);
        const pago = !(k <= 3 && deuda > 0);
        historial.push({ fecha: iso(f), items, total, pagado: pago });
        if (pago) pagos.push({ fecha: iso(f), monto: total, medio: rnd() < 0.6 ? 'Efectivo' : (rnd() < 0.5 ? 'Transferencia' : 'Mercado Pago'), concepto: 'Entrega' });
      }
      if (dispenser) {
        for (let k = dispenser.pagadoMes ? 0 : 1; k < 4; k++) {
          const dia = k === 0 ? Math.min(dispenser.venceDia, hoy.getDate() - 1, 26) : Math.min(dispenser.venceDia, 26);
          const f = new Date(hoy.getFullYear(), hoy.getMonth() - k, Math.max(1, dia));
          pagos.push({ fecha: iso(f), monto: dispenser.mensualidad, medio: 'Transferencia', concepto: 'Mensualidad dispenser' });
        }
      }
      pagos.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      clientes.push({
        id: 'c' + n,
        nombre,
        comercio: esComercio,
        zona: z.id,
        direccion: `${pick(CALLES[z.id])} ${entre(100, 2400)}`,
        lat, lng, tel,
        pedido,
        frecuencia,
        desde: String(entre(2019, 2025)),
        deuda,
        dispenser,
        obs: pick(OBSERVACIONES),
        historial,
        pagos,
        incidencias: rnd() < 0.2 ? [{ fecha: historial[entre(0, 5)].fecha, texto: pick(['Bidón con pérdida, se cambió', 'Reclamo por demora', 'Pidió cambiar día de entrega']) }] : [],
        notas: '',
      });
    }
  });

  return {
    clientes,
    stock: STOCK_INICIAL.map((s) => ({ ...s })),
    plantillas: PLANTILLAS_INICIALES.map((p) => ({ ...p })),
    lotes: generarLotes(hoy),
    movStock: [],
  };
}

function generarLotes(hoy) {
  const f = (d) => { const x = new Date(hoy); x.setDate(x.getDate() - d); return iso(x); };
  return [
    { id: 'L-0921', fecha: f(0), tipo: 'Bidones 20 L', cantidad: 80, etapa: 2, descartados: 0, historial: [f(0) + ' 07:10 Ingreso', f(0) + ' 07:45 Lavado', f(0) + ' 08:30 Desinfección'] },
    { id: 'L-0920', fecha: f(0), tipo: 'Sifones', cantidad: 120, etapa: 1, descartados: 0, historial: [f(0) + ' 07:20 Ingreso', f(0) + ' 08:05 Lavado'] },
    { id: 'L-0919', fecha: f(1), tipo: 'Bidones 20 L', cantidad: 96, etapa: 4, descartados: 3, historial: [f(1) + ' 07:05 Ingreso', f(1) + ' 07:40 Lavado', f(1) + ' 08:20 Desinfección', f(1) + ' 09:00 Enjuague', f(1) + ' 09:35 Listos (3 descartados)'] },
    { id: 'L-0918', fecha: f(2), tipo: 'Bidones 12 L', cantidad: 40, etapa: 4, descartados: 1, historial: [f(2) + ' 07:15 Ingreso', f(2) + ' 07:50 Lavado', f(2) + ' 08:25 Desinfección', f(2) + ' 09:05 Enjuague', f(2) + ' 09:30 Listos (1 descartado)'] },
  ];
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
