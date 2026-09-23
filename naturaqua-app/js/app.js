/* =========================================================
   Naturaqua · Demo del sistema de gestión para soderías
   Desarrollado por Metricslab Agency
   App 100% en el navegador: los datos se guardan en este
   dispositivo (localStorage). "Reiniciar demo" vuelve a cero.
   ========================================================= */
'use strict';

const LS_KEY = 'naturaqua-demo-v1';
const HOY = new Date(); HOY.setHours(0, 0, 0, 0);
const HOY_ISO = iso(HOY);
const DIA_RUTA = HOY.getDay() === 0 ? 1 : HOY.getDay(); // domingo muestra la ruta del lunes
const ZONA_HOY = ZONAS.find((z) => z.dia === DIA_RUTA);
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_CORTOS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MEDIOS = ['Efectivo', 'Transferencia', 'Mercado Pago'];
const ETAPAS = ['Ingreso', 'Lavado', 'Desinfección', 'Enjuague', 'Listos'];

const ESTADOS = {
  pendiente: { t: 'Pendiente', c: 't-teal', col: '#1A8FA8' },
  entregado: { t: 'Entregado', c: 't-green', col: '#3E9B5A' },
  ausente: { t: 'No estaba', c: 't-amber', col: '#C98A12' },
  no_entregado: { t: 'No entregado', c: 't-red', col: '#CF4444' },
};
const DISP_EST = {
  al_dia: { t: 'Al día', c: 't-green' },
  pendiente: { t: 'Pendiente', c: 't-gray' },
  por_vencer: { t: 'Por vencer', c: 't-amber' },
  vencida: { t: 'Vencida', c: 't-red' },
};

let DB = null;
let maps = [];
let modalMaps = [];
let MS = null; // estado del modal abierto
const UI = {
  cliQ: '', cliZona: 'todas', cliFiltro: 'todos',
  repFiltro: 'pendientes', repartoTab: 'hoy',
  stockCat: 'Todas', stockComprar: false,
  dispFiltro: 'todos', msgTab: 'reparto', plantillaSel: 'reparto',
  enviados: {}, tipCerrado: false, wxLayer: 'rain',
};

/* ---------------- Punto de partida (el negocio) ---------------- */
function planta() { return (DB && DB.config && DB.config.planta) || NEGOCIO.planta; }
let GPS = null; // posición real del repartidor (si da permiso)
let gpsWatch = null;
function activarGPS(silencioso) {
  if (!navigator.geolocation || gpsWatch !== null) return;
  gpsWatch = navigator.geolocation.watchPosition(
    (pos) => { const nuevo = !GPS; GPS = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }; if (nuevo && ['reparto'].includes(ruta().page)) render(); },
    () => { gpsWatch = null; if (!silencioso) toast('Sin permiso de ubicación: el mapa muestra la última parada visitada'); },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
  );
}

/* ---------------- Tema claro / oscuro ---------------- */
const temaOscuro = () => document.documentElement.getAttribute('data-theme') === 'dark';
function themeBtn() {
  const d = temaOscuro();
  return `<button class="theme-btn" data-a="theme" aria-label="Cambiar a modo ${d ? 'claro' : 'oscuro'}" title="Modo ${d ? 'claro' : 'oscuro'}">${ic(d ? 'sun' : 'moon')}</button>`;
}

/* ---------------- Iconos ---------------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  truck: '<path d="M2.5 6h11.5v10H2.5z"/><path d="M14 9h4l3 3.2V16h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6V5a1 1 0 0 1 1-1h10"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  dispenser: '<rect x="6" y="9" width="12" height="12" rx="1.5"/><path d="M9 9V6a3 3 0 0 1 6 0v3M10 14h4M11 17h2"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9"/>',
  msg: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.3A8.5 8.5 0 1 1 20.5 11.5z"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  nav: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.5 4.5L21 15M21 20v-5h-5"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L20.5 8H6"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5z"/><path d="M8 21l1-2M12 21l1-2M16 21l1-2"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------------- Utilidades ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const money = (n) => '$' + Math.round(n || 0).toLocaleString('es-AR');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cli = (id) => DB.clientes.find((c) => c.id === id);
const zona = (id) => ZONAS.find((z) => z.id === id);
const fmtF = (s) => { const [, m, d] = s.split('-'); return `${d}/${m}`; };
const fmtFY = (s) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
const fmtLarga = (d) => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
const horaAhora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const totalItems = (p) => Object.entries(p).reduce((t, [k, c]) => t + (PRODUCTOS[k] ? PRODUCTOS[k].precio * c : 0), 0);
const iniciales = (n) => n.split(' ').filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const avatarCls = (id) => ['t-teal', 't-green', 't-navy', 't-amber'][parseInt(id.replace(/\D/g, ''), 10) % 4];
const primerNombre = (c) => (c.comercio ? c.nombre : c.nombre.split(' ')[0]);
const zonaPill = (zid) => { const z = zona(zid); return `<span class="pill nodot" style="background:${z.color}1C;color:${z.color}">${esc(z.nombre)}</span>`; };

function pedidoTxt(p) {
  const t = Object.entries(p).filter(([, c]) => c > 0).map(([k, c]) => `${c} ${c === 1 ? PRODUCTOS[k].corto : PRODUCTOS[k].plural}`);
  return t.join(' + ') || '—';
}
function dist(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function ordenarNN(puntos, desde) {
  const rest = [...puntos]; const out = []; let cur = desde;
  while (rest.length) {
    let bi = 0, bd = Infinity;
    rest.forEach((p, i) => { const d = dist(cur, p); if (d < bd) { bd = d; bi = i; } });
    cur = rest.splice(bi, 1)[0]; out.push(cur);
  }
  return out;
}
function estadoDisp(d) {
  if (!d) return null;
  if (d.pagadoMes) return 'al_dia';
  const dia = HOY.getDate();
  if (dia > d.venceDia) return 'vencida';
  if (d.venceDia - dia <= 5) return 'por_vencer';
  return 'pendiente';
}
const venceTxt = (d) => `${String(d.venceDia).padStart(2, '0')}/${String(HOY.getMonth() + 1).padStart(2, '0')}`;
function proxEntrega(c) {
  const z = zona(c.zona);
  if (z.dia === DIA_RUTA && DB.ruta.paradas.some((p) => p.cid === c.id && p.estado === 'pendiente')) return 'Hoy';
  const d = new Date(HOY);
  for (let i = 0; i < 8; i++) { d.setDate(d.getDate() + 1); if (d.getDay() === z.dia) break; }
  return `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function manana() {
  const d = new Date(HOY); d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return { fecha: d, zona: ZONAS.find((z) => z.dia === d.getDay()) };
}
function bajoMinimo() { return DB.stock.filter((s) => s.actual < s.minimo); }
function conDeuda() { return DB.clientes.filter((c) => c.deuda > 0).sort((a, b) => b.deuda - a.deuda); }
function conDispenser() { return DB.clientes.filter((c) => c.dispenser); }
function pagosDelDia(f) {
  const out = [];
  DB.clientes.forEach((c) => c.pagos.forEach((p) => { if (p.fecha === f) out.push({ ...p, cid: c.id }); }));
  return out;
}

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- Datos ---------------- */
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { d = null; }
  if (!d || d.v !== 1) {
    DB = generarDatos(HOY); DB.v = 1;
    crearRuta(true); save(); return;
  }
  DB = d;
  if (!DB.ruta || DB.ruta.fecha !== HOY_ISO) { crearRuta(false); save(); }
}
let saveT;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch (e) { /* sin almacenamiento: la demo sigue en memoria */ } }, 120);
}

