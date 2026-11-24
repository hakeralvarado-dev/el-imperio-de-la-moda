
/* =====================================================
   EL IMPERIO DE LA MODA
   Administración con formularios relacionados
   Almacenamiento local del navegador
===================================================== */

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
      ["nombre", "Nombre del trabajador", true],
      ["telefono", "Teléfono", false],
      ["cargo", "Cargo", false],
      ["usuario", "Nombre de usuario", false],
      ["permiso", "Permisos o funciones", false]
    ]
  },

  clientes: {
    titulo: "Clientes",
    descripcion: "Directorio general de clientes.",
    campos: [
      ["nombre", "Nombre completo", true],
      ["telefono", "Teléfono", false],
      ["documento", "Cédula o documento", false],
      ["direccion", "Dirección", false],
      ["zona", "Zona o sector", false]
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
      ["producto", "Nombre del producto", true],
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
      ["vendedor", "Trabajador que realizó la venta", false],
      ["fecha", "Fecha de la venta", true],
      ["observacion", "Observaciones", false]
    ]
  },

  consignaciones: {
    titulo: "Consignaciones",
    descripcion: "Control de mercancía entregada en consignación.",
    campos: [
      ["cliente", "Cliente o responsable", true],
      ["producto", "Producto entregado", true],
      ["cantidad", "Cantidad entregada", true],
      ["fecha", "Fecha de entrega", true],
      ["vendedor", "Trabajador responsable", false],
      ["estado", "Estado de la consignación", false],
      ["observacion", "Observaciones", false]
    ]
  },

  cobros: {
    titulo: "Cobros",
    descripcion: "Control de pagos recibidos y referencias bancarias.",
    campos: [
      ["cliente", "Cliente que realizó el pago", true],
      ["monto", "Monto recibido", true],
      ["referencia", "Número de referencia del pago", false],
      ["metodo", "Método de pago", false],
      ["cobrador", "Trabajador que recibió el pago", true],
      ["fecha", "Fecha del cobro", true],
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

.modulo-actions {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:5px;
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

.registro-botones {
  display:flex;
  gap:7px;
  margin-top:12px;
}

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
}

.resumen-item small { color:#817b8d; font-size:11px; }
.resumen-item strong { display:block; font-size:23px; margin-top:8px; }

@media(max-width:800px) {
  .modulo-layout { grid-template-columns:1fr; }
  .resumen-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
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
  localStorage.setItem(DB_KEY, JSON.stringify(baseDatos));
}

function guardarAuditoria() {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(auditoria));
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

/* CAMPOS RELACIONADOS */

function obtenerTipoRelacion(modulo, campo) {
  if (campo === "cliente" &&
      ["ventas", "consignaciones", "cobros"].includes(modulo)) {
    return "clientes";
  }

  if (campo === "producto" &&
      ["ventas", "consignaciones", "inventario"].includes(modulo)) {
    return "productos";
  }

  if (["vendedor", "cobrador", "responsable"].includes(campo)) {
    return "personal";
  }

  return null;
}

function obtenerNombreRegistro(registro, tipo) {
  if (tipo === "personal" || tipo === "clientes" || tipo === "productos") {
    return registro.nombre || "";
  }
  return "";
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
      .map(registro => obtenerNombreRegistro(registro, tipoRelacion))
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

    opciones.forEach(nombre => {
      opcionesHTML += `
        <option value="${escapar(nombre)}"
          ${nombre === valorActual ? "selected" : ""}>
          ${escapar(nombre)}
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
          ? `<small>No hay registros. Primero agrega información en ${tipoRelacion === "personal" ? "Personal" : tipoRelacion === "clientes" ? "Clientes" : "Productos"}.</small>`
          : ""}
      </label>
    `;
  }

  if (nombre === "observacion" || nombre === "direccion" ||
      nombre === "descripcion") {
    return `
      <label>
        ${escapar(etiqueta)}
        <textarea name="${nombre}"
          placeholder="${escapar(etiqueta)}">${escapar(valorActual)}</textarea>
      </label>
    `;
  }

  if (nombre === "fecha") {
    return `
      <label>
        ${escapar(etiqueta)}
        <input type="date" name="${nombre}"
          value="${escapar(valorActual || fechaActual())}"
          ${obligatorio ? "required" : ""}>
      </label>
    `;
  }

  return `
    <label>
      ${escapar(etiqueta)}
      <input type="text" name="${nombre}"
        value="${escapar(valorActual)}"
        placeholder="${escapar(etiqueta)}"
        ${obligatorio ? "required" : ""}>
    </label>
  `;
}

/* NAVEGACIÓN */

function abrirModulo(vista) {
  if (!content) return;

  moduloActual = vista;

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

/* INICIO */

function mostrarInicio() {
  const total = modulo => obtenerRegistros(modulo).length;

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
      <span>Resumen de los registros guardados en este dispositivo.</span>
    </div>

    <div class="resumen-grid">
      <div class="resumen-item"><small>Clientes</small><strong>${total("clientes")}</strong></div>
      <div class="resumen-item"><small>Productos</small><strong>${total("productos")}</strong></div>
      <div class="resumen-item"><small>Trabajadores</small><strong>${total("personal")}</strong></div>
      <div class="resumen-item"><small>Ventas</small><strong>${total("ventas")}</strong></div>
      <div class="resumen-item"><small>Consignaciones</small><strong>${total("consignaciones")}</strong></div>
      <div class="resumen-item"><small>Cobros</small><strong>${total("cobros")}</strong></div>
    </div>

    <section class="modulo-card">
      <h3>Administración del negocio</h3>
      <p>Selecciona una sección en el menú para comenzar a registrar información.</p>
    </section>
  `;
}

/* MÓDULOS */

function mostrarModulo(modulo, idEditar = null) {
  const config = modulos[modulo];
  if (!config) return;

  const registroActual = idEditar
    ? obtenerRegistros(modulo).find(item => item.id === idEditar)
    : null;

  const campos = config.campos
    .map(campo => crearCampo(campo, modulo, registroActual))
    .join("");

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

  renderizarRegistros();
}

function guardarRegistro(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  if (!formulario.reportValidity()) return;

  const datos = new FormData(formulario);
  const id = String(datos.get("registroId") || "");

  const registro = {
    id: id || crearId(),
    creado: new Date().toISOString(),
    actualizado: new Date().toISOString()
  };

  modulos[moduloActual].campos.forEach(campo => {
    registro[campo[0]] = String(datos.get(campo[0]) || "").trim();
  });

  const registros = obtenerRegistros(moduloActual);

  if (id) {
    const indice = registros.findIndex(item => item.id === id);
    if (indice === -1) return;

    registro.creado = registros[indice].creado || registro.creado;
    registros[indice] = registro;

    registrarAccion(
      "Edición",
      modulos[moduloActual].titulo,
      registro.nombre || registro.cliente || registro.producto || id
    );
  } else {
    registros.unshift(registro);

    registrarAccion(
      "Registro",
      modulos[moduloActual].titulo,
      registro.nombre || registro.cliente || registro.producto || "Nuevo registro"
    );
  }

  guardarDatos();
  mostrarModulo(moduloActual);

  alert(id ? "Registro actualizado correctamente." : "Registro guardado correctamente.");
}

function limpiarFormulario() {
  const formulario = document.getElementById("formRegistro");
  if (!formulario) return;

  formulario.reset();
  formulario.elements.registroId.value = "";

  const fecha = formulario.elements.fecha;
  if (fecha) fecha.value = fechaActual();

  const titulo = document.getElementById("tituloFormulario");
  if (titulo) titulo.textContent = "Nuevo registro";
}

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
      "Registro";

    const detalles = config.campos
      .filter(campo => registro[campo[0]])
      .map(campo => `
        <p><strong>${escapar(campo[1])}:</strong>
        ${escapar(registro[campo[0]])}</p>
      `).join("");

    return `
      <article class="registro-card">
        <h4>${escapar(titulo)}</h4>
        ${detalles}
        <div class="registro-botones">
          <button class="btn-pequeno" type="button"
            data-editar="${escapar(registro.id)}">Editar</button>
          <button class="btn-peligro" type="button"
            data-eliminar="${escapar(registro.id)}">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");

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
  guardarDatos();

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
