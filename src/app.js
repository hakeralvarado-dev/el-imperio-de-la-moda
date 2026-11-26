/* =====================================================
   EL IMPERIO DE LA MODA
   Administración comercial
   Clientes, expedientes, GPS, fotos, historial
   Agenda de cobros por fecha y responsable
   Almacenamiento local del navegador
===================================================== */

"use strict";

const DB_KEY = "imperio-moda-database-v1";
const AUDIT_KEY = "imperio-moda-auditoria-v1";

const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const content = document.querySelector(".content");

const modulos = {
  personal: {
    titulo: "Personal y permisos",
    descripcion: "Administra los trabajadores y sus responsabilidades.",
    campos: [
      ["nombre", "Nombre completo del trabajador", true],
      ["telefono", "Teléfono", false],
      ["documento", "Cédula o documento", false],
      ["cargo", "Cargo", false],
      ["usuario", "Nombre de usuario", false],
      ["permiso", "Permisos o funciones", false]
    ]
  },

  clientes: {
    titulo: "Clientes",
    descripcion: "Directorio de clientes y expedientes individuales.",
    campos: [
      ["nombre", "Nombre completo", true],
      ["telefono", "Teléfono", false],
      ["documento", "Cédula o documento", false],
      ["direccion", "Dirección completa", false],
      ["municipio", "Municipio", false],
      ["estado", "Estado", false],
      ["zona", "Zona o sector", false],
      ["referencia", "Referencia para encontrar la vivienda", false],
      ["latitud", "Latitud GPS", false],
      ["longitud", "Longitud GPS", false],
      ["observacion", "Notas generales", false]
    ]
  },

  productos: {
    titulo: "Productos",
    descripcion: "Catálogo de mercancía y precios.",
    campos: [
      ["nombre", "Nombre del producto", true],
      ["codigo", "Código del producto", false],
      ["categoria", "Categoría", false],
      ["precio", "Precio de venta", true],
      ["costo", "Costo del producto", false],
      ["descripcion", "Descripción", false]
    ]
  },

  inventario: {
    titulo: "Inventario",
    descripcion: "Control de existencias y movimientos de mercancía.",
    campos: [
      ["producto", "Producto", true],
      ["codigo", "Código del producto", false],
      ["cantidad", "Cantidad disponible", true],
      ["minimo", "Cantidad mínima", false],
      ["ubicacion", "Ubicación", false],
      ["observacion", "Observaciones", false]
    ]
  },

  ventas: {
    titulo: "Ventas",
    descripcion: "Registro de operaciones comerciales.",
    campos: [
      ["cliente", "Cliente", true],
      ["producto", "Producto vendido", true],
      ["cantidad", "Cantidad", true],
      ["total", "Total de la venta", true],
      ["vendedor", "Trabajador responsable", false],
      ["fecha", "Fecha de la venta", true],
      ["observacion", "Observaciones", false]
    ]
  },

  consignaciones: {
    titulo: "Consignaciones",
    descripcion: "Control de mercancía entregada en consignación.",
    campos: [
      ["cliente", "Cliente responsable", true],
      ["producto", "Producto entregado", true],
      ["cantidad", "Cantidad entregada", true],
      ["fecha", "Fecha de entrega", true],
      ["fechaCobro", "Fecha programada para cobrar", true],
      ["responsableCobro", "Trabajador responsable del cobro", false],
      ["vendedor", "Trabajador que entregó la mercancía", false],
      ["estado", "Estado de la consignación", false],
      ["observacion", "Observaciones", false]
    ]
  },

  cobros: {
    titulo: "Cobros",
    descripcion: "Control de pagos recibidos.",
    campos: [
      ["cliente", "Cliente que realizó el pago", true],
      ["monto", "Monto recibido", true],
      ["referencia", "Número de referencia", false],
      ["metodo", "Método de pago", false],
      ["cobrador", "Trabajador que recibió el pago", true],
      ["fecha", "Fecha del cobro", true],
      ["observacion", "Observaciones", false]
    ]
  },

  regalos: {
    titulo: "Regalos entregados",
    descripcion: "Control de obsequios entregados a los clientes.",
    campos: [
      ["cliente", "Cliente", true],
      ["regalo", "Regalo entregado", true],
      ["fecha", "Fecha de entrega", true],
      ["trabajador", "Trabajador responsable", false],
      ["motivo", "Motivo o compra relacionada", false],
      ["observacion", "Observaciones", false]
    ]
  },

  visitas: {
    titulo: "Visitas y atención",
    descripcion: "Registro de visitas realizadas a los clientes.",
    campos: [
      ["cliente", "Cliente visitado", true],
      ["fecha", "Fecha de visita", true],
      ["trabajador", "Trabajador responsable", false],
      ["motivo", "Motivo de la visita", false],
      ["resultado", "Resultado de la visita", false],
      ["observacion", "Observaciones", false]
    ]
  },

  zonas: {
    titulo: "Zonas y mapa",
    descripcion: "Organización de sectores y zonas de trabajo.",
    campos: [
      ["nombre", "Nombre de la zona", true],
      ["responsable", "Trabajador responsable", false],
      ["sector", "Sector o localidad", false],
      ["direccion", "Dirección o referencia", false],
      ["observacion", "Observaciones", false]
    ]
  }
};