function crearRuta(seed) {
  const cs = DB.clientes.filter((c) => c.zona === ZONA_HOY.id);
  const orden = ordenarNN(cs.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng })), planta());
  DB.ruta = {
    fecha: HOY_ISO, zona: ZONA_HOY.id, iniciada: null, cerrada: null,
    paradas: orden.map((p) => ({ cid: p.id, estado: 'pendiente', hora: null, nota: '', res: null })),
  };
  if (!seed) return;
  DB.ruta.iniciada = '08:02';
  const patron = ['pago', 'pago', 'debe', 'ausente', 'pagodeuda', 'transf', 'pago', 'no', 'pago', 'debe', 'pago'];
  const n = Math.ceil(DB.ruta.paradas.length * 0.55);
  for (let i = 0; i < n; i++) {
    const p = DB.ruta.paradas[i]; const c = cli(p.cid);
    const mm = 8 * 60 + 15 + i * 14;
    const hora = `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
    const t = patron[i % patron.length];
    if (t === 'ausente') marcarNoEntrega(p, 'ausente', '', hora);
    else if (t === 'no') marcarNoEntrega(p, 'no_entregado', 'Canceló el pedido', hora);
    else {
      const items = { ...c.pedido }; const tot = totalItems(items);
      let monto = 0, medio = 'Efectivo';
      if (t === 'pago') monto = tot;
      if (t === 'transf') { monto = tot; medio = 'Transferencia'; }
      if (t === 'pagodeuda') monto = tot + c.deuda;
      entregar(p, items, monto, medio, '', hora, false);
    }
  }
}

function aplicarStock(mov, signo = 1) {
  Object.entries(mov).forEach(([id, v]) => {
    const s = DB.stock.find((x) => x.id === id);
    if (s) s.actual = Math.max(0, s.actual + v * signo);
  });
}

function entregar(p, items, monto, medio, nota, hora, cobrarDisp) {
  const c = cli(p.cid);
  const total = totalItems(items);
  const snap = { deuda: c.deuda, h: c.historial.length, pg: c.pagos.length };
  c.deuda = Math.max(0, c.deuda + total - monto);
  c.historial.unshift({ fecha: HOY_ISO, items: { ...items }, total, pagado: monto >= total });
  if (monto > 0) c.pagos.unshift({ fecha: HOY_ISO, monto, medio, concepto: 'Entrega en reparto' });
  let dispMonto = 0;
  if (cobrarDisp && c.dispenser && !c.dispenser.pagadoMes) {
    c.dispenser.pagadoMes = true; dispMonto = c.dispenser.mensualidad;
    c.pagos.unshift({ fecha: HOY_ISO, monto: dispMonto, medio, concepto: 'Mensualidad dispenser' });
  }
  const mov = { s1: -(items.b20 || 0), s2: +(items.b20 || 0), s3: -(items.b12 || 0), s4: -(items.sif || 0), s5: +(items.sif || 0) };
  aplicarStock(mov);
  p.estado = 'entregado'; p.hora = hora || horaAhora(); p.nota = nota || '';
  p.res = { items: { ...items }, total, monto, medio, snap, mov, dispMonto };
}
function marcarNoEntrega(p, estado, nota, hora) {
  p.estado = estado; p.hora = hora || horaAhora(); p.nota = nota || ''; p.res = null;
}
function revertir(p) {
  const c = cli(p.cid);
  if (p.res) {
    const { snap, mov } = p.res;
    c.deuda = snap.deuda;
    c.historial.splice(0, c.historial.length - snap.h);
    c.pagos.splice(0, c.pagos.length - snap.pg);
    if (p.res.dispMonto && c.dispenser) c.dispenser.pagadoMes = false;
    aplicarStock(mov, -1);
  }
  p.estado = 'pendiente'; p.hora = null; p.nota = ''; p.res = null;
}

function statsRuta() {
  const r = { total: 0, entregado: 0, ausente: 0, no_entregado: 0, pendiente: 0, cobrado: 0, efectivo: 0, transf: 0, fiado: 0, b20: 0, b12: 0, sif: 0 };
  DB.ruta.paradas.forEach((p) => {
    r.total++; r[p.estado]++;
    if (p.res) {
      const m = p.res.monto + (p.res.dispMonto || 0);
      r.cobrado += m;
      if (p.res.medio === 'Efectivo') r.efectivo += m; else r.transf += m;
      r.fiado += Math.max(0, p.res.total - p.res.monto);
      Object.entries(p.res.items).forEach(([k, c]) => { r[k] += c; });
    }
  });
  r.visitados = r.total - r.pendiente;
  return r;
}

/* ---------------- WhatsApp ---------------- */
function waTexto(pid, c) {
  const pl = DB.plantillas.find((p) => p.id === pid) || DB.plantillas[0];
  const d = c.dispenser;
  return pl.texto
    .replace(/\{nombre\}/g, primerNombre(c))
    .replace(/\{pedido\}/g, pedidoTxt(c.pedido))
    .replace(/\{deuda\}/g, money(c.deuda))
    .replace(/\{mensualidad\}/g, d ? money(d.mensualidad) : '')
    .replace(/\{vence\}/g, d ? venceTxt(d) : '');
}
const waLink = (texto) => 'https://wa.me/?text=' + encodeURIComponent(texto);

/* ---------------- Router ---------------- */
function ruta() {
  const h = (location.hash || '').replace(/^#\/?/, '');
  const [page, arg] = h.split('/');
  return { page: page || '', arg };
}
function render() {
  maps.forEach((m) => m.remove()); maps = [];
  const { page } = ruta();
  const app = $('#app');
  if (!page) { app.innerHTML = loginHtml(); window.scrollTo(0, 0); return; }
  if (page === 'repartidor') { app.innerHTML = repHtml(); return; }
  const P = PAGES[page] || PAGES.inicio;
  app.innerHTML = shellHtml(page in PAGES ? page : 'inicio', P.html());
  if (P.after) P.after();
}
let lastPage = null;
window.addEventListener('hashchange', () => {
  const { page } = ruta();
  closeModal();
  render();
  if (page !== lastPage) window.scrollTo(0, 0);
  lastPage = page;
});

/* ---------------- Login ---------------- */
function loginHtml() {
  return `<div class="login"><div class="login-top">${themeBtn()}</div><div class="login-card">
    <img src="assets/logo.jpg" alt="Naturaqua · Agua pura, vida natural">
    <h1>Sistema de gestión</h1>
    <p class="muted">Clientes, reparto, cobranzas, stock y WhatsApp en un solo lugar.</p>
    <button class="role-btn" data-a="go" data-to="inicio">
      <span class="ic t-navy">${ic('home')}</span>
      <span><strong>Entrar como dueño</strong><span class="muted small">Dashboard, clientes, cobranzas, stock</span></span>
    </button>
    <button class="role-btn" data-a="go" data-to="repartidor">
      <span class="ic t-teal">${ic('truck')}</span>
      <span><strong>Entrar como repartidor</strong><span class="muted small">Ruta del día desde el celular</span></span>
    </button>
    <div class="login-foot">Demo con datos de ejemplo · Desarrollado por <b>Metricslab Agency</b></div>
  </div></div>`;
}

/* ---------------- Shell del dueño ---------------- */
const NAV = [
  { id: 'inicio', t: 'Inicio', i: 'home' },
  { id: 'reparto', t: 'Reparto', i: 'truck' },
  { id: 'clientes', t: 'Clientes', i: 'users' },
  { id: 'cobranzas', t: 'Cobranzas', i: 'wallet' },
  { id: 'stock', t: 'Stock', i: 'box' },
  { id: 'dispensers', t: 'Dispensers', i: 'dispenser' },
  { id: 'produccion', t: 'Producción', i: 'flask' },
  { id: 'clima', t: 'Clima', i: 'cloud' },
  { id: 'mensajes', t: 'WhatsApp', i: 'msg' },
];
function badges() {
  return {
    stock: bajoMinimo().length,
    dispensers: conDispenser().filter((c) => estadoDisp(c.dispenser) === 'vencida').length,
    reparto: DB.ruta.cerrada ? DB.ruta.paradas.filter((p) => p.estado === 'pendiente').length : 0,
  };
}
function shellHtml(page, content) {
  const b = badges();
  const cur = NAV.find((n) => n.id === page);
  const bottom = NAV.slice(0, 4);
  const masOn = !bottom.some((n) => n.id === page);
  return `<div class="shell">
    <aside class="sidebar">
      <div class="brand"><img src="assets/icono.png" alt=""><div><b>NATURAQUA</b><span>Gestión de sodería</span></div></div>
      <nav class="nav">${NAV.map((n) => `<a href="#/${n.id}" class="${n.id === page ? 'on' : ''}">${ic(n.i)}${n.t}${b[n.id] ? `<span class="badge">${b[n.id]}</span>` : ''}</a>`).join('')}</nav>
      <div class="sb-foot">
        <div>Sesión: <b>Dueño</b></div>
        <button data-a="go" data-to="repartidor">${ic('truck', 'sm')} Ver como repartidor</button>
        <button data-a="theme">${ic(temaOscuro() ? 'sun' : 'moon', 'sm')} Modo ${temaOscuro() ? 'claro' : 'oscuro'}</button>
        <button data-a="reset">${ic('refresh', 'sm')} Reiniciar demo</button>
        <button data-a="go" data-to="">${ic('logout', 'sm')} Salir</button>
      </div>
    </aside>
    <header class="topbar">
      <div class="brand"><img src="assets/icono.png" alt=""><div><b>NATURAQUA</b><span>${esc(cur ? cur.t : '')}</span></div></div>
      <div style="display:flex;gap:6px;align-items:center">${themeBtn()}<button class="btn sm ghost" style="color:#fff" data-a="go" data-to="repartidor">${ic('truck', 'sm')} Repartidor</button></div>
    </header>
    <main class="main">${content}</main>
    <nav class="bottomnav">
      ${bottom.map((n) => `<a href="#/${n.id}" class="${n.id === page ? 'on' : ''}">${ic(n.i)}${n.t}${b[n.id] ? `<span class="badge">${b[n.id]}</span>` : ''}</a>`).join('')}
      <button data-a="mas" class="${masOn ? 'on' : ''}">${ic('more')}Más${(b.stock + b.dispensers) ? `<span class="badge">${b.stock + b.dispensers}</span>` : ''}</button>
    </nav>
  </div>`;
}

/* =========================================================
   PÁGINAS DEL DUEÑO
   ========================================================= */
const PAGES = {};

/* ---------------- Inicio / Dashboard ---------------- */
PAGES.inicio = {
  html() {
    const r = statsRuta();
    const hoyPagos = pagosDelDia(HOY_ISO);
    const cobradoHoy = hoyPagos.reduce((t, p) => t + p.monto, 0);
    const efectivo = hoyPagos.filter((p) => p.medio === 'Efectivo').reduce((t, p) => t + p.monto, 0);
    const deudores = conDeuda();
    const pendiente = deudores.reduce((t, c) => t + c.deuda, 0);
    const bajo = bajoMinimo();
    const disp = conDispenser();
    const vencidas = disp.filter((c) => estadoDisp(c.dispenser) === 'vencida');
    const lotesProc = DB.lotes.filter((l) => l.etapa < 4);
    const pct = (n) => (r.total ? (n / r.total) * 100 : 0);
    const m = manana();
    const cm = DB.clientes.filter((c) => c.zona === m.zona.id);
    const itemsM = cm.reduce((acc, c) => { Object.entries(c.pedido).forEach(([k, v]) => { acc[k] = (acc[k] || 0) + v; }); return acc; }, {});
    const sinVisitar = DB.ruta.cerrada ? r.pendiente : 0;

    return `
    <div class="page-head">
      <div><h1>Resumen de hoy</h1><div class="sub">${fmtLarga(HOY)} · Ruta ${esc(ZONA_HOY.nombre)}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn" href="#/reparto">${ic('map', 'sm')} Ruta en vivo</a>
        <button class="btn primary" data-a="pago">${ic('cash', 'sm')} Registrar pago</button>
      </div>
    </div>

    ${UI.tipCerrado ? '' : `<div class="demo-note" style="margin-bottom:16px">${ic('truck')}<div><b>Probalo:</b> abrí la <a href="#/repartidor">vista del repartidor</a> (idealmente en el celular), marcá entregas y cobros, y volvé acá: todo se actualiza solo. <button class="btn sm ghost" data-a="tip" style="margin-left:4px">Entendido</button></div></div>`}

    ${sinVisitar ? `<a class="alert" href="#/reparto" style="margin-bottom:16px;border-color:var(--red);background:var(--red-soft)"><span class="ic t-red">${ic('alert')}</span><div><b>${sinVisitar}</b> ${sinVisitar === 1 ? 'cliente quedó' : 'clientes quedaron'} sin visitar en la ruta de hoy (cerrada ${DB.ruta.cerrada} h)</div><span class="go">${ic('chev')}</span></a>` : ''}

    <div class="grid g4">
      <div class="card kpi">
        <div class="lbl"><span class="dot t-teal">${ic('truck', 'sm')}</span>Repartos</div>
        <div class="val num">${r.entregado}<span class="muted" style="font-size:18px"> / ${r.total}</span></div>
        <div class="det">${r.ausente} ausentes · ${r.no_entregado} no entregados · <b>${r.pendiente} pendientes</b></div>
        <div class="bar"><i style="width:${pct(r.entregado)}%;background:var(--green)"></i><i style="width:${pct(r.ausente)}%;background:var(--amber)"></i><i style="width:${pct(r.no_entregado)}%;background:var(--red)"></i></div>
      </div>
      <div class="card kpi">
        <div class="lbl"><span class="dot t-green">${ic('cash', 'sm')}</span>Cobrado hoy</div>
        <div class="val num">${money(cobradoHoy)}</div>
        <div class="det">Efectivo <b>${money(efectivo)}</b> · Transf./MP <b>${money(cobradoHoy - efectivo)}</b></div>
      </div>
      <div class="card kpi">
        <div class="lbl"><span class="dot t-red">${ic('wallet', 'sm')}</span>Pendiente de cobro</div>
        <div class="val num">${money(pendiente)}</div>
        <div class="det"><b>${deudores.length}</b> clientes con deuda</div>
      </div>
      <div class="card kpi">
        <div class="lbl"><span class="dot t-amber">${ic('box', 'sm')}</span>Stock</div>
        <div class="val num">${bajo.length}<span class="muted" style="font-size:15px;font-weight:600"> bajo mínimo</span></div>
        <div class="det">${bajo.slice(0, 2).map((s) => esc(s.nombre)).join(', ')}${bajo.length > 2 ? '…' : ''}</div>
      </div>
    </div>

    <div class="grid g3" style="margin-top:16px">
      <div class="card span2">
        <div class="card-head"><h2>Ruta de hoy · ${esc(ZONA_HOY.nombre)}</h2><a class="btn sm" href="#/reparto">Ver mapa</a></div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Cliente</th><th class="hide-m">Dirección</th><th>Estado</th><th>Pago</th></tr></thead>
          <tbody>${DB.ruta.paradas.map((p, i) => filaRuta(p, i)).join('')}</tbody>
        </table></div>
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>Alertas</h2></div>
          <div class="alerts">
            ${alerta('#/dispensers', 't-red', 'dispenser', vencidas.length, 'mensualidades de dispenser vencidas')}
            ${alerta('#/cobranzas', 't-amber', 'wallet', deudores.length, 'clientes con deuda')}
            ${alerta('#/stock', 't-amber', 'cart', bajo.length, 'productos para comprar')}
            ${alerta('#/reparto', 't-teal', 'clock', r.pendiente, 'paradas pendientes hoy')}
            ${alerta('#/produccion', 't-navy', 'flask', lotesProc.length, 'lotes en limpieza')}
          </div>
        </div>
        ${climaCardHtml()}
        <div class="card">
          <div class="card-head"><h2>Próximo reparto</h2>${zonaPill(m.zona.id)}</div>
          <div class="muted small">${fmtLarga(m.fecha)}</div>
          <div style="font-family:var(--font-title);font-size:22px;font-weight:800;color:var(--navy);margin:6px 0 2px">${cm.length} clientes</div>
          <div class="small">${pedidoTxt(itemsM)}</div>
          <a class="btn wa block" style="margin-top:12px" href="#/mensajes" data-a="msgReparto">${ic('msg', 'sm')} Avisar por WhatsApp</a>
        </div>
      </div>
    </div>

    <div class="grid g2" style="margin-top:16px">
      <div class="card">
        <div class="card-head"><h2>Cobranza de los últimos 7 días</h2></div>
        ${graficoCobros()}
      </div>
      <div class="card">
        <div class="card-head"><h2>Deudas más altas</h2><a class="btn sm" href="#/cobranzas">Ver todas</a></div>
        <div class="list">${deudores.slice(0, 5).map((c) => `
          <div class="row click" data-a="ficha" data-id="${c.id}" style="cursor:pointer">
            <div class="avatar ${avatarCls(c.id)}">${iniciales(c.nombre)}</div>
            <div class="grow"><div class="title">${esc(c.nombre)}</div><div class="muted xs">${esc(zona(c.zona).nombre)} · último pago ${c.pagos[0] ? fmtF(c.pagos[0].fecha) : '—'}</div></div>
            <b class="num" style="color:var(--red)">${money(c.deuda)}</b>
          </div>`).join('') || '<div class="empty">Nadie debe nada 🎉</div>'}
        </div>
      </div>
    </div>`;
  },
};
function alerta(href, cls, icon, n, txt) {
  return `<a class="alert" href="${href}"><span class="ic ${n ? cls : 't-gray'}">${ic(icon, 'sm')}</span><div><b>${n}</b> ${txt}</div><span class="go">${ic('chev', 'sm')}</span></a>`;
}
function filaRuta(p, i) {
  const c = cli(p.cid); const e = ESTADOS[p.estado];
  let pago = '<span class="muted">—</span>';
  if (p.res) {
    const debe = p.res.monto < p.res.total;
    pago = debe ? `<span class="pill t-red">Debe</span>` : `<span class="pill t-green">Pagó</span>`;
  }
  return `<tr class="click" data-a="ficha" data-id="${c.id}">
    <td class="muted num">${i + 1}</td>
    <td><b>${esc(c.nombre)}</b>${p.hora ? `<div class="muted xs">${p.hora} h</div>` : ''}</td>
    <td class="hide-m muted small">${esc(c.direccion)}</td>
    <td><span class="pill ${e.c}">${e.t}</span></td>
    <td>${pago}</td></tr>`;
}
function graficoCobros() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(HOY); d.setDate(d.getDate() - i);
    const f = iso(d);
    dias.push({ d, total: pagosDelDia(f).reduce((t, p) => t + p.monto, 0), hoy: i === 0 });
  }
  const max = Math.max(1, ...dias.map((x) => x.total));
  const semana = dias.reduce((t, x) => t + x.total, 0);
  return `<div class="muted small">Total semana: <b style="color:var(--navy)">${money(semana)}</b></div>
  <div class="bars">${dias.map((x) => `<div class="b ${x.hoy ? 'today' : ''}" title="${money(x.total)}">
    <em>${x.total ? '$' + Math.round(x.total / 1000) + 'k' : ''}</em>
    <i style="height:${(x.total / max) * 100}%"></i>
    <span>${x.hoy ? 'Hoy' : DIAS_CORTOS[x.d.getDay()] + ' ' + x.d.getDate()}</span></div>`).join('')}</div>`;
}

/* ---------------- Reparto ---------------- */
PAGES.reparto = {
  html() {
    const r = statsRuta();
    const tab = UI.repartoTab;
    return `
    <div class="page-head">
      <div><h1>Reparto y rutas</h1><div class="sub">Recorridos por día y seguimiento en vivo</div></div>
      <div class="seg"><button class="${tab === 'hoy' ? 'on' : ''}" data-a="repTab" data-v="hoy">Hoy en vivo</button><button class="${tab === 'semana' ? 'on' : ''}" data-a="repTab" data-v="semana">Recorridos de la semana</button></div>
    </div>
    ${tab === 'hoy' ? repartoHoyHtml(r) : repartoSemanaHtml()}`;
  },
  after() { if (UI.repartoTab === 'hoy') mountRutaMap('map-hoy'); },
};
function repartoHoyHtml(r) {
  const pend = DB.ruta.paradas.filter((p) => p.estado === 'pendiente');
  const estado = DB.ruta.cerrada ? `<span class="pill t-navy">Cerrada ${DB.ruta.cerrada} h</span>` : DB.ruta.iniciada ? `<span class="pill t-green">En curso desde ${DB.ruta.iniciada} h</span>` : '<span class="pill t-gray">Sin iniciar</span>';
  return `
  <div class="grid g3">
    <div class="card span2">
      <div class="card-head"><h2>${esc(ZONA_HOY.nombre)} · ${DIAS[DIA_RUTA]}</h2>${estado}</div>
      <div id="map-hoy" class="map tall"></div>
      <div class="legend">${Object.values(ESTADOS).map((e) => `<span><i style="background:${e.col}"></i>${e.t}</span>`).join('')}<span>${ic('truck', 'sm')} última parada visitada</span></div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="lbl muted small" style="font-weight:600">Ruta completada</div>
        <div style="font-family:var(--font-title);font-size:34px;font-weight:800;color:var(--navy)" class="num">${r.visitados}/${r.total}</div>
        <div class="bar"><i style="width:${r.total ? (r.visitados / r.total) * 100 : 0}%;background:var(--teal)"></i></div>
        <div class="small" style="margin-top:10px;line-height:1.8">
          <span class="pill t-green">${r.entregado} entregados</span> <span class="pill t-amber">${r.ausente} no estaban</span>
          <span class="pill t-red">${r.no_entregado} no entregados</span> <span class="pill t-teal">${r.pendiente} pendientes</span>
        </div>
        <div class="small" style="margin-top:10px">Repartidor: <b>${NEGOCIO.repartidor}</b> · Cobrado en ruta: <b>${money(r.cobrado)}</b></div>
        <div class="alert" style="margin-top:12px;cursor:pointer" data-a="puntoPartida"><span class="ic t-navy"><img src="assets/icono.png" alt="" style="width:22px;height:22px;border-radius:5px"></span><div class="small"><b style="font-size:14px">Punto de partida</b><br>${esc(planta().nombre)}${DB.config && DB.config.planta ? '' : ' <span class="muted">(configurar)</span>'}</div><span class="go">${ic('edit', 'sm')}</span></div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="btn" data-a="optimizar" ${pend.length < 2 ? 'disabled' : ''}>${ic('route', 'sm')} Ordenar ruta</button>
          <a class="btn primary" href="#/repartidor">${ic('truck', 'sm')} Vista repartidor</a>
        </div>
      </div>
      ${pend.length ? `<div class="card">
        <div class="card-head"><h2>${DB.ruta.cerrada ? 'Quedaron sin visitar' : 'Faltan visitar'}</h2><span class="pill ${DB.ruta.cerrada ? 't-red' : 't-teal'}">${pend.length}</span></div>
        <div class="list">${pend.map((p) => { const c = cli(p.cid); return `<div class="row click" data-a="ficha" data-id="${c.id}" style="cursor:pointer"><div class="grow"><div class="title">${esc(c.nombre)}</div><div class="muted xs">${esc(c.direccion)}</div></div><span class="small">${pedidoTxt(c.pedido)}</span></div>`; }).join('')}</div>
      </div>` : ''}
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-head"><h2>Detalle de paradas</h2></div>
    <div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Cliente</th><th class="hide-m">Pedido</th><th>Estado</th><th class="right">Cobrado</th><th class="hide-m">Nota</th></tr></thead>
      <tbody>${DB.ruta.paradas.map((p, i) => { const c = cli(p.cid); const e = ESTADOS[p.estado]; return `<tr class="click" data-a="ficha" data-id="${c.id}">
        <td class="muted num">${i + 1}</td><td><b>${esc(c.nombre)}</b><div class="muted xs">${esc(c.direccion)}</div></td>
        <td class="hide-m small">${p.res ? pedidoTxt(p.res.items) : pedidoTxt(c.pedido)}</td>
        <td><span class="pill ${e.c}">${e.t}</span>${p.hora ? `<div class="muted xs" style="margin-top:3px">${p.hora} h</div>` : ''}</td>
        <td class="right num">${p.res ? (p.res.monto + (p.res.dispMonto || 0) ? money(p.res.monto + (p.res.dispMonto || 0)) : '<span class="pill t-red">Fiado</span>') : '—'}</td>
        <td class="hide-m muted small">${esc(p.nota || c.obs || '')}</td></tr>`; }).join('')}</tbody>
    </table></div>
  </div>`;
}
function repartoSemanaHtml() {
  return `<div class="grid g3">${ZONAS.map((z) => {
    const cs = DB.clientes.filter((c) => c.zona === z.id);
    const items = cs.reduce((acc, c) => { Object.entries(c.pedido).forEach(([k, v]) => { acc[k] = (acc[k] || 0) + v; }); return acc; }, {});
    const esHoy = z.dia === DIA_RUTA;
    return `<div class="card" style="${esHoy ? 'border-color:var(--teal);box-shadow:0 0 0 2px var(--teal-soft)' : ''}">
      <div class="card-head"><div><div class="muted xs" style="font-weight:700;text-transform:uppercase;letter-spacing:.05em">${DIAS[z.dia]}${esHoy ? ' · hoy' : ''}</div><h2>${esc(z.nombre)}</h2></div><span class="pill nodot" style="background:${z.color}1C;color:${z.color}">${cs.length} clientes</span></div>
      <div class="small">${pedidoTxt(items)}</div>
      <div class="muted small" style="margin-top:2px">Venta estimada: <b style="color:var(--navy)">${money(totalItems(items))}</b></div>
      <div class="muted xs" style="margin-top:10px;line-height:1.6">${cs.slice(0, 5).map((c) => esc(c.nombre)).join(' · ')}${cs.length > 5 ? ` y ${cs.length - 5} más` : ''}</div>
      <button class="btn sm" style="margin-top:12px" data-a="mapaZona" data-z="${z.id}">${ic('map', 'sm')} Ver recorrido</button>
    </div>`;
  }).join('')}</div>
  <div class="demo-note" style="margin-top:16px">${ic('route')}<div>El sistema ordena cada recorrido automáticamente según la ubicación de los clientes, arrancando desde <b>${esc(planta().nombre)}</b>. <button class="btn sm" data-a="puntoPartida" style="margin-left:4px">${ic('pin', 'sm')} Cambiar punto de partida</button></div></div>`;
}

function tileLayer() {
  const estilo = temaOscuro() ? 'dark_all' : 'rastertiles/voyager';
  return L.tileLayer(`https://{s}.basemaps.cartocdn.com/${estilo}/{z}/{x}/{y}{r}.png`, {
    attribution: '© OpenStreetMap · © CARTO', maxZoom: 19, subdomains: 'abcd',
  });
}
function homeMarker() {
  return L.marker([planta().lat, planta().lng], {
    icon: L.divIcon({ className: '', html: '<div class="home-pin"><img src="assets/icono.png" alt=""></div>', iconSize: [30, 30], iconAnchor: [15, 15] }),
    zIndexOffset: 500,
  }).bindPopup(`<b>${esc(planta().nombre)}</b><br>Punto de partida`);
}
function mountRutaMap(elId, store = maps) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!window.L) { el.innerHTML = '<div class="empty">El mapa necesita conexión a internet.</div>'; return; }
  const m = L.map(el, { scrollWheelZoom: false });
  tileLayer().addTo(m);
  homeMarker().addTo(m);
  const pts = [[planta().lat, planta().lng]];
  let ultimo = null;
  DB.ruta.paradas.forEach((p, i) => {
    const c = cli(p.cid); const e = ESTADOS[p.estado];
    L.marker([c.lat, c.lng], {
      icon: L.divIcon({ className: '', html: `<div class="stop-pin" style="background:${e.col}">${i + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
    }).bindPopup(`<b>${esc(c.nombre)}</b><br>${esc(c.direccion)}<br>${e.t}${p.hora ? ' · ' + p.hora + ' h' : ''}`).addTo(m);
    pts.push([c.lat, c.lng]);
    if (p.estado !== 'pendiente') ultimo = c;
  });
  L.polyline(pts, { color: '#1B365D', weight: 3, opacity: 0.45, dashArray: '6 7' }).addTo(m);
  if (DB.ruta.iniciada && !DB.ruta.cerrada) {
    const pos = GPS ? [GPS.lat, GPS.lng] : ultimo ? [ultimo.lat, ultimo.lng] : [planta().lat, planta().lng];
    L.marker(pos, { icon: L.divIcon({ className: '', html: `<div class="truck-pin">${ic('truck')}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] }), zIndexOffset: 1000 })
      .bindPopup(`<b>${NEGOCIO.repartidor}</b> · ${GPS ? 'ubicación GPS en vivo' : 'en recorrido'}`).addTo(m);
  }
  m.fitBounds(pts, { padding: [30, 30] });
  store.push(m);
  setTimeout(() => m.invalidateSize(), 60);
}
function mountZonaMap(elId, zid) {
  const el = document.getElementById(elId);
  if (!el || !window.L) { if (el) el.innerHTML = '<div class="empty">El mapa necesita conexión a internet.</div>'; return; }
  const z = zona(zid);
  const cs = DB.clientes.filter((c) => c.zona === zid);
  const orden = ordenarNN(cs, planta());
  const m = L.map(el, { scrollWheelZoom: false });
  tileLayer().addTo(m); homeMarker().addTo(m);
  const pts = [[planta().lat, planta().lng]];
  orden.forEach((c, i) => {
    L.marker([c.lat, c.lng], { icon: L.divIcon({ className: '', html: `<div class="stop-pin" style="background:${z.color}">${i + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) })
      .bindPopup(`<b>${esc(c.nombre)}</b><br>${esc(c.direccion)}<br>${pedidoTxt(c.pedido)}`).addTo(m);
    pts.push([c.lat, c.lng]);
  });
  L.polyline(pts, { color: z.color, weight: 3, opacity: 0.6 }).addTo(m);
  m.fitBounds(pts, { padding: [30, 30] });
  modalMaps.push(m);
  setTimeout(() => m.invalidateSize(), 80);
}

/* ---------------- Clientes ---------------- */
PAGES.clientes = {
  html() {
    return `
    <div class="page-head">
      <div><h1>Clientes</h1><div class="sub">${DB.clientes.length} clientes activos en ${ZONAS.length} zonas</div></div>
      <button class="btn primary" data-a="nuevoCliente">${ic('plus', 'sm')} Nuevo cliente</button>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ic('search', 'sm')}<input class="input" data-in="cliQ" placeholder="Buscar por nombre, dirección o teléfono" value="${esc(UI.cliQ)}"></div>
        <select class="input" style="width:auto" data-in="cliFiltro">
          <option value="todos" ${UI.cliFiltro === 'todos' ? 'selected' : ''}>Todos</option>
          <option value="deuda" ${UI.cliFiltro === 'deuda' ? 'selected' : ''}>Con deuda</option>
          <option value="dispenser" ${UI.cliFiltro === 'dispenser' ? 'selected' : ''}>Con dispenser</option>
          <option value="comercio" ${UI.cliFiltro === 'comercio' ? 'selected' : ''}>Comercios</option>
        </select>
      </div>
      <div class="chips" style="margin-bottom:14px">
        <button class="chip ${UI.cliZona === 'todas' ? 'on' : ''}" data-a="cliZona" data-v="todas">Todas las zonas</button>
        ${ZONAS.map((z) => `<button class="chip ${UI.cliZona === z.id ? 'on' : ''}" data-a="cliZona" data-v="${z.id}">${esc(z.nombre)}</button>`).join('')}
      </div>
      <div id="cli-list">${cliListHtml()}</div>
    </div>`;
  },
};
function cliListHtml() {
  const q = UI.cliQ.trim().toLowerCase();
  const list = DB.clientes.filter((c) => {
    if (UI.cliZona !== 'todas' && c.zona !== UI.cliZona) return false;
    if (UI.cliFiltro === 'deuda' && !c.deuda) return false;
    if (UI.cliFiltro === 'dispenser' && !c.dispenser) return false;
    if (UI.cliFiltro === 'comercio' && !c.comercio) return false;
    if (q && !(`${c.nombre} ${c.direccion} ${c.tel}`.toLowerCase().includes(q))) return false;
    return true;
  });
  if (!list.length) return '<div class="empty">No hay clientes con ese filtro.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Cliente</th><th class="hide-m">Zona</th><th class="hide-m">Pedido habitual</th><th class="hide-m">Próxima entrega</th><th class="right">Deuda</th><th class="hide-m">Dispenser</th></tr></thead>
    <tbody>${list.map((c) => {
      const de = estadoDisp(c.dispenser);
      return `<tr class="click" data-a="ficha" data-id="${c.id}">
      <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar ${avatarCls(c.id)}">${iniciales(c.nombre)}</div><div><b>${esc(c.nombre)}</b><div class="muted xs">${esc(c.direccion)}<span class="show-m"> · ${esc(zona(c.zona).nombre)}</span></div></div></div></td>
      <td class="hide-m">${zonaPill(c.zona)}</td>
      <td class="hide-m small">${pedidoTxt(c.pedido)}</td>
      <td class="hide-m small">${proxEntrega(c)}</td>
      <td class="right num">${c.deuda ? `<b style="color:var(--red)">${money(c.deuda)}</b>` : '<span class="muted">$0</span>'}</td>
      <td class="hide-m">${de ? `<span class="pill ${DISP_EST[de].c}">${DISP_EST[de].t}</span>` : '<span class="muted">—</span>'}</td></tr>`;
    }).join('')}</tbody></table></div>
    <div class="muted xs" style="margin-top:22px">${list.length} de ${DB.clientes.length} clientes</div>`;
}

/* ---------------- Cobranzas ---------------- */
PAGES.cobranzas = {
  html() {
    const hoyP = pagosDelDia(HOY_ISO);
    const cobradoHoy = hoyP.reduce((t, p) => t + p.monto, 0);
    let semana = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(HOY); d.setDate(d.getDate() - i); semana += pagosDelDia(iso(d)).reduce((t, p) => t + p.monto, 0); }
    const deudores = conDeuda();
    const pendiente = deudores.reduce((t, c) => t + c.deuda, 0);
    const porMedio = MEDIOS.map((m) => ({ m, t: hoyP.filter((p) => p.medio === m).reduce((t, p) => t + p.monto, 0) }));
    return `
    <div class="page-head">
      <div><h1>Cuentas y cobranzas</h1><div class="sub">Lo cobrado, lo que falta cobrar y quién debe</div></div>
      <button class="btn primary" data-a="pago">${ic('cash', 'sm')} Registrar pago</button>
    </div>
    <div class="grid g4">
      <div class="card kpi"><div class="lbl"><span class="dot t-green">${ic('cash', 'sm')}</span>Cobrado hoy</div><div class="val num">${money(cobradoHoy)}</div><div class="det">${hoyP.length} pagos</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-teal">${ic('wallet', 'sm')}</span>Últimos 7 días</div><div class="val num">${money(semana)}</div><div class="det">incluye mensualidades</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-red">${ic('alert', 'sm')}</span>Pendiente de cobro</div><div class="val num">${money(pendiente)}</div><div class="det">en cuentas corrientes</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-amber">${ic('users', 'sm')}</span>Clientes con deuda</div><div class="val num">${deudores.length}</div><div class="det">de ${DB.clientes.length} clientes</div></div>
    </div>
    <div class="grid g3" style="margin-top:16px">
      <div class="card span2">
        <div class="card-head"><h2>Clientes con deuda</h2><a class="btn sm" href="#/mensajes" data-a="msgDeudas">${ic('msg', 'sm')} Recordatorios</a></div>
        ${deudores.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Cliente</th><th class="hide-m">Zona</th><th class="hide-m">Último pago</th><th class="right">Deuda</th><th class="right">Acciones</th></tr></thead>
          <tbody>${deudores.map((c) => `<tr>
            <td class="click" data-a="ficha" data-id="${c.id}" style="cursor:pointer"><b>${esc(c.nombre)}</b><div class="muted xs">${esc(c.tel)}</div></td>
            <td class="hide-m">${zonaPill(c.zona)}</td>
            <td class="hide-m small">${c.pagos[0] ? fmtF(c.pagos[0].fecha) : '—'}</td>
            <td class="right num"><b style="color:var(--red)">${money(c.deuda)}</b></td>
            <td class="right" style="white-space:nowrap"><button class="btn sm" data-a="pago" data-id="${c.id}">Cobrar</button> <button class="btn sm wa" data-a="wa" data-id="${c.id}" data-p="deuda" title="Recordatorio por WhatsApp">${ic('msg', 'sm')}</button></td>
          </tr>`).join('')}</tbody></table></div>` : '<div class="empty">No hay deudas pendientes.</div>'}
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>Cobros de hoy</h2></div>
          <div class="small" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${porMedio.map((x) => `<span class="pill nodot t-navy">${x.m}: ${money(x.t)}</span>`).join('')}</div>
          <div class="list">${hoyP.length ? hoyP.map((p) => `<div class="row"><div class="grow"><div class="title">${esc(cli(p.cid).nombre)}</div><div class="muted xs">${esc(p.concepto)} · ${p.medio}</div></div><b class="num" style="color:var(--green)">${money(p.monto)}</b></div>`).join('') : '<div class="empty">Todavía no hay cobros hoy.</div>'}</div>
        </div>
        <div class="card"><div class="card-head"><h2>Últimos 7 días</h2></div>${graficoCobros()}</div>
      </div>
    </div>`;
  },
};

/* ---------------- Stock ---------------- */
PAGES.stock = {
  html() {
    const cats = ['Todas', ...new Set(DB.stock.map((s) => s.cat))];
    const bajo = bajoMinimo();
    const list = DB.stock.filter((s) => (UI.stockCat === 'Todas' || s.cat === UI.stockCat) && (!UI.stockComprar || s.actual < s.minimo));
    return `
    <div class="page-head">
      <div><h1>Stock</h1><div class="sub">Envases, insumos, limpieza y repuestos con alerta de mínimo</div></div>
    </div>
    ${bajo.length ? `<div class="card" style="border-color:var(--amber)">
      <div class="card-head"><h2>${ic('cart', 'sm')} Para comprar (${bajo.length})</h2>
        <a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(listaCompra(bajo))}">${ic('msg', 'sm')} Pedir al proveedor</a></div>
      <div class="chips">${bajo.map((s) => `<span class="pill t-amber">${esc(s.nombre)}: ${s.actual} ${s.unidad} (mín. ${s.minimo})</span>`).join('')}</div>
    </div>` : ''}
    <div class="card">
      <div class="toolbar">
        <div class="chips">${cats.map((c) => `<button class="chip ${UI.stockCat === c ? 'on' : ''}" data-a="stockCat" data-v="${c}">${c}</button>`).join('')}</div>
        <label class="small" style="margin-left:auto;display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" data-a="stockComprar" ${UI.stockComprar ? 'checked' : ''}> Solo para comprar</label>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Producto</th><th class="hide-m">Categoría</th><th class="right">Actual</th><th class="right hide-m">Mínimo</th><th class="hide-m">Nivel</th><th>Estado</th><th class="right">Ajustar</th></tr></thead>
        <tbody>${list.map((s) => {
          const ratio = Math.min(1, s.actual / (s.minimo * 2));
          const bajoM = s.actual < s.minimo;
          const col = bajoM ? 'var(--red)' : ratio < 0.65 ? 'var(--amber)' : 'var(--green)';
          const paso = s.unidad === 'L' ? 5 : s.actual >= 100 ? 10 : 1;
          return `<tr>
            <td><b>${esc(s.nombre)}</b><div class="muted xs show-m">Mínimo ${s.minimo} ${s.unidad}</div></td>
            <td class="hide-m muted small">${s.cat}</td>
            <td class="right num"><b>${s.actual}</b> <span class="muted xs">${s.unidad}</span></td>
            <td class="right num hide-m muted">${s.minimo} ${s.unidad}</td>
            <td class="hide-m"><div class="stock-bar"><i style="width:${ratio * 100}%;background:${col}"></i></div></td>
            <td>${bajoM ? '<span class="pill t-red">Comprar</span>' : '<span class="pill t-green">OK</span>'}</td>
            <td class="right"><div class="qty"><button data-a="stockAdj" data-id="${s.id}" data-d="${-paso}" aria-label="Restar">−</button><span class="num xs">${paso}</span><button data-a="stockAdj" data-id="${s.id}" data-d="${paso}" aria-label="Sumar">+</button></div>
              <button class="btn sm ghost" data-a="stockEdit" data-id="${s.id}" title="Editar">${ic('edit', 'sm')}</button></td>
          </tr>`;
        }).join('')}</tbody></table></div>
    </div>
    <div class="demo-note" style="margin-top:16px">${ic('box')}<div>Cada entrega registrada por el repartidor descuenta bidones y sifones llenos y suma los envases vacíos que vuelven. Los lotes terminados en <a href="#/produccion">Producción</a> suman stock listo para repartir.</div></div>`;
  },
};
function listaCompra(bajo) {
  return 'Hola! Te paso el pedido de Naturaqua:\n' + bajo.map((s) => `• ${s.nombre}: ${Math.ceil(s.minimo * 1.5 - s.actual)} ${s.unidad}`).join('\n') + '\n\n¡Gracias!';
}

/* ---------------- Dispensers ---------------- */
PAGES.dispensers = {
  html() {
    const all = conDispenser();
    const est = (c) => estadoDisp(c.dispenser);
    const cnt = (e) => all.filter((c) => est(c) === e).length;
    const mensual = all.reduce((t, c) => t + c.dispenser.mensualidad, 0);
    const cobradoMes = all.filter((c) => c.dispenser.pagadoMes).reduce((t, c) => t + c.dispenser.mensualidad, 0);
    const orden = { vencida: 0, por_vencer: 1, pendiente: 2, al_dia: 3 };
    const list = all.filter((c) => UI.dispFiltro === 'todos' || est(c) === UI.dispFiltro).sort((a, b) => orden[est(a)] - orden[est(b)] || a.dispenser.venceDia - b.dispenser.venceDia);
    return `
    <div class="page-head">
      <div><h1>Dispensers en comodato</h1><div class="sub">Mensualidades, vencimientos y recordatorios</div></div>
    </div>
    <div class="grid g4">
      <div class="card kpi"><div class="lbl"><span class="dot t-navy">${ic('dispenser', 'sm')}</span>Instalados</div><div class="val num">${all.length}</div><div class="det">en casas y comercios</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-green">${ic('cash', 'sm')}</span>Cobrado este mes</div><div class="val num">${money(cobradoMes)}</div><div class="det">de <b>${money(mensual)}</b> mensuales</div><div class="bar"><i style="width:${(cobradoMes / Math.max(1, mensual)) * 100}%;background:var(--green)"></i></div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-red">${ic('alert', 'sm')}</span>Vencidas</div><div class="val num" style="color:var(--red)">${cnt('vencida')}</div><div class="det">hay que cobrar</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-amber">${ic('clock', 'sm')}</span>Por vencer</div><div class="val num">${cnt('por_vencer')}</div><div class="det">próximos 5 días</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="toolbar"><div class="chips">
        ${[['todos', 'Todos'], ['vencida', 'Vencidas'], ['por_vencer', 'Por vencer'], ['pendiente', 'Pendientes'], ['al_dia', 'Al día']].map(([v, t]) => `<button class="chip ${UI.dispFiltro === v ? 'on' : ''}" data-a="dispFiltro" data-v="${v}">${t}</button>`).join('')}
      </div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Cliente</th><th class="hide-m">Modelo</th><th class="hide-m">Instalado</th><th class="right">Mensualidad</th><th>Vence</th><th>Estado</th><th class="right">Acciones</th></tr></thead>
        <tbody>${list.map((c) => { const d = c.dispenser; const e = est(c); return `<tr>
          <td class="click" data-a="ficha" data-id="${c.id}" style="cursor:pointer"><b>${esc(c.nombre)}</b><div class="muted xs">${esc(zona(c.zona).nombre)} · ${d.serie}</div></td>
          <td class="hide-m small">${d.modelo}</td>
          <td class="hide-m small">${fmtFY(d.instalado)}</td>
          <td class="right num">${money(d.mensualidad)}</td>
          <td class="num">${venceTxt(d)}</td>
          <td><span class="pill ${DISP_EST[e].c}">${DISP_EST[e].t}</span></td>
          <td class="right" style="white-space:nowrap">${e !== 'al_dia' ? `<button class="btn sm" data-a="pago" data-id="${c.id}" data-c="disp">Cobrar</button> <button class="btn sm wa" data-a="wa" data-id="${c.id}" data-p="dispenser" title="Recordatorio">${ic('msg', 'sm')}</button>` : '<span class="muted small">—</span>'}</td>
        </tr>`; }).join('') || '<tr><td colspan="7"><div class="empty">Sin dispensers en este estado.</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
  },
};

/* ---------------- Producción / limpieza ---------------- */
PAGES.produccion = {
  html() {
    const enProc = DB.lotes.filter((l) => l.etapa < 4);
    const listos = DB.lotes.filter((l) => l.etapa >= 4);
    const tot = (arr, f) => arr.reduce((t, l) => t + f(l), 0);
    return `
    <div class="page-head">
      <div><h1>Limpieza y producción</h1><div class="sub">Trazabilidad de cada lote: lavado, desinfección y enjuague</div></div>
      <button class="btn primary" data-a="nuevoLote">${ic('plus', 'sm')} Nuevo lote</button>
    </div>
    <div class="grid g4">
      <div class="card kpi"><div class="lbl"><span class="dot t-teal">${ic('flask', 'sm')}</span>En proceso</div><div class="val num">${enProc.length}</div><div class="det">${tot(enProc, (l) => l.cantidad)} envases</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-green">${ic('check', 'sm')}</span>Listos (historial)</div><div class="val num">${tot(listos, (l) => l.cantidad - l.descartados)}</div><div class="det">envases aprobados</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-red">${ic('x', 'sm')}</span>Descartados</div><div class="val num">${tot(listos, (l) => l.descartados)}</div><div class="det">por fisuras o suciedad</div></div>
      <div class="card kpi"><div class="lbl"><span class="dot t-amber">${ic('box', 'sm')}</span>Hipoclorito</div><div class="val num">${DB.stock.find((s) => s.id === 's10').actual} L</div><div class="det">disponible</div></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      ${DB.lotes.map((l) => `<div class="card">
        <div class="card-head"><div><h2>Lote ${esc(l.id)}</h2><div class="muted small">${esc(l.tipo)} · ${l.cantidad} unidades · ${fmtF(l.fecha)}</div></div>
          ${l.etapa >= 4 ? '<span class="pill t-green">Listo</span>' : `<span class="pill t-teal">${ETAPAS[l.etapa]}</span>`}</div>
        <div class="pipeline">${ETAPAS.map((e, i) => `<div class="st ${i < l.etapa || (i === l.etapa && l.etapa >= 4) ? 'done' : i === l.etapa ? 'cur' : ''}">${e}</div>`).join('')}</div>
        <div class="muted xs" style="line-height:1.7">${l.historial.slice(-3).map((h) => esc(h)).join('<br>')}</div>
        ${l.etapa < 4 ? `<button class="btn teal sm" style="margin-top:12px" data-a="avanzarLote" data-id="${l.id}">${ic('check', 'sm')} Marcar ${ETAPAS[l.etapa + 1].toLowerCase()}</button>` : `<div class="small" style="margin-top:10px">${l.cantidad - l.descartados} aprobados · <span style="color:var(--red)">${l.descartados} descartados</span></div>`}
      </div>`).join('')}
    </div>`;
  },
};

/* ---------------- Mensajes / WhatsApp ---------------- */
PAGES.mensajes = {
  html() {
    const pl = DB.plantillas.find((p) => p.id === UI.plantillaSel);
    const ejemplo = DB.clientes.find((c) => c.dispenser && c.deuda) || DB.clientes[0];
    const m = manana();
    let lista = [], pid = 'reparto', titulo = '';
    if (UI.msgTab === 'reparto') { lista = DB.clientes.filter((c) => c.zona === m.zona.id); pid = 'reparto'; titulo = `Reparto de mañana · ${m.zona.nombre}`; }
    if (UI.msgTab === 'deudas') { lista = conDeuda(); pid = 'deuda'; titulo = 'Clientes con deuda'; }
    if (UI.msgTab === 'dispensers') { lista = conDispenser().filter((c) => ['vencida', 'por_vencer'].includes(estadoDisp(c.dispenser))); pid = 'dispenser'; titulo = 'Mensualidades vencidas o por vencer'; }
    const enviados = lista.filter((c) => UI.enviados[`${pid}-${c.id}`]).length;
    return `
    <div class="page-head">
      <div><h1>WhatsApp</h1><div class="sub">Plantillas de mensajes y avisos a clientes</div></div>
    </div>
    <div class="grid g2">
      <div class="card">
        <div class="card-head"><h2>Envíos</h2><span class="pill t-green">${enviados}/${lista.length} enviados</span></div>
        <div class="seg" style="margin-bottom:12px;flex-wrap:wrap">
          <button class="${UI.msgTab === 'reparto' ? 'on' : ''}" data-a="msgTab" data-v="reparto">Aviso de reparto</button>
          <button class="${UI.msgTab === 'deudas' ? 'on' : ''}" data-a="msgTab" data-v="deudas">Deudas</button>
          <button class="${UI.msgTab === 'dispensers' ? 'on' : ''}" data-a="msgTab" data-v="dispensers">Dispensers</button>
        </div>
        <div class="muted small" style="margin-bottom:4px">${esc(titulo)} · ${lista.length} clientes</div>
        <div class="list">${lista.map((c) => { const k = `${pid}-${c.id}`; const env = UI.enviados[k]; return `<div class="row">
          <div class="avatar ${avatarCls(c.id)}">${iniciales(c.nombre)}</div>
          <div class="grow"><div class="title">${esc(c.nombre)}</div><div class="muted xs">${pid === 'deuda' ? 'Debe ' + money(c.deuda) : pid === 'dispenser' ? 'Vence ' + venceTxt(c.dispenser) + ' · ' + money(c.dispenser.mensualidad) : pedidoTxt(c.pedido)}</div></div>
          ${env ? `<span class="pill t-green">Enviado</span>` : `<a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(waTexto(pid, c))}" data-a="enviado" data-k="${k}">${ic('send', 'sm')} Enviar</a>`}
        </div>`; }).join('') || '<div class="empty">No hay clientes para avisar.</div>'}</div>
        <div class="demo-note" style="margin-top:12px">${ic('msg')}<div>En la demo cada botón abre WhatsApp con el mensaje listo para elegir el contacto. Con la API de WhatsApp Business se envían todos solos, con un clic.</div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Plantillas</h2></div>
        <div class="chips" style="margin-bottom:12px">${DB.plantillas.map((p) => `<button class="chip ${p.id === UI.plantillaSel ? 'on' : ''}" data-a="plantillaSel" data-v="${p.id}">${esc(p.titulo)}</button>`).join('')}</div>
        <textarea class="input" data-in="plantilla" rows="7">${esc(pl.texto)}</textarea>
        <div class="muted xs" style="margin:8px 0 14px">Variables: <code>{nombre}</code> <code>{pedido}</code> <code>{deuda}</code> <code>{mensualidad}</code> <code>{vence}</code> · se guarda solo</div>
        <label class="f">Vista previa (${esc(ejemplo.nombre)})</label>
        <div class="wa-preview"><div class="wa-bubble" id="wa-prev">${esc(waTexto(pl.id, ejemplo))}</div></div>
      </div>
    </div>`;
  },
};

/* =========================================================
   VISTA DEL REPARTIDOR
   ========================================================= */
function repHtml() {
  const r = statsRuta();
  const P = DB.ruta.paradas;
  const f = UI.repFiltro;
  const vis = P.map((p, i) => ({ p, i })).filter(({ p }) => f === 'todos' || (f === 'pendientes' ? p.estado === 'pendiente' : p.estado !== 'pendiente'));
  const pct = r.total ? (r.visitados / r.total) * 100 : 0;
  let fab = '';
  if (!DB.ruta.iniciada) fab = `<button class="btn green rep-fab" data-a="iniciar">${ic('play')} Iniciar recorrido</button>`;
  else if (!DB.ruta.cerrada) fab = `<button class="btn primary rep-fab" data-a="cerrarRuta">${ic('flag')} Terminar ruta · ${r.visitados}/${r.total}</button>`;
  else fab = `<button class="btn rep-fab" data-a="reabrir">${ic('undo')} Ruta cerrada a las ${DB.ruta.cerrada} · Reabrir</button>`;

  return `<div class="rep">
    <div class="rep-top">
      <div class="l1">
        <div class="who"><img src="assets/icono.png" alt=""><div><h1>Ruta ${esc(ZONA_HOY.nombre)}</h1><div class="sub">${fmtLarga(HOY)} · ${NEGOCIO.repartidor}</div></div></div>
        <div style="display:flex;gap:2px">
          ${themeBtn()}
          <button class="btn sm ghost" data-a="mapaRep" aria-label="Ver mapa">${ic('map')}</button>
          <button class="btn sm ghost" data-a="go" data-to="inicio" aria-label="Vista dueño">${ic('home')}</button>
        </div>
      </div>
      <div class="rep-progress">
        <div class="nums"><span>Visitados <b>${r.visitados}/${r.total}</b></span><span>${DB.ruta.iniciada ? `GPS activo desde ${DB.ruta.iniciada}` : 'Sin iniciar'}</span></div>
        <div class="bar"><i style="width:${pct}%;background:#6FD3A0"></i></div>
      </div>
      <div class="rep-stats">
        <div><span>Cobrado</span><b class="num">${money(r.cobrado)}</b></div>
        <div><span>Fiado</span><b class="num">${money(r.fiado)}</b></div>
        <div><span>Pendientes</span><b>${r.pendiente}</b></div>
      </div>
      ${repClimaHtml()}
    </div>
    <div class="rep-body">
      <div class="rep-filter">
        ${[['pendientes', `Pendientes (${r.pendiente})`], ['visitados', `Visitados (${r.visitados})`], ['todos', `Todos (${r.total})`]].map(([v, t]) => `<button class="chip ${f === v ? 'on' : ''}" data-a="repFiltro" data-v="${v}">${t}</button>`).join('')}
      </div>
      ${vis.length ? vis.map(({ p, i }) => stopHtml(p, i)).join('') : `<div class="empty">${f === 'pendientes' ? '🎉 ¡No quedan clientes pendientes!' : 'Todavía no visitaste a nadie.'}</div>`}
    </div>
    ${fab}
  </div>`;
}
function stopHtml(p, i) {
  const c = cli(p.cid);
  const de = estadoDisp(c.dispenser);
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
  const done = p.estado !== 'pendiente';
  let res = '';
  if (done) {
    const e = ESTADOS[p.estado];
    let det = '';
    if (p.res) {
      const m = p.res.monto + (p.res.dispMonto || 0);
      det = ` · ${pedidoTxt(p.res.items)} · ${m ? `pagó ${money(m)} (${p.res.medio.toLowerCase()})` : `<b style="color:var(--red)">debe ${money(p.res.total)}</b>`}`;
    } else if (p.nota) det = ` · ${esc(p.nota)}`;
    res = `<div class="stop-result"><span><span class="pill ${e.c}">${e.t}</span> <span class="muted">${p.hora} h</span>${det}</span>
      <span style="display:flex;gap:6px">${p.estado === 'ausente' ? `<button class="btn sm wa" data-a="wa" data-id="${c.id}" data-p="ausente">${ic('msg', 'sm')} Avisar</button>` : ''}<button class="btn sm" data-a="corregir" data-i="${i}">${ic('undo', 'sm')} Corregir</button></span></div>`;
  }
  return `<div class="stop st-${p.estado} ${done ? 'done-collapsed' : ''}">
    <div class="stop-h">
      <div class="stop-n">${i + 1}</div>
      <div class="grow"><div class="name">${esc(c.nombre)}</div><div class="addr">${esc(c.direccion)}, ${esc(zona(c.zona).nombre)}</div></div>
    </div>
    <div class="stop-extra">
      <span class="pill nodot t-navy">${pedidoTxt(c.pedido)}</span>
      ${c.deuda ? `<span class="pill t-red">Debe ${money(c.deuda)}</span>` : '<span class="pill t-green">Al día</span>'}
      ${de && de !== 'al_dia' && de !== 'pendiente' ? `<span class="pill ${DISP_EST[de].c}">Dispenser ${DISP_EST[de].t.toLowerCase()}</span>` : ''}
    </div>
    ${c.obs && !done ? `<div class="stop-obs">📝 ${esc(c.obs)}</div>` : ''}
    ${done ? res : `
    <div class="stop-actions">
      <button class="btn green" data-a="entregar" data-i="${i}">${ic('check')}Entregado</button>
      <button class="btn" style="color:var(--amber);border-color:#EBC77A" data-a="ausente" data-i="${i}">${ic('user')}No estaba</button>
      <button class="btn" style="color:var(--red);border-color:#EDB0B0" data-a="noEntregado" data-i="${i}">${ic('x')}No entregado</button>
    </div>
    <div class="stop-links">
      <a class="btn sm" href="${gmaps}" target="_blank" rel="noopener">${ic('nav', 'sm')} Cómo llegar</a>
      <a class="btn sm" href="tel:${c.tel.replace(/\D/g, '')}">${ic('phone', 'sm')} Llamar</a>
      <button class="btn sm" data-a="ficha" data-id="${c.id}">${ic('user', 'sm')} Ficha</button>
    </div>`}
  </div>`;
}

/* =========================================================
   MODALES
   ========================================================= */
function openModal({ title, body, foot = '', wide = false }) {
  const root = $('#modal-root');
  const inner = `<div class="modal-head"><h2>${title}</h2><button class="btn sm ghost" data-a="close" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
  const existing = root.querySelector('.modal');
  if (existing) { existing.className = `modal ${wide ? 'wide' : ''}`; existing.innerHTML = inner; return; }
  root.innerHTML = `<div class="overlay" data-a="overlay"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${inner}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalMaps.forEach((m) => m.remove()); modalMaps = [];
  $('#modal-root').innerHTML = ''; MS = null;
  document.body.style.overflow = '';
}
function refresh() { save(); render(); }

/* ---- Ficha de cliente ---- */
function modalFicha(cid, tab = 'pedidos') {
  const c = cli(cid); if (!c) return;
  MS = { tipo: 'ficha', cid, tab };
  const de = estadoDisp(c.dispenser);
  const d = c.dispenser;
  const ultPago = c.pagos[0];
  const promedio = c.historial.length ? c.historial.reduce((t, h) => t + Object.values(h.items).reduce((a, b) => a + b, 0), 0) / c.historial.length : 0;
  let tabHtml = '';
  if (tab === 'pedidos') {
    tabHtml = c.historial.length ? `<div class="table-wrap" style="margin:0"><table><thead><tr><th>Fecha</th><th>Pedido</th><th class="right">Total</th><th>Pago</th></tr></thead><tbody>${c.historial.slice(0, 12).map((h) => `<tr><td class="num">${fmtFY(h.fecha)}</td><td class="small">${pedidoTxt(h.items)}</td><td class="right num">${money(h.total)}</td><td>${h.pagado ? '<span class="pill t-green">Pagado</span>' : '<span class="pill t-red">Fiado</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Sin pedidos todavía.</div>';
  } else if (tab === 'pagos') {
    tabHtml = c.pagos.length ? `<div class="table-wrap" style="margin:0"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Medio</th><th class="right">Monto</th></tr></thead><tbody>${c.pagos.slice(0, 12).map((p) => `<tr><td class="num">${fmtFY(p.fecha)}</td><td class="small">${esc(p.concepto)}</td><td class="small">${p.medio}</td><td class="right num"><b>${money(p.monto)}</b></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Sin pagos registrados.</div>';
  } else if (tab === 'incidencias') {
    tabHtml = c.incidencias.length ? `<div class="list">${c.incidencias.map((x) => `<div class="row"><span class="pill t-amber nodot">${fmtF(x.fecha)}</span><div class="grow">${esc(x.texto)}</div></div>`).join('')}</div>` : '<div class="empty">Sin incidencias. 👌</div>';
  } else {
    tabHtml = `<label class="f">Indicaciones para el repartidor</label><input class="input" data-in="obs" value="${esc(c.obs)}" placeholder="Ej: dejar en el portón, llamar antes…">
      <div class="field"><label class="f">Notas internas</label><textarea class="input" data-in="notas" placeholder="Cualquier dato útil del cliente…">${esc(c.notas)}</textarea></div>
      <div class="muted xs" style="margin-top:6px">Se guarda automáticamente.</div>`;
  }
  const body = `
    <div class="ficha-head">
      <div class="avatar ${avatarCls(c.id)}">${iniciales(c.nombre)}</div>
      <div style="min-width:0"><h2 style="font-size:20px">${esc(c.nombre)}</h2>
        <div class="muted small">${esc(c.direccion)} · ${esc(c.tel)}</div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${zonaPill(c.zona)}${c.comercio ? '<span class="pill nodot t-navy">Comercio</span>' : ''}<span class="pill nodot t-gray">Cliente desde ${c.desde}</span></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0">
      <button class="btn wa sm" data-a="wa" data-id="${c.id}" data-p="${c.deuda ? 'deuda' : 'reparto'}">${ic('msg', 'sm')} Enviar WhatsApp</button>
      <button class="btn sm primary" data-a="pago" data-id="${c.id}">${ic('cash', 'sm')} Registrar pago</button>
      <a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}">${ic('pin', 'sm')} Ver en mapa</a>
    </div>
    <div class="kv">
      <div><span>Pedido habitual</span><b>${pedidoTxt(c.pedido)}</b></div>
      <div><span>Próxima entrega</span><b>${proxEntrega(c)}</b></div>
      <div><span>Deuda actual</span><b style="color:${c.deuda ? 'var(--red)' : 'var(--green)'}">${money(c.deuda)}</b></div>
      <div><span>Último pago</span><b>${ultPago ? `${fmtF(ultPago.fecha)} · ${money(ultPago.monto)}` : '—'}</b></div>
      <div><span>Frecuencia</span><b style="text-transform:capitalize">${c.frecuencia}</b></div>
      <div><span>Promedio por pedido</span><b>${promedio.toFixed(1).replace('.', ',')} unidades</b></div>
      <div style="grid-column:1/-1"><span>Dispenser</span>${d ? `<b>${d.modelo} · ${money(d.mensualidad)}/mes · vence el ${venceTxt(d)}</b> <span class="pill ${DISP_EST[de].c}" style="margin-left:6px">${DISP_EST[de].t}</span>` : '<b>No tiene</b>'}</div>
    </div>
    <div class="tabs">${[['pedidos', 'Últimos pedidos'], ['pagos', 'Pagos'], ['incidencias', 'Incidencias'], ['notas', 'Notas']].map(([v, t]) => `<button class="${tab === v ? 'on' : ''}" data-a="fichaTab" data-v="${v}">${t}</button>`).join('')}</div>
    ${tabHtml}`;
  openModal({ title: 'Ficha del cliente', body, wide: true });
}

/* ---- Registrar pago ---- */
function modalPago(cid, concepto) {
  const c = cid ? cli(cid) : null;
  const esDisp = concepto === 'disp';
  MS = { tipo: 'pago', cid: cid || '', medio: 'Efectivo', concepto: esDisp ? 'disp' : 'deuda' };
  const monto = c ? (esDisp ? c.dispenser.mensualidad : c.deuda) : 0;
  const opciones = DB.clientes.slice().sort((a, b) => b.deuda - a.deuda || a.nombre.localeCompare(b.nombre));
  const body = `
    <div class="field"><label class="f">Cliente</label>
      <select class="input" data-in="pagoCli">${c ? '' : '<option value="">Elegí un cliente…</option>'}${opciones.map((o) => `<option value="${o.id}" ${o.id === cid ? 'selected' : ''}>${esc(o.nombre)}${o.deuda ? ' · debe ' + money(o.deuda) : ''}</option>`).join('')}</select></div>
    <div class="field"><label class="f">Concepto</label>
      <div class="seg" id="pago-conc"><button class="${!esDisp ? 'on' : ''}" data-a="pagoConc" data-v="deuda">Entregas / deuda</button><button class="${esDisp ? 'on' : ''}" data-a="pagoConc" data-v="disp">Mensualidad dispenser</button></div></div>
    <div class="field"><label class="f">Monto</label><input class="input num" id="pago-monto" type="number" inputmode="numeric" min="0" step="100" value="${monto || ''}" placeholder="0"></div>
    <div class="field"><label class="f">Medio de pago</label>
      <div class="seg" id="pago-medio">${MEDIOS.map((m) => `<button class="${m === 'Efectivo' ? 'on' : ''}" data-a="pagoMedio" data-v="${m}">${m}</button>`).join('')}</div></div>
    <div class="muted small" id="pago-info" style="margin-top:14px">${pagoInfo()}</div>`;
  openModal({ title: 'Registrar pago', body, foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn green" data-a="confirmPago">${ic('check', 'sm')} Registrar</button>` });
}
function pagoInfo() {
  const c = MS && MS.cid ? cli(MS.cid) : null;
  if (!c) return '';
  if (MS.concepto === 'disp') return c.dispenser ? `Dispenser ${c.dispenser.modelo} · ${money(c.dispenser.mensualidad)}/mes · ${DISP_EST[estadoDisp(c.dispenser)].t}` : 'Este cliente no tiene dispenser.';
  return `Deuda actual: <b style="color:${c.deuda ? 'var(--red)' : 'var(--green)'}">${money(c.deuda)}</b>`;
}

/* ---- WhatsApp ---- */
function modalWA(cid, pid) {
  const c = cli(cid);
  MS = { tipo: 'wa', cid, pid };
  const texto = waTexto(pid, c);
  const body = `
    <div class="small" style="margin-bottom:10px">Para: <b>${esc(c.nombre)}</b> · ${esc(c.tel)}</div>
    <div class="chips" style="margin-bottom:12px">${DB.plantillas.map((p) => `<button class="chip ${p.id === pid ? 'on' : ''}" data-a="waPl" data-v="${p.id}">${esc(p.titulo)}</button>`).join('')}</div>
    <div class="wa-preview"><div class="wa-bubble">${esc(texto)}</div></div>
    <div class="muted xs" style="margin-top:10px">En la demo se abre WhatsApp para elegir el contacto. En la versión final va directo al número del cliente.</div>`;
  openModal({ title: 'Enviar WhatsApp', body, foot: `<button class="btn" data-a="close">Cerrar</button><a class="btn wa" target="_blank" rel="noopener" href="${waLink(texto)}" data-a="closeLater">${ic('send', 'sm')} Abrir WhatsApp</a>` });
}

/* ---- Entrega (repartidor) ---- */
function modalEntrega(i) {
  const p = DB.ruta.paradas[i]; const c = cli(p.cid);
  MS = { tipo: 'entrega', i, items: { b20: c.pedido.b20 || 0, b12: c.pedido.b12 || 0, sif: c.pedido.sif || 0 }, pago: 'pago', medio: 'Efectivo', monto: 0, disp: false };
  drawEntrega();
}
function montoEntrega() {
  const c = cli(DB.ruta.paradas[MS.i].cid); const total = totalItems(MS.items);
  if (MS.pago === 'pago') return total;
  if (MS.pago === 'pagodeuda') return total + c.deuda;
  if (MS.pago === 'debe') return 0;
  return Math.max(0, Number(MS.monto) || 0);
}
function drawEntrega() {
  const p = DB.ruta.paradas[MS.i]; const c = cli(p.cid);
  const total = totalItems(MS.items);
  const de = estadoDisp(c.dispenser);
  const opts = [['pago', `Pagó ${money(total)}`]];
  if (c.deuda) opts.push(['pagodeuda', `Pagó todo ${money(total + c.deuda)}`]);
  opts.push(['debe', 'Queda debiendo'], ['parcial', 'Otro monto']);
  const cobra = montoEntrega() + (MS.disp && c.dispenser ? c.dispenser.mensualidad : 0);
  const body = `
    <div class="small muted" style="margin-bottom:6px">${esc(c.nombre)} · ${esc(c.direccion)}</div>
    ${Object.keys(PRODUCTOS).map((k) => `<div class="prod-line"><div><b>${PRODUCTOS[k].nombre}</b><div class="muted xs">${money(PRODUCTOS[k].precio)} c/u</div></div>
      <div class="qty"><button data-a="qty" data-k="${k}" data-d="-1">−</button><span class="num">${MS.items[k]}</span><button data-a="qty" data-k="${k}" data-d="1">+</button></div></div>`).join('')}
    <div class="total-box"><span>Total de esta entrega</span><b class="num">${money(total)}</b></div>
    ${c.deuda ? `<div class="small" style="margin-top:8px">Deuda anterior: <b style="color:var(--red)">${money(c.deuda)}</b></div>` : ''}
    <div class="field" style="margin-top:16px"><label class="f">¿Cómo pagó?</label>
      <div class="big-choice" style="grid-template-columns:repeat(2,1fr)">${opts.map(([v, t]) => `<button class="${MS.pago === v ? 'on' : ''}" data-a="entPago" data-v="${v}">${t}</button>`).join('')}</div>
      ${MS.pago === 'parcial' ? `<input class="input num" style="margin-top:8px" type="number" inputmode="numeric" data-in="entMonto" value="${MS.monto || ''}" placeholder="Monto que pagó">` : ''}
    </div>
    ${MS.pago !== 'debe' ? `<div class="field"><label class="f">Medio de pago</label><div class="seg">${MEDIOS.map((m) => `<button class="${MS.medio === m ? 'on' : ''}" data-a="entMedio" data-v="${m}">${m}</button>`).join('')}</div></div>` : ''}
    ${c.dispenser && de !== 'al_dia' ? `<label class="small" style="display:flex;gap:8px;align-items:center;margin-top:14px;padding:10px 12px;border-radius:10px;background:var(--amber-soft);cursor:pointer"><input type="checkbox" data-a="entDisp" ${MS.disp ? 'checked' : ''}> Cobrar también la mensualidad del dispenser (${money(c.dispenser.mensualidad)} · ${DISP_EST[de].t.toLowerCase()})</label>` : ''}
    <div class="field"><label class="f">Observación (opcional)</label><input class="input" data-in="entNota" placeholder="Ej: dejó los envases en la puerta"></div>`;
  openModal({
    title: 'Registrar entrega', body,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn green" data-a="confirmEntrega" id="btn-ent">${ic('check', 'sm')} Confirmar · cobra ${money(cobra)}</button>`,
  });
}

/* ---- No estaba / No entregado ---- */
function modalNoEntrega(i, estado) {
  const c = cli(DB.ruta.paradas[i].cid);
  MS = { tipo: 'noent', i, estado, motivo: estado === 'ausente' ? 'No atendió nadie' : 'Canceló el pedido' };
  const motivos = estado === 'ausente'
    ? ['No atendió nadie', 'Casa cerrada', 'Pidió volver más tarde']
    : ['Canceló el pedido', 'Tenía stock', 'Dirección incorrecta', 'Sin stock en el camión'];
  const body = `<div class="small muted" style="margin-bottom:12px">${esc(c.nombre)} · ${esc(c.direccion)}</div>
    <label class="f">Motivo</label>
    <div class="chips" id="motivos">${motivos.map((m) => `<button class="chip ${m === MS.motivo ? 'on' : ''}" data-a="motivo" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
    ${estado === 'ausente' ? '<div class="demo-note" style="margin-top:14px"><div>Después podés avisarle por WhatsApp con un toque desde la tarjeta del cliente.</div></div>' : ''}`;
  openModal({
    title: estado === 'ausente' ? 'Cliente no estaba' : 'No se entregó',
    body,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn ${estado === 'ausente' ? '' : 'red'}" data-a="confirmNoEnt" style="${estado === 'ausente' ? 'background:var(--amber);color:#fff;border-color:var(--amber)' : ''}">Confirmar</button>`,
  });
}

/* ---- Cerrar ruta ---- */
function modalCerrar() {
  const r = statsRuta();
  const pend = DB.ruta.paradas.filter((p) => p.estado === 'pendiente');
  const body = `
    <div class="summary-big"><div class="ring num">${r.visitados}<small>/${r.total}</small></div><div class="muted">clientes visitados</div></div>
    ${pend.length ? `<div style="background:var(--red-soft);border-radius:12px;padding:12px 14px;margin-bottom:14px">
      <b style="color:var(--red)">🔴 ${pend.length} ${pend.length === 1 ? 'cliente quedó' : 'clientes quedaron'} sin visitar</b>
      <div class="small" style="margin-top:6px;line-height:1.7">${pend.map((p) => { const c = cli(p.cid); return `• ${esc(c.nombre)} — ${esc(c.direccion)}`; }).join('<br>')}</div>
    </div>` : '<div class="demo-note" style="margin-bottom:14px">✅ Visitaste a todos los clientes de la ruta.</div>'}
    <div class="kv">
      <div><span>Entregados</span><b>${r.entregado}</b></div>
      <div><span>No estaban / no entregados</span><b>${r.ausente} / ${r.no_entregado}</b></div>
      <div><span>Cobrado en efectivo</span><b>${money(r.efectivo)}</b></div>
      <div><span>Transferencia / MP</span><b>${money(r.transf)}</b></div>
      <div><span>Quedó fiado</span><b style="color:var(--red)">${money(r.fiado)}</b></div>
      <div><span>Entregado</span><b>${pedidoTxt({ b20: r.b20, b12: r.b12, sif: r.sif })}</b></div>
    </div>`;
  openModal({
    title: 'Terminar ruta', body,
    foot: `${pend.length ? '<button class="btn" data-a="close">Volver a la ruta</button>' : ''}<button class="btn primary" data-a="confirmCerrar">${ic('flag', 'sm')} Cerrar y enviar al dueño</button>`,
  });
}

/* ---- Mapa en modal ---- */
function modalMapa(zid) {
  const z = zid ? zona(zid) : ZONA_HOY;
  openModal({ title: `${zid ? 'Recorrido' : 'Ruta de hoy'} · ${esc(z.nombre)}`, body: '<div id="map-modal" class="map" style="height:60vh"></div>', wide: true });
  setTimeout(() => (zid ? mountZonaMap('map-modal', zid) : mountRutaMap('map-modal', modalMaps)), 30);
}

/* ---- Punto de partida ---- */
function modalPartida() {
  const p = planta();
  MS = { tipo: 'partida', lat: p.lat, lng: p.lng, marker: null, map: null };
  openModal({
    title: 'Punto de partida del reparto',
    wide: true,
    body: `<div class="demo-note" style="margin-bottom:14px">${ic('pin')}<div>Marcá dónde está tu negocio. Desde acá arrancan todas las rutas, se ordenan los recorridos y se toma el clima. Podés usar la ubicación de este celular/tablet, tocar el mapa o arrastrar el pin.</div></div>
      <div class="field"><label class="f">Nombre del lugar</label><input class="input" id="pp-nombre" value="${esc(p.nombre)}"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px">
        <button class="btn teal" data-a="ppGeo">${ic('nav', 'sm')} Usar mi ubicación actual</button>
        <span class="muted small" id="pp-coords" style="align-self:center">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</span>
      </div>
      <div id="map-partida" class="map" style="height:48vh;min-height:280px"></div>`,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn primary" data-a="ppGuardar">${ic('check', 'sm')} Guardar punto de partida</button>`,
  });
  setTimeout(() => {
    const el = document.getElementById('map-partida');
    if (!el || !window.L) { if (el) el.innerHTML = '<div class="empty">El mapa necesita conexión. Igual podés usar tu ubicación actual.</div>'; return; }
    const m = L.map(el); tileLayer().addTo(m); m.setView([p.lat, p.lng], 14);
    const mk = L.marker([p.lat, p.lng], {
      draggable: true,
      icon: L.divIcon({ className: '', html: '<div class="home-pin" style="width:38px;height:38px"><img src="assets/icono.png" alt="" style="width:30px;height:30px"></div>', iconSize: [38, 38], iconAnchor: [19, 19] }),
    }).addTo(m);
    mk.on('dragend', () => { const ll = mk.getLatLng(); ppSet(ll.lat, ll.lng, false); });
    m.on('click', (e) => ppSet(e.latlng.lat, e.latlng.lng, false));
    MS.marker = mk; MS.map = m; modalMaps.push(m);
    setTimeout(() => m.invalidateSize(), 80);
  }, 30);
}
function ppSet(lat, lng, centrar) {
  if (!MS || MS.tipo !== 'partida') return;
  MS.lat = lat; MS.lng = lng;
  if (MS.marker) MS.marker.setLatLng([lat, lng]);
  if (MS.map && centrar) MS.map.setView([lat, lng], 16);
  const c = $('#pp-coords'); if (c) c.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/* ---- Nuevo cliente ---- */
function modalNuevoCliente() {
  MS = { tipo: 'nuevo' };
  const body = `
    <div class="field"><label class="f">Nombre y apellido / comercio</label><input class="input" id="nc-nombre" placeholder="Ej: Roberto Sánchez"></div>
    <div class="grid g2" style="gap:12px;margin-top:14px">
      <div><label class="f">Teléfono</label><input class="input" id="nc-tel" inputmode="tel" placeholder="341 555-1234"></div>
      <div><label class="f">Zona / día de reparto</label><select class="input" id="nc-zona">${ZONAS.map((z) => `<option value="${z.id}">${esc(z.nombre)} · ${DIAS[z.dia]}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label class="f">Dirección</label><input class="input" id="nc-dir" placeholder="Calle y número"></div>
    <div class="grid g3" style="gap:12px;margin-top:14px">
      ${Object.keys(PRODUCTOS).map((k) => `<div><label class="f">${PRODUCTOS[k].nombre}</label><input class="input num" id="nc-${k}" type="number" min="0" value="${k === 'b20' ? 2 : 0}"></div>`).join('')}
    </div>
    <div class="field"><label class="f">Indicaciones para el repartidor</label><input class="input" id="nc-obs" placeholder="Ej: llamar antes"></div>`;
  openModal({ title: 'Nuevo cliente', body, foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn primary" data-a="guardarCliente">Guardar cliente</button>` });
}

/* ---- Stock ---- */
function modalStockEdit(id) {
  const s = DB.stock.find((x) => x.id === id);
  MS = { tipo: 'stock', id };
  openModal({
    title: esc(s.nombre),
    body: `<div class="grid g2" style="gap:12px"><div><label class="f">Stock actual (${s.unidad})</label><input class="input num" id="st-act" type="number" min="0" value="${s.actual}"></div>
      <div><label class="f">Stock mínimo (${s.unidad})</label><input class="input num" id="st-min" type="number" min="0" value="${s.minimo}"></div></div>
      <div class="muted small" style="margin-top:12px">Cuando el actual baja del mínimo, aparece automáticamente en “Para comprar”.</div>`,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn primary" data-a="guardarStock">Guardar</button>`,
  });
}

/* ---- Producción ---- */
function modalNuevoLote() {
  openModal({
    title: 'Nuevo lote de limpieza',
    body: `<div class="field"><label class="f">Tipo de envase</label><select class="input" id="lt-tipo"><option>Bidones 20 L</option><option>Bidones 12 L</option><option>Sifones</option></select></div>
      <div class="field"><label class="f">Cantidad ingresada</label><input class="input num" id="lt-cant" type="number" min="1" value="60"></div>`,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn primary" data-a="guardarLote">Crear lote</button>`,
  });
}
function modalFinLote(id) {
  const l = DB.lotes.find((x) => x.id === id);
  MS = { tipo: 'finlote', id };
  openModal({
    title: `Lote ${esc(l.id)} listo`,
    body: `<div class="small" style="margin-bottom:12px">${esc(l.tipo)} · ${l.cantidad} unidades</div>
      <label class="f">¿Cuántos se descartaron?</label><input class="input num" id="lt-desc" type="number" min="0" max="${l.cantidad}" value="0">
      <div class="muted small" style="margin-top:10px">Los aprobados se suman al stock listo para repartir.</div>`,
    foot: `<button class="btn" data-a="close">Cancelar</button><button class="btn green" data-a="confirmFinLote">${ic('check', 'sm')} Confirmar</button>`,
  });
}

/* ---- Menú "Más" (celular) ---- */
function modalMas() {
  const b = badges();
  const items = NAV.slice(4);
  openModal({
    title: 'Más opciones',
    body: `<div class="alerts">${items.map((n) => `<a class="alert" href="#/${n.id}"><span class="ic t-navy">${ic(n.i, 'sm')}</span><div><b style="font-size:15px">${n.t}</b>${b[n.id] ? ` <span class="pill t-red">${b[n.id]}</span>` : ''}</div><span class="go">${ic('chev', 'sm')}</span></a>`).join('')}
      <a class="alert" href="#/repartidor"><span class="ic t-teal">${ic('truck', 'sm')}</span><div><b style="font-size:15px">Vista del repartidor</b></div><span class="go">${ic('chev', 'sm')}</span></a>
      <button class="alert" data-a="reset" style="text-align:left;width:100%;cursor:pointer"><span class="ic t-gray">${ic('refresh', 'sm')}</span><div><b style="font-size:15px">Reiniciar demo</b></div></button>
      <a class="alert" href="#/"><span class="ic t-gray">${ic('logout', 'sm')}</span><div><b style="font-size:15px">Salir</b></div></a>
    </div>`,
  });
}

/* =========================================================
   CLIMA (Open-Meteo, sin clave) + MAPA DEL TIEMPO (Windy)
   ========================================================= */
const WX = { estado: 'cargando', data: null };
function wmo(c) {
  if (c === 0) return ['☀️', 'Despejado'];
  if (c === 1) return ['🌤️', 'Mayormente despejado'];
  if (c === 2) return ['⛅', 'Parcialmente nublado'];
  if (c === 3) return ['☁️', 'Nublado'];
  if (c === 45 || c === 48) return ['🌫️', 'Niebla'];
  if (c >= 51 && c <= 57) return ['🌦️', 'Llovizna'];
  if (c >= 61 && c <= 67) return ['🌧️', c >= 65 ? 'Lluvia fuerte' : 'Lluvia'];
  if (c >= 71 && c <= 77) return ['🌨️', 'Nieve'];
  if (c >= 80 && c <= 82) return ['🌦️', 'Chaparrones'];
  if (c >= 95) return ['⛈️', 'Tormenta'];
  return ['🌡️', '—'];
}
async function cargarClima() {
  WX.estado = 'cargando';
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 9000);
  try {
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + planta().lat + '&longitude=' + planta().lng +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
      '&hourly=precipitation_probability,temperature_2m,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max' +
      '&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=7';
    const r = await fetch(u, { signal: ctrl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    WX.data = await r.json(); WX.estado = 'ok';
  } catch (e) { WX.estado = 'error'; }
  clearTimeout(to);
  if (['inicio', 'clima', 'repartidor'].includes(ruta().page)) render();
}
function wxDia(fechaIso) {
  const d = WX.data.daily; const i = d.time.indexOf(fechaIso);
  if (i < 0) return null;
  return { i, fecha: fechaIso, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], lluvia: d.precipitation_probability_max[i], mm: d.precipitation_sum[i], viento: d.wind_speed_10m_max[i] };
}
function climaCardHtml() {
  const head = `<div class="card-head"><h2>Clima</h2><a class="btn sm" href="#/clima">${ic('map', 'sm')} Mapa del tiempo</a></div>`;
  if (WX.estado === 'cargando') return `<div class="card">${head}<div class="muted small">Cargando pronóstico…</div></div>`;
  if (WX.estado === 'error') return `<div class="card">${head}<div class="muted small">No se pudo cargar el pronóstico. <button class="btn sm" data-a="wxRetry">Reintentar</button></div></div>`;
  const c = WX.data.current; const [e, t] = wmo(c.weather_code);
  const hoy = wxDia(HOY_ISO); const m = manana(); const dm = wxDia(iso(m.fecha));
  return `<div class="card">${head}
    <div class="wx-mini"><span class="wx-emoji">${e}</span><div><div class="wx-temp num">${Math.round(c.temperature_2m)}°</div><div class="muted small">${t} · ${esc(planta().nombre)}</div></div></div>
    <div class="small" style="margin-top:10px">Lluvia hoy <b>${hoy ? hoy.lluvia : '—'}%</b> · ${DIAS[m.fecha.getDay()].toLowerCase()} <b>${dm ? dm.lluvia : '—'}%</b> · viento ${Math.round(c.wind_speed_10m)} km/h</div>
    ${dm && dm.lluvia >= 60 ? `<div class="stop-obs">🌧️ ${DIAS[m.fecha.getDay()]} puede llover en el reparto de ${esc(m.zona.nombre)}. Conviene avisar a los clientes.</div>` : ''}
  </div>`;
}
function repClimaHtml() {
  if (WX.estado !== 'ok') return '';
  const c = WX.data.current; const [e, t] = wmo(c.weather_code); const h = wxDia(HOY_ISO);
  const warn = h && h.lluvia >= 60;
  return `<div class="rep-wx ${warn ? 'warn' : ''}"><span>${e} ${Math.round(c.temperature_2m)}° · ${t}</span><span>Lluvia hoy ${h ? h.lluvia : '—'}%${warn ? ' · llevá lona 🧥' : ''}</span></div>`;
}
function windyUrl() {
  const p = new URLSearchParams({
    lat: String(planta().lat), lon: String(planta().lng), detailLat: String(planta().lat), detailLon: String(planta().lng),
    zoom: '9', level: 'surface', overlay: UI.wxLayer, product: 'ecmwf', menu: '', message: 'true', marker: 'true',
    calendar: 'now', pressure: '', type: 'map', location: 'coordinates', detail: '', metricWind: 'km/h', metricTemp: '°C', radarRange: '-1',
  });
  return 'https://embed.windy.com/embed2.html?' + p.toString();
}
PAGES.clima = {
  html() {
    let body = '';
    if (WX.estado === 'cargando') body = '<div class="card"><div class="empty">Cargando pronóstico…</div></div>';
    else if (WX.estado === 'error') body = '<div class="card"><div class="empty">No se pudo cargar el pronóstico (revisá la conexión).<br><br><button class="btn" data-a="wxRetry">Reintentar</button></div></div>';
    else {
      const c = WX.data.current; const [e, t] = wmo(c.weather_code); const h = wxDia(HOY_ISO) || wxDia(WX.data.daily.time[0]);
      const H = WX.data.hourly;
      const horas = H.time.map((x, i) => ({ x, i })).filter(({ x }) => x.startsWith(HOY_ISO) && +x.slice(11, 13) >= 6 && +x.slice(11, 13) <= 21);
      const days = WX.data.daily.time.map((f) => {
        const d = wxDia(f); const dt = new Date(f + 'T12:00:00'); const z = ZONAS.find((zz) => zz.dia === dt.getDay());
        const [em] = wmo(d.code); const warn = z && d.lluvia >= 60;
        return `<div class="wx-day ${f === HOY_ISO ? 'today' : ''} ${warn ? 'warn' : ''}">
          <div class="d">${f === HOY_ISO ? 'Hoy' : DIAS[dt.getDay()].slice(0, 3) + ' ' + dt.getDate()}</div>
          <div class="z">${z ? esc(z.nombre) : 'Sin reparto'}</div>
          <div class="e">${em}</div>
          <div class="t num">${Math.round(d.max)}° <span>${Math.round(d.min)}°</span></div>
          <div class="r">💧 ${d.lluvia}%${d.mm ? ` · ${d.mm.toFixed(1).replace('.', ',')} mm` : ''}</div>
          ${warn ? '<div class="xs" style="color:var(--amber);font-weight:700;margin-top:4px">⚠️ Reparto con lluvia</div>' : ''}
        </div>`;
      }).join('');
      body = `
      <div class="grid g3">
        <div class="card">
          <div class="card-head"><h2>Ahora</h2><span class="muted xs">Open-Meteo</span></div>
          <div class="wx-now"><span class="wx-emoji">${e}</span><div><div class="wx-temp num">${Math.round(c.temperature_2m)}°</div><div class="muted small">${t}</div></div></div>
          <div class="kv" style="margin-top:14px">
            <div><span>Sensación</span><b>${Math.round(c.apparent_temperature)}°</b></div>
            <div><span>Humedad</span><b>${c.relative_humidity_2m}%</b></div>
            <div><span>Viento</span><b>${Math.round(c.wind_speed_10m)} km/h</b></div>
            <div><span>Lluvia hoy</span><b>${h.lluvia}%</b></div>
          </div>
        </div>
        <div class="card span2">
          <div class="card-head"><h2>Probabilidad de lluvia hoy</h2><span class="muted small">de 6 a 21 h</span></div>
          <div class="bars dense">${horas.map(({ x, i }) => `<div class="b"><em>${H.precipitation_probability[i]}%</em><i style="height:${Math.max(2, H.precipitation_probability[i])}%;background:var(--teal)"></i><span>${x.slice(11, 13)}</span></div>`).join('')}</div>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>Pronóstico de la semana y rutas</h2></div>
        <div class="wx-days">${days}</div>
      </div>`;
    }
    const capas = [['rain', 'Lluvia'], ['wind', 'Viento'], ['temp', 'Temperatura'], ['clouds', 'Nubes'], ['thunder', 'Tormentas']];
    return `
    <div class="page-head">
      <div><h1>Clima y mapa del tiempo</h1><div class="sub">Alrededores de ${esc(planta().nombre)} · para planificar el reparto</div></div>
    </div>
    ${body}
    <div class="card" style="margin-top:16px">
      <div class="card-head" style="flex-wrap:wrap"><h2>Mapa del tiempo</h2>
        <div class="seg" style="flex-wrap:wrap">${capas.map(([v, t]) => `<button class="${UI.wxLayer === v ? 'on' : ''}" data-a="wxLayer" data-v="${v}">${t}</button>`).join('')}</div></div>
      <iframe id="wx-frame" class="wx-frame" src="${windyUrl()}" title="Mapa del tiempo" loading="lazy" allowfullscreen></iframe>
      <div class="muted xs" style="margin-top:8px">Mapa interactivo de Windy.com: podés mover la línea de tiempo para ver cómo viene la lluvia en las próximas horas.</div>
    </div>`;
  },
};

/* =========================================================
   ACCIONES
   ========================================================= */
const A = {
  go: (el) => { location.hash = '#/' + el.dataset.to; },
  close: () => closeModal(),
  closeLater: () => setTimeout(closeModal, 150),
  overlay: (el, ev) => { if (ev.target === el) closeModal(); },
  mas: () => modalMas(),
  theme: () => {
    const t = temaOscuro() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('naturaqua-theme', t); } catch (e) { /* nada */ }
    const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = t === 'dark' ? '#0B1828' : '#1B365D';
    if ($('#modal-root .overlay') && ruta().page !== '') { /* mantener modal abierto */ }
    render();
  },
  wxRetry: () => cargarClima(),
  puntoPartida: () => modalPartida(),
  ppGeo: (el) => {
    if (!navigator.geolocation) return toast('Este dispositivo no permite obtener la ubicación');
    el.disabled = true; const txt = el.innerHTML; el.textContent = 'Buscando ubicación…';
    navigator.geolocation.getCurrentPosition(
      (pos) => { el.disabled = false; el.innerHTML = txt; ppSet(pos.coords.latitude, pos.coords.longitude, true); toast(`📍 Ubicación encontrada (±${Math.round(pos.coords.accuracy)} m)`); },
      () => { el.disabled = false; el.innerHTML = txt; toast('No se pudo obtener la ubicación. Revisá los permisos o marcá en el mapa.'); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  },
  ppGuardar: () => {
    const nombre = ($('#pp-nombre').value || '').trim() || 'Mi negocio';
    DB.config = DB.config || {};
    DB.config.planta = { nombre, lat: MS.lat, lng: MS.lng };
    // reordenar lo pendiente desde el nuevo punto de partida
    const P = DB.ruta.paradas; const hechas = P.filter((p) => p.estado !== 'pendiente'); const pend = P.filter((p) => p.estado === 'pendiente');
    const desde = hechas.length ? cli(hechas[hechas.length - 1].cid) : planta();
    DB.ruta.paradas = [...hechas, ...ordenarNN(pend.map((p) => ({ p, lat: cli(p.cid).lat, lng: cli(p.cid).lng })), desde).map((x) => x.p)];
    closeModal(); refresh(); cargarClima();
    toast(`✓ Punto de partida: ${nombre}. Rutas reordenadas.`);
  },
  wxLayer: (el) => { UI.wxLayer = el.dataset.v; const f = $('#wx-frame'); if (f) f.src = windyUrl(); el.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el)); },
  tip: () => { UI.tipCerrado = true; render(); },
  reset: () => openModal({
    title: 'Reiniciar demo',
    body: '<p style="margin:0">Se borran todos los cambios y la demo vuelve a los datos de ejemplo iniciales.</p>',
    foot: '<button class="btn" data-a="close">Cancelar</button><button class="btn red" data-a="confirmReset">Reiniciar</button>',
  }),
  confirmReset: () => {
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* nada */ }
    DB = null; load(); save(); closeModal(); UI.enviados = {};
    if (ruta().page === 'repartidor' || ruta().page === '') render(); else { location.hash = '#/inicio'; render(); }
    toast('Demo reiniciada');
  },

  ficha: (el) => modalFicha(el.dataset.id),
  fichaTab: (el) => modalFicha(MS.cid, el.dataset.v),
  wa: (el) => modalWA(el.dataset.id, el.dataset.p || 'reparto'),
  waPl: (el) => modalWA(MS.cid, el.dataset.v),
  pago: (el) => modalPago(el.dataset.id || null, el.dataset.c === 'disp' ? 'disp' : null),
  pagoMedio: (el) => { MS.medio = el.dataset.v; el.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el)); },
  pagoConc: (el) => {
    MS.concepto = el.dataset.v; el.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el));
    const c = MS.cid ? cli(MS.cid) : null;
    if (c) $('#pago-monto').value = MS.concepto === 'disp' ? (c.dispenser ? c.dispenser.mensualidad : '') : (c.deuda || '');
    $('#pago-info').innerHTML = pagoInfo();
  },
  confirmPago: () => {
    const c = MS.cid ? cli(MS.cid) : null;
    const monto = Number($('#pago-monto').value) || 0;
    if (!c) return toast('Elegí un cliente');
    if (monto <= 0) return toast('Ingresá un monto');
    if (MS.concepto === 'disp') {
      if (!c.dispenser) return toast('Este cliente no tiene dispenser');
      c.dispenser.pagadoMes = true;
      c.pagos.unshift({ fecha: HOY_ISO, monto, medio: MS.medio, concepto: 'Mensualidad dispenser' });
    } else {
      c.deuda = Math.max(0, c.deuda - monto);
      c.pagos.unshift({ fecha: HOY_ISO, monto, medio: MS.medio, concepto: 'Pago de cuenta' });
    }
    closeModal(); refresh(); toast(`✓ Pago de ${money(monto)} registrado · ${c.nombre}`);
  },

  // Reparto (dueño)
  repTab: (el) => { UI.repartoTab = el.dataset.v; render(); },
  mapaZona: (el) => modalMapa(el.dataset.z),
  optimizar: () => {
    const P = DB.ruta.paradas;
    const hechas = P.filter((p) => p.estado !== 'pendiente');
    const pend = P.filter((p) => p.estado === 'pendiente');
    const ult = hechas.length ? cli(hechas[hechas.length - 1].cid) : planta();
    const kmAntes = kmRuta(P);
    const orden = ordenarNN(pend.map((p) => ({ p, lat: cli(p.cid).lat, lng: cli(p.cid).lng })), ult).map((x) => x.p);
    DB.ruta.paradas = [...hechas, ...orden];
    const kmDesp = kmRuta(DB.ruta.paradas);
    refresh();
    toast(`Ruta ordenada · ${kmDesp.toFixed(1).replace('.', ',')} km estimados${kmAntes - kmDesp > 0.05 ? ` (${(kmAntes - kmDesp).toFixed(1).replace('.', ',')} km menos)` : ''}`);
  },

  // Clientes
  cliZona: (el) => { UI.cliZona = el.dataset.v; render(); },
  nuevoCliente: () => modalNuevoCliente(),
  guardarCliente: () => {
    const nombre = $('#nc-nombre').value.trim();
    if (!nombre) return toast('Poné el nombre del cliente');
    const z = zona($('#nc-zona').value);
    const pedido = {};
    Object.keys(PRODUCTOS).forEach((k) => { const v = Number($('#nc-' + k).value) || 0; if (v > 0) pedido[k] = v; });
    const id = 'c' + (Math.max(...DB.clientes.map((c) => parseInt(c.id.slice(1), 10))) + 1);
    DB.clientes.unshift({
      id, nombre, comercio: false, zona: z.id, direccion: $('#nc-dir').value.trim() || 'Sin dirección',
      lat: z.lat + (Math.random() - 0.5) * 0.02, lng: z.lng + (Math.random() - 0.5) * 0.025,
      tel: $('#nc-tel').value.trim() || '—', pedido: Object.keys(pedido).length ? pedido : { b20: 1 },
      frecuencia: 'semanal', desde: String(HOY.getFullYear()), deuda: 0, dispenser: null,
      obs: $('#nc-obs').value.trim(), historial: [], pagos: [], incidencias: [], notas: '',
    });
    closeModal(); refresh(); toast(`✓ ${nombre} agregado a ${z.nombre}`); modalFicha(id);
  },

  // Stock
  stockCat: (el) => { UI.stockCat = el.dataset.v; render(); },
  stockComprar: (el) => { UI.stockComprar = el.checked; render(); },
  stockAdj: (el) => { const s = DB.stock.find((x) => x.id === el.dataset.id); s.actual = Math.max(0, s.actual + Number(el.dataset.d)); refresh(); },
  stockEdit: (el) => modalStockEdit(el.dataset.id),
  guardarStock: () => {
    const s = DB.stock.find((x) => x.id === MS.id);
    s.actual = Math.max(0, Number($('#st-act').value) || 0); s.minimo = Math.max(0, Number($('#st-min').value) || 0);
    closeModal(); refresh(); toast('✓ Stock actualizado');
  },

  // Dispensers
  dispFiltro: (el) => { UI.dispFiltro = el.dataset.v; render(); },

  // Producción
  nuevoLote: () => modalNuevoLote(),
  guardarLote: () => {
    const cant = Number($('#lt-cant').value) || 0;
    if (cant <= 0) return toast('Ingresá la cantidad');
    const n = Math.max(...DB.lotes.map((l) => parseInt(l.id.replace(/\D/g, ''), 10))) + 1;
    DB.lotes.unshift({ id: 'L-' + String(n).padStart(4, '0'), fecha: HOY_ISO, tipo: $('#lt-tipo').value, cantidad: cant, etapa: 0, descartados: 0, historial: [`${HOY_ISO} ${horaAhora()} Ingreso`] });
    closeModal(); refresh(); toast('✓ Lote creado');
  },
  avanzarLote: (el) => {
    const l = DB.lotes.find((x) => x.id === el.dataset.id);
    if (l.etapa === 3) return modalFinLote(l.id);
    l.etapa++; l.historial.push(`${HOY_ISO} ${horaAhora()} ${ETAPAS[l.etapa]}`);
    refresh(); toast(`Lote ${l.id}: ${ETAPAS[l.etapa].toLowerCase()} ✓`);
  },
  confirmFinLote: () => {
    const l = DB.lotes.find((x) => x.id === MS.id);
    const desc = Math.min(l.cantidad, Math.max(0, Number($('#lt-desc').value) || 0));
    l.etapa = 4; l.descartados = desc;
    l.historial.push(`${HOY_ISO} ${horaAhora()} Listos${desc ? ` (${desc} descartados)` : ''}`);
    const ok = l.cantidad - desc;
    if (l.tipo === 'Bidones 20 L') aplicarStock({ s1: ok, s2: -l.cantidad });
    if (l.tipo === 'Bidones 12 L') aplicarStock({ s3: ok });
    if (l.tipo === 'Sifones') aplicarStock({ s4: ok, s5: -l.cantidad });
    closeModal(); refresh(); toast(`✓ ${ok} envases listos sumados al stock`);
  },

  // Mensajes
  msgTab: (el) => { UI.msgTab = el.dataset.v; render(); },
  msgReparto: () => { UI.msgTab = 'reparto'; },
  msgDeudas: () => { UI.msgTab = 'deudas'; },
  plantillaSel: (el) => { UI.plantillaSel = el.dataset.v; render(); },
  enviado: (el) => { UI.enviados[el.dataset.k] = true; setTimeout(render, 300); },

  // Repartidor
  repFiltro: (el) => { UI.repFiltro = el.dataset.v; render(); },
  mapaRep: () => modalMapa(null),
  iniciar: () => { DB.ruta.iniciada = horaAhora(); refresh(); activarGPS(false); toast('📍 GPS activado · ¡buen recorrido!'); },
  entregar: (el) => modalEntrega(Number(el.dataset.i)),
  qty: (el) => { const k = el.dataset.k; MS.items[k] = Math.max(0, MS.items[k] + Number(el.dataset.d)); drawEntrega(); },
  entPago: (el) => { MS.pago = el.dataset.v; drawEntrega(); },
  entMedio: (el) => { MS.medio = el.dataset.v; drawEntrega(); },
  entDisp: (el) => { MS.disp = el.checked; drawEntrega(); },
  confirmEntrega: () => {
    if (!Object.values(MS.items).some((v) => v > 0)) return toast('Cargá al menos un producto');
    const p = DB.ruta.paradas[MS.i]; const c = cli(p.cid);
    const monto = montoEntrega();
    if (!DB.ruta.iniciada) DB.ruta.iniciada = horaAhora();
    entregar(p, MS.items, monto, MS.medio, MS.nota || '', null, MS.disp);
    closeModal(); refresh();
    toast(monto ? `✓ ${primerNombre(c)}: entregado y cobrado ${money(monto + (p.res.dispMonto || 0))}` : `✓ ${primerNombre(c)}: entregado · queda debiendo`);
  },
  ausente: (el) => modalNoEntrega(Number(el.dataset.i), 'ausente'),
  noEntregado: (el) => modalNoEntrega(Number(el.dataset.i), 'no_entregado'),
  motivo: (el) => { MS.motivo = el.dataset.v; el.parentNode.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b === el)); },
  confirmNoEnt: () => {
    const p = DB.ruta.paradas[MS.i]; const estado = MS.estado; const c = cli(p.cid);
    if (!DB.ruta.iniciada) DB.ruta.iniciada = horaAhora();
    marcarNoEntrega(p, estado, MS.motivo);
    closeModal(); refresh(); toast(`${primerNombre(c)}: ${ESTADOS[estado].t.toLowerCase()}`);
  },
  corregir: (el) => {
    const p = DB.ruta.paradas[Number(el.dataset.i)];
    revertir(p); if (DB.ruta.cerrada) DB.ruta.cerrada = null;
    refresh(); toast('Parada vuelta a pendiente');
  },
  cerrarRuta: () => modalCerrar(),
  confirmCerrar: () => {
    DB.ruta.cerrada = horaAhora(); closeModal(); refresh();
    const n = DB.ruta.paradas.filter((p) => p.estado === 'pendiente').length;
    toast(n ? `Ruta cerrada · ${n} sin visitar quedaron marcados para el dueño` : 'Ruta cerrada · ¡completa! 🎉');
  },
  reabrir: () => { DB.ruta.cerrada = null; refresh(); toast('Ruta reabierta'); },
};
function kmRuta(P) {
  let km = 0, cur = planta();
  P.forEach((p) => { const c = cli(p.cid); km += dist(cur, c); cur = c; });
  return km;
}

