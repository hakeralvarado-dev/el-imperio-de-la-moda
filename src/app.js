
const titleMap = {
  inicio:"Resumen general", personal:"Personal y permisos", clientes:"Clientes",
  productos:"Productos", inventario:"Inventario", ventas:"Ventas",
  consignaciones:"Consignaciones", cobros:"Cobros", zonas:"Zonas y mapa",
  reportes:"Reportes", auditoria:"Historial y auditoría"
};
const pageTitle = document.getElementById("pageTitle");
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    pageTitle.textContent = titleMap[button.dataset.view] || "El Imperio de la Moda";
    document.getElementById("sidebar").classList.remove("open");
    if (button.dataset.view !== "inicio") {
      document.querySelector(".content").scrollIntoView({behavior:"smooth"});
      window.alert("El módulo «" + pageTitle.textContent + "» está contemplado en el proyecto y se activará en su etapa de desarrollo. Esta versión inicial es una vista demostrativa.");
    }
  });
});
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});
document.getElementById("today").textContent = new Intl.DateTimeFormat("es", {
  weekday:"long", day:"numeric", month:"long", year:"numeric"
}).format(new Date());
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