let baseDatos = cargarDatos();
let auditoria = cargarAuditoria();
let moduloActual = "inicio";
let clienteExpedienteActual = null;

/* ESTILOS */

const estilos = document.createElement("style");

estilos.textContent = `
.modulo-header { margin-bottom:22px; }
.modulo-header h2 { margin:7px 0; font-size:23px; }
.modulo-header p { color:#817b8d; font-size:13px; }

.modulo-layout {
  display:grid;
  grid-template-columns:minmax(260px,.8fr) minmax(0,1.5fr);
  gap:18px;
  align-items:start;
}

.modulo-card {
  background:white;
  border:1px solid #ece9f1;
  border-radius:13px;
  padding:20px;
  min-width:0;
}

.modulo-card h3 { margin-top:0; font-size:16px; }

.modulo-form { display:grid; gap:13px; }

.modulo-form label {
  display:grid;
  gap:6px;
  font-size:12px;
  font-weight:600;
  color:#51485f;
}

.modulo-form input,
.modulo-form select,
.modulo-form textarea,
.modulo-busqueda {
  width:100%;
  box-sizing:border-box;
  padding:11px;
  border:1px solid #ded9e7;
  border-radius:8px;
  background:white;
  color:#211b31;
  font:inherit;
}

.modulo-form textarea {
  min-height:75px;
  resize:vertical;
}

.modulo-actions,
.registro-botones {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:10px;
}

.btn-principal,
.btn-secundario,
.btn-peligro,
.btn-pequeno {
  border:0;
  border-radius:8px;
  padding:10px 14px;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
}

.btn-principal { background:#6d4bc3; color:white; }
.btn-secundario { background:#f0ecf6; color:#684bb0; }
.btn-peligro { background:#fff0f1; color:#c34455; }
.btn-pequeno { background:#f0ecf6; color:#684bb0; padding:7px 10px; }

.modulo-lista {
  display:grid;
  gap:10px;
  margin-top:15px;
}

.registro-card {
  border:1px solid #ece9f1;
  border-radius:10px;
  padding:14px;
  overflow-wrap:anywhere;
}

.registro-card h4 { margin:0 0 9px; font-size:14px; }
.registro-card p { margin:5px 0; color:#817b8d; font-size:12px; }

.modulo-busqueda { margin-top:12px; }

.modulo-vacio {
  padding:25px 10px;
  text-align:center;
  color:#817b8d;
  font-size:13px;
}

.resumen-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
  margin-bottom:18px;
}

.resumen-item {
  background:white;
  border:1px solid #ece9f1;
  border-radius:12px;
  padding:17px;
  cursor:pointer;
}

.resumen-item small { color:#817b8d; font-size:11px; }

.agenda-cobros { margin:18px 0; }

.agenda-grupos {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
}

.agenda-grupo {
  border:1px solid #ece9f1;
  border-radius:12px;
  padding:14px;
  background:#fff;
  min-width:0;
}

.agenda-grupo h3 {
  font-size:14px;
  margin:0 0 10px;
}

.agenda-item {
  border-top:1px solid #f0edf4;
  padding:10px 0;
  font-size:12px;
  overflow-wrap:anywhere;
}

.agenda-item p {
  margin:4px 0;
  color:#817b8d;
}

.agenda-vacio {
  color:#817b8d;
  font-size:12px;
  padding:8px 0;
}

.agenda-alerta { color:#b43d4b; }

.resumen-item strong {
  display:block;
  font-size:23px;
  margin-top:8px;
}

.tarjeta-expediente {
  background:white;
  border:1px solid #ece9f1;
  border-radius:13px;
  padding:20px;
  margin-bottom:16px;
}

.exp-numero {
  color:#6d4bc3;
  font-size:13px;
  font-weight:800;
}

.exp-foto {
  width:100%;
  max-width:340px;
  max-height:260px;
  object-fit:cover;
  border-radius:12px;
  display:block;
  margin:12px 0;
}

.exp-dato {
  padding:10px 0;
  border-bottom:1px solid #f0edf4;
  font-size:13px;
  overflow-wrap:anywhere;
}

.exp-dato strong {
  display:block;
  color:#51485f;
  margin-bottom:4px;
}

.exp-seccion { margin-top:22px; }

.exp-seccion h3 {
  font-size:16px;
  margin-bottom:12px;
}

.gps-destacado {
  background:#f3effa;
  padding:13px;
  border-radius:10px;
  margin-top:12px;
  overflow-wrap:anywhere;
}

.gps-destacado a {
  color:#684bb0;
  font-weight:700;
}

.boton-gps {
  background:#eaf5ed;
  color:#287342;
}

@media(max-width:800px) {
  .modulo-layout { grid-template-columns:1fr; }
  .resumen-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .agenda-grupos { grid-template-columns:1fr; }
}
`;

