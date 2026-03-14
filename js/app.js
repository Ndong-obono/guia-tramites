// --- 1. SELECCIÓN DE ELEMENTOS ---
const contenedorTramites = document.getElementById('lista-tramites');
const buscador = document.getElementById('buscador');

// Elementos del Modal
const modal = document.getElementById('modal-tramite');
const modalBody = document.getElementById('modal-body');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');

let todosLosTramites = [];
let tramitesFiltrados = [];
const POR_PAGINA = 6;
let paginaActual = 1;

// --- 2. CARGA DE DATOS ---
async function cargarDatos() {
    try {
        const respuesta = await fetch('./data/tramites.json');
        const datos = await respuesta.json();
        todosLosTramites = datos.tramites;
        tramitesFiltrados = todosLosTramites;
        renderizarPagina();
    } catch (error) {
        console.error("Error al cargar los trámites:", error);
        contenedorTramites.innerHTML = '<p style="text-align:center; color:red;">Hubo un error al cargar la información.</p>';
    }
}

// --- 3. PAGINACIÓN ---
function renderizarPagina() {
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    mostrarTramites(tramitesFiltrados.slice(inicio, fin));
    renderizarPaginacion();
}

function renderizarPaginacion() {
    const totalPaginas = Math.ceil(tramitesFiltrados.length / POR_PAGINA);
    let paginacion = document.getElementById('paginacion');
    if (!paginacion) {
        paginacion = document.createElement('div');
        paginacion.id = 'paginacion';
        paginacion.className = 'paginacion';
        contenedorTramites.parentNode.insertBefore(paginacion, contenedorTramites.nextSibling);
    }

    if (totalPaginas <= 1) { paginacion.innerHTML = ''; return; }

    paginacion.innerHTML = `
        <button class="btn-pag" id="btnAnterior" ${paginaActual === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i> Anterior
        </button>
        <span class="pag-info">Página ${paginaActual} de ${totalPaginas}</span>
        <button class="btn-pag" id="btnSiguiente" ${paginaActual === totalPaginas ? 'disabled' : ''}>
            Siguiente <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    document.getElementById('btnAnterior').addEventListener('click', () => {
        paginaActual--;
        renderizarPagina();
        contenedorTramites.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('btnSiguiente').addEventListener('click', () => {
        paginaActual++;
        renderizarPagina();
        contenedorTramites.scrollIntoView({ behavior: 'smooth' });
    });
}

// --- 4. RENDERIZADO DE TARJETAS ---
function mostrarTramites(tramites) {
    contenedorTramites.innerHTML = '';

    if (tramites.length === 0) {
        contenedorTramites.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">No se encontraron trámites con esa búsqueda.</p>';
        return;
    }

    tramites.forEach(tramite => {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('tarjeta-tramite');

        tarjeta.innerHTML = `
            <div class="tarjeta-header">
                <span class="etiqueta-categoria">${tramite.categoria}</span>
            </div>
            <div class="tarjeta-body">
                <h3>${tramite.nombre}</h3>
                <p>${tramite.descripcion}</p>
                <div class="meta-info">
                    <span><i class="fa-regular fa-clock"></i> ${tramite.tiempo_estimado}</span>
                </div>
            </div>
            <div class="tarjeta-footer">
                <button class="btn-ver-mas">Ver Requisitos <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;

        // AGREGAR EVENTO AL BOTÓN DE ESTA TARJETA
        const botonVerMas = tarjeta.querySelector('.btn-ver-mas');
        botonVerMas.addEventListener('click', () => abrirModal(tramite));

        contenedorTramites.appendChild(tarjeta);
    });
}

// --- 4. LÓGICA DEL MODAL ---

// Función para Abrir el Modal
function abrirModal(tramite) {
    // A. Convertimos los arrays de datos en listas HTML
    const requisitosHTML = tramite.documentos_requeridos.map(req => `<li>${req}</li>`).join('');
    const pasosHTML = tramite.pasos.map(paso => `<li>${paso.descripcion}</li>`).join('');
    
    // B. Procesamos el objeto de ubicaciones
    let ubicacionesHTML = '';
    for (const [ciudad, direccion] of Object.entries(tramite.ubicacion)) {
        // Ponemos la primera letra de la ciudad en mayúscula
        const ciudadCapitalizada = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);
        ubicacionesHTML += `<p><strong>${ciudadCapitalizada}:</strong> ${direccion}</p>`;
    }

    // C. Inyectamos la información en el cuerpo del modal
    modalBody.innerHTML = `
        <h2>${tramite.nombre}</h2>
        <span class="entidad-responsable">${tramite.entidad_responsable}</span>
        
        <div class="seccion-modal">
            <h3><i class="fa-solid fa-file-signature"></i> Documentos Requeridos</h3>
            <ul class="lista-requisitos">
                ${requisitosHTML}
            </ul>
        </div>

        <div class="seccion-modal">
            <h3><i class="fa-solid fa-list-ol"></i> Pasos a seguir</h3>
            <ol class="lista-pasos">
                ${pasosHTML}
            </ol>
        </div>

        <div class="seccion-modal">
            <h3><i class="fa-solid fa-map-location-dot"></i> Dónde realizarlo</h3>
            <div class="ubicaciones">
                ${ubicacionesHTML}
                <p style="margin-top:10px;"><strong>Horario:</strong> ${tramite.horario}</p>
            </div>
        </div>

        <div class="seccion-modal">
            <h3><i class="fa-solid fa-money-bill-wave"></i> Costo y Detalles Adicionales</h3>
            <p><strong>Costo Estimado:</strong> ${tramite.costo_estimado}</p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #525F7F;"><em>Nota: ${tramite.notas}</em></p>
        </div>
    `;

    // D. Mostramos el modal
    modal.classList.remove('oculto');
    
    // E. Opcional pero profesional: bloqueamos el scroll del fondo mientras el modal está abierto
    document.body.style.overflow = 'hidden';
}

// Función para Cerrar el Modal
function cerrarModal() {
    modal.classList.add('oculto');
    document.body.style.overflow = 'auto'; // Devolvemos el scroll a la página
}

// --- 5. EVENTOS GLOBALES ---

// Cerrar al hacer clic en el botón X
btnCerrarModal.addEventListener('click', cerrarModal);

// Cerrar al hacer clic fuera del cuadro blanco (en el área oscura)
modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        cerrarModal();
    }
});

// Cerrar al presionar la tecla Escape en el teclado
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !modal.classList.contains('oculto')) {
        cerrarModal();
    }
});

// Buscador
buscador.addEventListener('input', (e) => {
    const textoBusqueda = e.target.value.toLowerCase();
    tramitesFiltrados = todosLosTramites.filter(tramite => {
        return tramite.nombre.toLowerCase().includes(textoBusqueda) ||
               tramite.categoria.toLowerCase().includes(textoBusqueda);
    });
    paginaActual = 1;
    renderizarPagina();
});

// Iniciar aplicación
cargarDatos();