/* ---------------- Inputs ---------------- */
const INPUTS = {
  cliQ: (el) => { UI.cliQ = el.value; $('#cli-list').innerHTML = cliListHtml(); },
  cliFiltro: (el) => { UI.cliFiltro = el.value; $('#cli-list').innerHTML = cliListHtml(); },
  obs: (el) => { cli(MS.cid).obs = el.value; save(); },
  notas: (el) => { cli(MS.cid).notas = el.value; save(); },
  pagoCli: (el) => {
    MS.cid = el.value; const c = cli(MS.cid);
    if (c) {
      if (MS.concepto === 'disp' && !c.dispenser) MS.concepto = 'deuda';
      document.querySelectorAll('#pago-conc button').forEach((b) => b.classList.toggle('on', b.dataset.v === MS.concepto));
      $('#pago-monto').value = MS.concepto === 'disp' ? c.dispenser.mensualidad : (c.deuda || '');
    }
    $('#pago-info').innerHTML = pagoInfo();
  },
  entMonto: (el) => {
    MS.monto = el.value;
    const c = cli(DB.ruta.paradas[MS.i].cid);
    const cobra = montoEntrega() + (MS.disp && c.dispenser ? c.dispenser.mensualidad : 0);
    const b = $('#btn-ent'); if (b) b.innerHTML = `${ic('check', 'sm')} Confirmar · cobra ${money(cobra)}`;
  },
  entNota: (el) => { MS.nota = el.value; },
  plantilla: (el) => {
    const pl = DB.plantillas.find((p) => p.id === UI.plantillaSel); pl.texto = el.value; save();
    const ejemplo = DB.clientes.find((c) => c.dispenser && c.deuda) || DB.clientes[0];
    $('#wa-prev').textContent = waTexto(pl.id, ejemplo);
  },
};

/* ---------------- Eventos globales ---------------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  if (!el) return;
  const fn = A[el.dataset.a];
  if (!fn) return;
  if (el.tagName === 'INPUT') { fn(el, ev); return; }
  fn(el, ev);
});
document.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-in]');
  if (el && INPUTS[el.dataset.in]) INPUTS[el.dataset.in](el, ev);
});
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && $('#modal-root').innerHTML) closeModal(); });

/* ---------------- Inicio ---------------- */
load();
lastPage = ruta().page;
render();
cargarClima();
if (DB.ruta.iniciada && !DB.ruta.cerrada && ruta().page === 'repartidor') activarGPS(true);