document.head.appendChild(estilos);

/* ALMACENAMIENTO */

function cargarDatos() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || {};
  } catch {
    return {};
  }
}

function cargarAuditoria() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarDatos() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(baseDatos));
    return true;
  } catch (error) {
    alert("No se pudo guardar. Es posible que el almacenamiento esté lleno. Prueba con una foto más pequeña.");
    return false;
  }
}

function guardarAuditoria() {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditoria));
  } catch (error) {
    console.warn("No se pudo guardar el historial de auditoría.", error);
  }
}

function obtenerRegistros(modulo) {
  if (!Array.isArray(baseDatos[modulo])) {
    baseDatos[modulo] = [];
  }
  return baseDatos[modulo];
}

/* UTILIDADES */

function crearId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9);
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

function fechaActual() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function fechaBonita(valor) {
  if (!valor) return "No registrada";
  const partes = String(valor).split("-");
  if (partes.length !== 3) return escapar(valor);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function registrarAccion(accion, modulo, detalle) {
  auditoria.unshift({
    id: crearId(),
    accion,
    modulo,
    detalle,
    fecha: new Date().toISOString()
  });

  auditoria = auditoria.slice(0, 500);
  guardarAuditoria();
}

function siguienteNumeroCliente() {
  const clientes = obtenerRegistros("clientes");
  let mayor = 0;

  clientes.forEach(cliente => {
    const numero = Number(cliente.numeroCliente || 0);
    if (numero > mayor) mayor = numero;
  });

  return mayor + 1;
}

function formatoNumeroCliente(cliente) {
  if (!cliente.numeroCliente) return "Cliente sin número";
  return "Cliente #" + String(cliente.numeroCliente).padStart(3, "0");
}

function nombreClientePorId(id) {
  const cliente = obtenerRegistros("clientes").find(item => item.id === id);
  return cliente ? cliente.nombre : "";
}

/* RELACIONES */

function obtenerTipoRelacion(modulo, campo) {
  if (campo === "cliente" &&
      ["ventas", "consignaciones", "cobros", "regalos", "visitas"].includes(modulo)) {
    return "clientes";
  }

  if (campo === "producto" &&
      ["ventas", "consignaciones", "inventario"].includes(modulo)) {
    return "productos";
  }

  if (["vendedor", "cobrador", "responsable", "trabajador", "responsableCobro"].includes(campo)) {
    return "personal";
  }

  return null;
}

function obtenerNombreRegistro(registro) {
  return registro.nombre || "";
}

function crearCampo(campo, modulo, registroActual = null) {
  const nombre = campo[0];
  const etiqueta = campo[1];
  const obligatorio = campo[2];
  const valorActual = registroActual?.[nombre] || "";
  const tipoRelacion = obtenerTipoRelacion(modulo, nombre);

  if (tipoRelacion) {
    const registros = obtenerRegistros(tipoRelacion);
    const opciones = registros
      .map(registro => obtenerNombreRegistro(registro))
      .filter(Boolean);

    let opcionesHTML = `
      <option value="">Seleccionar ${escapar(etiqueta.toLowerCase())}</option>
    `;

    if (valorActual && !opciones.includes(valorActual)) {
      opcionesHTML += `
        <option value="${escapar(valorActual)}" selected>
          ${escapar(valorActual)} (registro anterior)
        </option>
      `;
    }

    opciones.forEach(nombreOpcion => {
      opcionesHTML += `
        <option value="${escapar(nombreOpcion)}"
          ${nombreOpcion === valorActual ? "selected" : ""}>
          ${escapar(nombreOpcion)}
        </option>
      `;
    });

    return `
      <label>
        ${escapar(etiqueta)}
        <select name="${nombre}" ${obligatorio ? "required" : ""}>
          ${opcionesHTML}
        </select>
        ${opciones.length === 0
          ? "<small>Primero agrega registros en la sección correspondiente.</small>"
          : ""}
      </label>
    `;
  }

  if (nombre === "observacion" || nombre === "direccion" ||
      nombre === "descripcion" || nombre === "referencia" ||
      nombre === "permiso") {
    return `
      <label>
        ${escapar(etiqueta)}
        <textarea name="${nombre}"
          placeholder="${escapar(etiqueta)}">${escapar(valorActual)}</textarea>
      </label>
    `;
  }

  if (nombre === "fecha" || nombre === "fechaCobro") {
    return `
      <label>
        ${escapar(etiqueta)}
        <input type="date" name="${nombre}"
          value="${escapar(valorActual || fechaActual())}"
          ${obligatorio ? "required" : ""}>
      </label>
    `;
  }

  const tipo = ["latitud", "longitud", "precio", "costo", "cantidad", "minimo", "total", "monto"].includes(nombre)
    ? "number"
    : "text";

  const paso = tipo === "number" ? 'step="any"' : "";

  return `
    <label>
      ${escapar(etiqueta)}
      <input type="${tipo}" name="${nombre}"
        value="${escapar(valorActual)}"
        placeholder="${escapar(etiqueta)}"
        ${paso}
        ${obligatorio ? "required" : ""}>
    </label>
  `;
}

/* NAVEGACIÓN */

function abrirModulo(vista) {
  if (!content) return;

  moduloActual = vista;
  clienteExpedienteActual = null;

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === vista);
  });

  if (pageTitle) {
    pageTitle.textContent =
      vista === "inicio" ? "Resumen general" :
      vista === "reportes" ? "Reportes" :
      vista === "auditoria" ? "Historial y auditoría" :
      modulos[vista]?.titulo || "El Imperio de la Moda";
  }

  sidebar?.classList.remove("open");

  if (vista === "inicio") {
    mostrarInicio();
  } else if (vista === "reportes") {
    mostrarReportes();
  } else if (vista === "auditoria") {
    mostrarAuditoria();
  } else if (modulos[vista]) {
    mostrarModulo(vista);
  }
}

