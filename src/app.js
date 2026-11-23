
const STORAGE_KEY = "imperio-moda-clientes-v1";

const titleMap = {
  inicio: "Resumen general",
  personal: "Personal y permisos",
  clientes: "Clientes",
  productos: "Productos",
  inventario: "Inventario",
  ventas: "Ventas",
  consignaciones: "Consignaciones",
  cobros: "Cobros",
  zonas: "Zonas y mapa",
  reportes: "Reportes",
  auditoria: "Historial y auditoría"
};

const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");

let clientes = cargarClientes();

function cargarClientes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarClientes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function crearId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

function mostrarClientes() {
  const contenido = document.querySelector(".content");
  if (!contenido) return;

  contenido.innerHTML = `
    <section class="clientes-modulo">
      <h2>Gestión de clientes</h2>
      <p>Registra y administra los clientes de El Imperio de la Moda.</p>

      <form id="formCliente">
        <input type="hidden" id="clienteId">

        <label>Nombre completo</label>
        <input id="nombreCliente" required maxlength="100"
          placeholder="Nombre del cliente">

        <label>Teléfono</label>
        <input id="telefonoCliente" maxlength="30"
          placeholder="Teléfono">

        <label>Documento de identidad</label>
        <input id="documentoCliente" maxlength="30"
          placeholder="Cédula o identificación">

        <label>Dirección</label>
        <textarea id="direccionCliente"
          placeholder="Dirección del cliente"></textarea>

        <label>Zona</label>
        <input id="zonaCliente" maxlength="80"
          placeholder="Zona o sector">

        <button type="submit">Guardar cliente</button>
        <button type="button" id="cancelarEdicion">Limpiar</button>
      </form>

      <hr>

      <h3>Clientes registrados: <span id="totalClientes">0</span></h3>

      <input id="buscarCliente"
        placeholder="Buscar por nombre, teléfono o cédula">

      <div id="listaClientes"></div>
    </section>
  `;

  document.getElementById("formCliente").addEventListener("submit", guardarCliente);
  document.getElementById("cancelarEdicion").addEventListener("click", limpiarFormulario);
  document.getElementById("buscarCliente").addEventListener("input", renderizarLista);

  renderizarLista();
}

function guardarCliente(evento) {
  evento.preventDefault();

  const id = document.getElementById("clienteId").value;

  const cliente = {
    id: id || crearId(),
    nombre: document.getElementById("nombreCliente").value.trim(),
    telefono: document.getElementById("telefonoCliente").value.trim(),
    documento: document.getElementById("documentoCliente").value.trim(),
    direccion: document.getElementById("direccionCliente").value.trim(),
    zona: document.getElementById("zonaCliente").value.trim(),
    actualizado: new Date().toISOString()
  };

  if (!cliente.nombre) {
    alert("Escribe el nombre del cliente.");
    return;
  }

  if (id) {
    clientes = clientes.map(item => item.id === id ? cliente : item);
  } else {
    cliente.creado = new Date().toISOString();
    clientes.push(cliente);
  }

  guardarClientes();
  limpiarFormulario();
  renderizarLista();

  alert(id ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.");
}

function limpiarFormulario() {
  const formulario = document.getElementById("formCliente");
  if (!formulario) return;

  formulario.reset();
  document.getElementById("clienteId").value = "";
}

function renderizarLista() {
  const lista = document.getElementById("listaClientes");
  if (!lista) return;

  const busqueda = document.getElementById("buscarCliente").value
    .trim().toLowerCase();

  const filtrados = clientes.filter(cliente =>
    [cliente.nombre, cliente.telefono, cliente.documento, cliente.zona]
      .join(" ").toLowerCase().includes(busqueda)
  );

  document.getElementById("totalClientes").textContent = clientes.length;

  if (!filtrados.length) {
    lista.innerHTML = "<p>No hay clientes que mostrar.</p>";
    return;
  }

  lista.innerHTML = filtrados.map(cliente => `
    <article class="cliente-card">
      <h3>${escapar(cliente.nombre)}</h3>
      <p>Teléfono: ${escapar(cliente.telefono || "No indicado")}</p>
      <p>Documento: ${escapar(cliente.documento || "No indicado")}</p>
      <p>Dirección: ${escapar(cliente.direccion || "No indicada")}</p>
      <p>Zona: ${escapar(cliente.zona || "No indicada")}</p>
      <button type="button" data-editar="${escapar(cliente.id)}">Editar</button>
      <button type="button" data-eliminar="${escapar(cliente.id)}">Eliminar</button>
    </article>
  `).join("");

  lista.querySelectorAll("[data-editar]").forEach(boton => {
    boton.addEventListener("click", () => editarCliente(boton.dataset.editar));
  });

  lista.querySelectorAll("[data-eliminar]").forEach(boton => {
    boton.addEventListener("click", () => eliminarCliente(boton.dataset.eliminar));
  });
}

function editarCliente(id) {
  const cliente = clientes.find(item => item.id === id);
  if (!cliente) return;

  document.getElementById("clienteId").value = cliente.id;
  document.getElementById("nombreCliente").value = cliente.nombre;
  document.getElementById("telefonoCliente").value = cliente.telefono;
  document.getElementById("documentoCliente").value = cliente.documento;
  document.getElementById("direccionCliente").value = cliente.direccion;
  document.getElementById("zonaCliente").value = cliente.zona;

  document.getElementById("nombreCliente").focus();
}

function eliminarCliente(id) {
  const cliente = clientes.find(item => item.id === id);
  if (!cliente) return;

  if (!confirm(`¿Eliminar al cliente ${cliente.nombre}?`)) return;

  clientes = clientes.filter(item => item.id !== id);
  guardarClientes();
  renderizarLista();
}

function abrirModulo(vista) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === vista);
  });

  if (pageTitle) {
    pageTitle.textContent = titleMap[vista] || "El Imperio de la Moda";
  }

  sidebar?.classList.remove("open");

  if (vista === "clientes") {
    mostrarClientes();
  } else {
    alert("El módulo " + (titleMap[vista] || vista) +
      " todavía está pendiente de desarrollo.");
  }
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => abrirModulo(button.dataset.view));
});

document.getElementById("menuBtn")?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

const fecha = document.getElementById("today");
if (fecha) {
  fecha.textContent = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}