document.querySelectorAll(".nav-item").forEach(boton => {
  boton.addEventListener("click", () => {
    abrirModulo(boton.dataset.view);
  });
});

document.getElementById("menuBtn")?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

/* AGENDA DE COBROS */

function obtenerAgendaCobros() {
  const hoy = fechaActual();
  const clientes = obtenerRegistros("clientes");

  return obtenerRegistros("consignaciones")
    .filter(item =>
      item.fechaCobro &&
      !["cobrado", "pagado", "cerrado", "completado"]
        .includes(String(item.estado || "").toLowerCase())
    )
    .map(item => {
      const cliente = clientes.find(c =>
        (item.clienteId && c.id === item.clienteId) ||
        c.nombre === item.cliente
      );

      const fecha = String(item.fechaCobro).slice(0, 10);

      return {
        ...item,
        clienteNombre: cliente?.nombre || item.cliente || "Cliente",
        grupo: fecha < hoy
          ? "atrasados"
          : fecha === hoy
            ? "hoy"
            : "proximos"
      };
    })
    .sort((a, b) =>
      String(a.fechaCobro).localeCompare(String(b.fechaCobro))
    );
}

function mostrarAgendaCobros() {
  const agenda = obtenerAgendaCobros();

  const grupos = [
    ["atrasados", "Cobros atrasados"],
    ["hoy", "Cobros para hoy"],
    ["proximos", "Próximos cobros"]
  ];

  let html = `
    <section class="modulo-card agenda-cobros">
      <h3>Agenda de cobros</h3>
      <p>Fechas programadas para visitar y gestionar cada consignación.</p>
      <div class="agenda-grupos">
  `;

  grupos.forEach(grupo => {
    const clave = grupo[0];
    const titulo = grupo[1];
    const items = agenda.filter(item => item.grupo === clave);

    html += `
      <div class="agenda-grupo">
        <h3 class="${clave === "atrasados" && items.length ? "agenda-alerta" : ""}">
          ${titulo} (${items.length})
        </h3>
    `;

    if (!items.length) {
      html += `
        <div class="agenda-vacio">
          No hay cobros en esta categoría.
        </div>
      `;
    }

    items.forEach(item => {
      html += `
        <div class="agenda-item">
          <strong>${escapar(item.clienteNombre)}</strong>
          <p>${escapar(item.producto || "Mercancía")} · Cantidad: ${escapar(item.cantidad || "No indicada")}</p>
          <p>Fecha: ${fechaBonita(item.fechaCobro)}</p>
          <p>Responsable: ${escapar(item.responsableCobro || "Sin asignar")}</p>
          <p>Entrega: ${fechaBonita(item.fecha)}</p>
        </div>
      `;
    });

    html += `</div>`;
  });

  return html + `</div></section>`;
}

/* INICIO */

function mostrarInicio() {
  const total = modulo => obtenerRegistros(modulo).length;

  const tarjetas = [
    ["clientes", "Clientes", total("clientes")],
    ["productos", "Productos", total("productos")],
    ["personal", "Trabajadores", total("personal")],
    ["ventas", "Ventas", total("ventas")],
    ["consignaciones", "Consignaciones", total("consignaciones")],
    ["cobros", "Cobros", total("cobros")],
    ["regalos", "Regalos entregados", total("regalos")],
    ["visitas", "Visitas", total("visitas")],
    ["zonas", "Zonas", total("zonas")]
  ];

  content.innerHTML = `
    <section class="welcome">
      <div>
        <div class="eyebrow light">PANEL DE ADMINISTRACIÓN</div>
        <h1>Bienvenido a tu imperio</h1>
        <p>Administra las operaciones de El Imperio de la Moda.</p>
      </div>
      <div class="welcome-mark">♛</div>
    </section>

    <div class="notice">
      <strong>Panel general</strong>
      <span>Selecciona cualquiera de las tarjetas para abrir su sección.</span>
    </div>

    <div class="resumen-grid">
      ${tarjetas.map(item => `
        <div class="resumen-item" data-ir="${item[0]}" role="button" tabindex="0">
          <small>${escapar(item[1])}</small>
          <strong>${item[2]}</strong>
        </div>
      `).join("")}
    </div>

    ${mostrarAgendaCobros()}

    <section class="modulo-card">
      <h3>Administración del negocio</h3>
      <p>Los datos se guardan en el almacenamiento de este navegador.</p>
      <p>Para comenzar, registra tus clientes y sus ubicaciones.</p>
    </section>
  `;

  content.querySelectorAll("[data-ir]").forEach(tarjeta => {
    const ir = () => abrirModulo(tarjeta.dataset.ir);

    tarjeta.addEventListener("click", ir);

    tarjeta.addEventListener("keydown", evento => {
      if (evento.key === "Enter" || evento.key === " ") ir();
    });
  });
}

/* MÓDULOS */

function mostrarModulo(modulo, idEditar = null) {
  const config = modulos[modulo];
  if (!config) return;

  moduloActual = modulo;

  const registroActual = idEditar
    ? obtenerRegistros(modulo).find(item => item.id === idEditar)
    : null;

  const campos = config.campos
    .map(campo => crearCampo(campo, modulo, registroActual))
    .join("");

  const campoFoto = modulo === "clientes" ? `
    <label>
      Foto del frente de la vivienda (opcional)
      <input type="file" id="fotoCliente" accept="image/*" capture="environment">
      <small>La foto se guarda en este navegador. Es recomendable usar una imagen pequeña.</small>
      ${registroActual?.foto
        ? `<img class="exp-foto" src="${registroActual.foto}" alt="Foto de la vivienda">`
        : ""}
    </label>
  ` : "";

  const botonGPS = modulo === "clientes" ? `
    <button class="btn-secundario boton-gps" type="button" id="obtenerGPS">
      Obtener ubicación GPS
    </button>
    <small id="estadoGPS">Permite el acceso a la ubicación cuando el teléfono lo solicite.</small>
  ` : "";

  content.innerHTML = `
    <div class="modulo-header">
      <div class="eyebrow">EL IMPERIO DE LA MODA</div>
      <h2>${escapar(config.titulo)}</h2>
      <p>${escapar(config.descripcion)}</p>
    </div>

    <div class="modulo-layout">
      <section class="modulo-card">
        <h3 id="tituloFormulario">${registroActual ? "Editar registro" : "Nuevo registro"}</h3>

        <form class="modulo-form" id="formRegistro">
          <input type="hidden" name="registroId"
            value="${escapar(registroActual?.id || "")}">
          ${campos}
          ${botonGPS}
          ${campoFoto}

          <div class="modulo-actions">
            <button class="btn-principal" type="submit">
              ${registroActual ? "Actualizar registro" : "Guardar registro"}
            </button>
            <button class="btn-secundario" type="button" id="limpiarFormulario">
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section class="modulo-card">
        <h3>Registros guardados</h3>
        <input class="modulo-busqueda" id="buscarRegistro"
          placeholder="Buscar registros...">
        <div class="modulo-lista" id="listaRegistros"></div>
      </section>
    </div>
  `;

  document.getElementById("formRegistro")
    .addEventListener("submit", guardarRegistro);

  document.getElementById("limpiarFormulario")
    .addEventListener("click", limpiarFormulario);

  document.getElementById("buscarRegistro")
    .addEventListener("input", renderizarRegistros);

  document.getElementById("obtenerGPS")
    ?.addEventListener("click", obtenerGPS);

  renderizarRegistros();
}

/* GPS */

function obtenerGPS() {
  const estado = document.getElementById("estadoGPS");

  if (!navigator.geolocation) {
    if (estado) estado.textContent = "Este navegador no permite obtener GPS.";
    return;
  }

  if (estado) estado.textContent = "Buscando ubicación...";

  navigator.geolocation.getCurrentPosition(
    posicion => {
      const latitud = document.querySelector('[name="latitud"]');
      const longitud = document.querySelector('[name="longitud"]');

      if (latitud) latitud.value = posicion.coords.latitude;
      if (longitud) longitud.value = posicion.coords.longitude;

      if (estado) estado.textContent = "Ubicación obtenida correctamente.";
    },
    error => {
      if (estado) {
        estado.textContent = "No se pudo obtener la ubicación. Revisa los permisos de GPS del teléfono.";
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

/* FOTO DEL CLIENTE */

function leerFotoCliente() {
  return new Promise(resolve => {
    const archivo = document.getElementById("fotoCliente")?.files?.[0];

    if (!archivo) {
      resolve(null);
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      resolve(null);
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const imagen = new Image();

      imagen.onload = () => {
        const maximo = 900;
        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > maximo || alto > maximo) {
          const escala = Math.min(maximo / ancho, maximo / alto);
          ancho = Math.round(ancho * escala);
          alto = Math.round(alto * escala);
        }

        const lienzo = document.createElement("canvas");
        lienzo.width = ancho;
        lienzo.height = alto;

        const contexto = lienzo.getContext("2d");
        contexto.drawImage(imagen, 0, 0, ancho, alto);

        resolve(lienzo.toDataURL("image/jpeg", 0.72));
      };

      imagen.onerror = () => resolve(null);
      imagen.src = lector.result;
    };

    lector.onerror = () => resolve(null);
    lector.readAsDataURL(archivo);
  });
}

/* GUARDAR */

async function guardarRegistro(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  if (!formulario.reportValidity()) return;

  const datos = new FormData(formulario);
  const id = String(datos.get("registroId") || "");
  const registros = obtenerRegistros(moduloActual);

  const anterior = id
    ? registros.find(item => item.id === id)
    : null;

  const registro = anterior ? { ...anterior } : {
    id: crearId(),
    creado: new Date().toISOString(),
    actualizado: new Date().toISOString()
  };

  modulos[moduloActual].campos.forEach(campo => {
    registro[campo[0]] = String(datos.get(campo[0]) || "").trim();
  });

  registro.actualizado = new Date().toISOString();

  if (moduloActual === "clientes" && !anterior) {
    registro.numeroCliente = siguienteNumeroCliente();
    registro.fechaRegistro = fechaActual();
  }

  if (moduloActual === "consignaciones") {
    const clienteRelacionado = obtenerRegistros("clientes")
      .find(item => item.nombre === registro.cliente);

    registro.clienteId = clienteRelacionado?.id || anterior?.clienteId || "";

    if (!registro.estado) {
      registro.estado = "Pendiente";
    }
  }

  if (moduloActual === "clientes" && anterior && !registro.numeroCliente) {
    registro.numeroCliente = siguienteNumeroCliente();
  }

  if (moduloActual === "clientes") {
    const foto = await leerFotoCliente();
    if (foto) registro.foto = foto;
  }

  if (anterior) {
    const indice = registros.findIndex(item => item.id === id);
    if (indice === -1) return;

    registros[indice] = registro;

    registrarAccion(
      "Edición",
      modulos[moduloActual].titulo,
      registro.nombre || registro.cliente || id
    );
  } else {
    registros.unshift(registro);

    registrarAccion(
      "Registro",
      modulos[moduloActual].titulo,
      registro.nombre || registro.cliente || registro.producto || "Nuevo registro"
    );
  }

  if (!guardarDatos()) return;

  mostrarModulo(moduloActual);

  alert(anterior
    ? "Registro actualizado correctamente."
    : "Registro guardado correctamente.");
}

/* LIMPIAR FORMULARIO */

function limpiarFormulario() {
  const formulario = document.getElementById("formRegistro");
  if (!formulario) return;

  formulario.reset();
  formulario.elements.registroId.value = "";

  const fecha = formulario.elements.fecha;
  if (fecha) fecha.value = fechaActual();

  const fechaCobro = formulario.elements.fechaCobro;
  if (fechaCobro) fechaCobro.value = fechaActual();

  const titulo = document.getElementById("tituloFormulario");
  if (titulo) titulo.textContent = "Nuevo registro";

  const foto = formulario.querySelector(".exp-foto");
  if (foto) foto.remove();
}

/* LISTA DE REGISTROS */

function renderizarRegistros() {
  const lista = document.getElementById("listaRegistros");
  if (!lista) return;

  const registros = obtenerRegistros(moduloActual);
  const busqueda = document.getElementById("buscarRegistro")
    .value.trim().toLowerCase();

  const filtrados = registros.filter(registro =>
    Object.values(registro).join(" ").toLowerCase().includes(busqueda)
  );

  if (!filtrados.length) {
    lista.innerHTML = `
      <div class="modulo-vacio">No hay registros que mostrar.</div>
    `;
    return;
  }

  lista.innerHTML = filtrados.map(registro => {
    const config = modulos[moduloActual];

    const titulo = registro.nombre ||
      registro.cliente ||
      registro.producto ||
      registro.regalo ||
      "Registro";

    const detalles = config.campos
      .filter(campo => registro[campo[0]])
      .map(campo => `
        <p><strong>${escapar(campo[1])}:</strong>
        ${escapar(registro[campo[0]])}</p>
      `).join("");

    const numero = moduloActual === "clientes"
      ? `<p class="exp-numero">${formatoNumeroCliente(registro)}</p>`
      : "";

    const botonExpediente = moduloActual === "clientes"
      ? `<button class="btn-principal" type="button"
          data-expediente="${escapar(registro.id)}">Ver expediente</button>`
      : "";

    return `
      <article class="registro-card">
        ${numero}
        <h4>${escapar(titulo)}</h4>
        ${detalles}
        <div class="registro-botones">
          ${botonExpediente}
          <button class="btn-pequeno" type="button"
            data-editar="${escapar(registro.id)}">Editar</button>
          <button class="btn-peligro" type="button"
            data-eliminar="${escapar(registro.id)}">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");

  lista.querySelectorAll("[data-expediente]").forEach(boton => {
    boton.addEventListener("click", () => {
      mostrarExpedienteCliente(boton.dataset.expediente);
    });
  });

  lista.querySelectorAll("[data-editar]").forEach(boton => {
    boton.addEventListener("click", () => {
      mostrarModulo(moduloActual, boton.dataset.editar);
    });
  });

  lista.querySelectorAll("[data-eliminar]").forEach(boton => {
    boton.addEventListener("click", () => {
      eliminarRegistro(boton.dataset.eliminar);
    });
  });
}

/* EXPEDIENTE DEL CLIENTE */

function mostrarExpedienteCliente(id) {
  const cliente = obtenerRegistros("clientes").find(item => item.id === id);
  if (!cliente) return;

  clienteExpedienteActual = id;
  moduloActual = "clientes";

  if (pageTitle) pageTitle.textContent = "Expediente del cliente";

  const ventas = obtenerRegistros("ventas")
    .filter(item => item.cliente === cliente.nombre);

  const consignaciones = obtenerRegistros("consignaciones")
    .filter(item =>
      (item.clienteId && item.clienteId === cliente.id) ||
      item.cliente === cliente.nombre
    );

  const cobros = obtenerRegistros("cobros")
    .filter(item => item.cliente === cliente.nombre);

  const regalos = obtenerRegistros("regalos")
    .filter(item => item.cliente === cliente.nombre);

  const visitas = obtenerRegistros("visitas")
    .filter(item => item.cliente === cliente.nombre);

  const lat = cliente.latitud;
  const lon = cliente.longitud;
  const tieneGPS = lat && lon;

  const enlaceMapa = tieneGPS
    ? `https://www.google.com/maps?q=${encodeURIComponent(lat + "," + lon)}`
    : "";

  function listaHistorial(titulo, registros, campos) {
    return `
      <section class="exp-seccion">
        <h3>${escapar(titulo)} (${registros.length})</h3>
        ${registros.length
          ? registros.map(registro => `
            <article class="registro-card">
              ${campos.map(campo => registro[campo]
                ? `<p><strong>${escapar(campo)}:</strong> ${escapar(registro[campo])}</p>`
                : "").join("")}
            </article>
          `).join("")
          : `<div class="modulo-vacio">Todavía no hay registros.</div>`}
      </section>
    `;
  }

  content.innerHTML = `
    <div class="modulo-header">
      <div class="eyebrow">EL IMPERIO DE LA MODA</div>
      <h2>Expediente del cliente</h2>
      <p>Información personal, ubicación y movimientos relacionados.</p>
      <button class="btn-secundario" id="volverClientes" type="button">
        Volver a clientes
      </button>
    </div>

    <section class="tarjeta-expediente">
      <div class="exp-numero">${formatoNumeroCliente(cliente)}</div>
      <h2>${escapar(cliente.nombre)}</h2>
      <p>Cliente desde: ${fechaBonita(cliente.fechaRegistro || cliente.creado?.slice(0, 10))}</p>

      ${cliente.foto
        ? `<img class="exp-foto" src="${cliente.foto}" alt="Foto de la vivienda del cliente">`
        : ""}

      <div class="exp-dato"><strong>Teléfono</strong>${escapar(cliente.telefono || "No registrado")}</div>
      <div class="exp-dato"><strong>Cédula o documento</strong>${escapar(cliente.documento || "No registrado")}</div>
      <div class="exp-dato"><strong>Dirección</strong>${escapar(cliente.direccion || "No registrada")}</div>
      <div class="exp-dato"><strong>Municipio</strong>${escapar(cliente.municipio || "No registrado")}</div>
      <div class="exp-dato"><strong>Estado</strong>${escapar(cliente.estado || "No registrado")}</div>
      <div class="exp-dato"><strong>Zona o sector</strong>${escapar(cliente.zona || "No registrado")}</div>
      <div class="exp-dato"><strong>Referencia de la vivienda</strong>${escapar(cliente.referencia || "No registrada")}</div>
      <div class="exp-dato"><strong>Notas</strong>${escapar(cliente.observacion || "Sin notas")}</div>

      <div class="gps-destacado">
        <strong>Ubicación GPS</strong>
        ${tieneGPS
          ? `
            <p>Latitud: ${escapar(lat)}</p>
            <p>Longitud: ${escapar(lon)}</p>
            <a href="${enlaceMapa}" target="_blank" rel="noopener">
              Abrir ubicación en Google Maps
            </a>
          `
          : `<p>Este cliente todavía no tiene ubicación GPS registrada.</p>`}
      </div>

      <div class="modulo-actions">
        <button class="btn-principal" id="editarDesdeExpediente" type="button">
          Editar datos del cliente
        </button>
      </div>
    </section>

    ${listaHistorial("Ventas", ventas, ["fecha", "producto", "cantidad", "total", "vendedor", "observacion"])}
    ${listaHistorial("Consignaciones", consignaciones, ["fecha", "producto", "cantidad", "fechaCobro", "responsableCobro", "vendedor", "estado", "observacion"])}
    ${listaHistorial("Pagos recibidos", cobros, ["fecha", "monto", "metodo", "referencia", "cobrador", "observacion"])}
    ${listaHistorial("Regalos entregados", regalos, ["fecha", "regalo", "trabajador", "motivo", "observacion"])}
    ${listaHistorial("Visitas realizadas", visitas, ["fecha", "trabajador", "motivo", "resultado", "observacion"])}
  `;

  document.getElementById("volverClientes").addEventListener("click", () => {
    mostrarModulo("clientes");
  });

  document.getElementById("editarDesdeExpediente").addEventListener("click", () => {
    mostrarModulo("clientes", id);
  });
}

/* ELIMINAR */

function eliminarRegistro(id) {
  const registros = obtenerRegistros(moduloActual);
  const registro = registros.find(item => item.id === id);
  if (!registro) return;

  const titulo = registro.nombre ||
    registro.cliente ||
    registro.producto ||
    "este registro";

  if (!confirm(`¿Deseas eliminar ${titulo}?`)) return;

  baseDatos[moduloActual] = registros.filter(item => item.id !== id);

  if (!guardarDatos()) return;

  registrarAccion(
    "Eliminación",
    modulos[moduloActual].titulo,
    titulo
  );

  renderizarRegistros();
}

/* REPORTES */

function mostrarReportes() {
  const contar = modulo => obtenerRegistros(modulo).length;

  const totalCobrado = obtenerRegistros("cobros")
    .reduce((suma, item) => suma + (Number(item.monto) || 0), 0);

  const totalVentas = obtenerRegistros("ventas")
    .reduce((suma, item) => suma + (Number(item.total) || 0), 0);

  content.innerHTML = `
    <div class="modulo-header">
      <div class="eyebrow">CONTROL DEL NEGOCIO</div>
      <h2>Reportes generales</h2>
      <p>Resumen de la información registrada en este dispositivo.</p>
    </div>

    <div class="resumen-grid">
      <div class="resumen-item"><small>Clientes</small><strong>${contar("clientes")}</strong></div>
      <div class="resumen-item"><small>Productos</small><strong>${contar("productos")}</strong></div>
      <div class="resumen-item"><small>Ventas registradas</small><strong>${contar("ventas")}</strong></div>
      <div class="resumen-item"><small>Consignaciones</small><strong>${contar("consignaciones")}</strong></div>
      <div class="resumen-item"><small>Cobros registrados</small><strong>${contar("cobros")}</strong></div>
      <div class="resumen-item"><small>Personal</small><strong>${contar("personal")}</strong></div>
      <div class="resumen-item"><small>Regalos</small><strong>${contar("regalos")}</strong></div>
      <div class="resumen-item"><small>Visitas</small><strong>${contar("visitas")}</strong></div>
    </div>

    <section class="modulo-card">
      <h3>Totales registrados</h3>
      <p>Ventas: ${escapar(totalVentas.toFixed(2))}</p>
      <p>Cobros: ${escapar(totalCobrado.toFixed(2))}</p>
      <p>Estos valores son sumas simples de los registros, no un balance contable.</p>
    </section>
  `;
}

/* HISTORIAL Y AUDITORÍA */

function mostrarAuditoria() {
  content.innerHTML = `
    <div class="modulo-header">
      <div class="eyebrow">CONTROL DE ACTIVIDAD</div>
      <h2>Historial y auditoría</h2>
      <p>Operaciones realizadas desde este dispositivo.</p>
    </div>

    <section class="modulo-card">
      <h3>Últimas operaciones</h3>
      <div class="modulo-lista" id="listaAuditoria"></div>
    </section>
  `;

  const lista = document.getElementById("listaAuditoria");

  if (!auditoria.length) {
    lista.innerHTML = `
      <div class="modulo-vacio">
        Todavía no hay operaciones registradas.
      </div>
    `;
    return;
  }

  lista.innerHTML = auditoria.map(item => `
    <article class="registro-card">
      <h4>${escapar(item.accion)}: ${escapar(item.modulo)}</h4>
      <p>${escapar(item.detalle)}</p>
      <p>${escapar(new Date(item.fecha).toLocaleString("es"))}</p>
    </article>
  `).join("");
}

/* FECHA Y ARRANQUE */

const fecha = document.getElementById("today");

if (fecha) {
  fecha.textContent = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

mostrarInicio();
