// ==================== ELEMENTOS DEL DOM ====================
const form = document.getElementById('expenseForm');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const btnHoy = document.getElementById('btnHoy');
const btnAddAnother = document.getElementById('btnAddAnother');
const btnViewList = document.getElementById('btnViewList');
const btnViewSheet = document.getElementById('btnViewSheet');
const btnRetry = document.getElementById('btnRetry');
const btnDismissError = document.getElementById('btnDismissError');
const btnRefresh = document.getElementById('btnRefresh');
const btnGoToAdd = document.getElementById('btnGoToAdd');

const fechaInput = document.getElementById('fecha');
const importeInput = document.getElementById('importe');
const categoriaInput = document.getElementById('categoria');
const descripcionInput = document.getElementById('descripcion');

const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const expenseSummary = document.getElementById('expenseSummary');
const errorBody = document.getElementById('errorBody');
const charCount = document.getElementById('charCount');

// Tabs
const tabAdd = document.getElementById('tabAdd');
const tabList = document.getElementById('tabList');
const contentAdd = document.getElementById('contentAdd');
const contentList = document.getElementById('contentList');
const expenseCount = document.getElementById('expenseCount');

// List view
const expensesList = document.getElementById('expensesList');
const loadingExpenses = document.getElementById('loadingExpenses');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

// ==================== ESTADO DE LA APLICACIÓN ====================
let gastosCache = [];
let isEditMode = false;
let gastoEnEdicion = null;
let currentSheetId = null; // Se obtendrá dinámicamente
let currentSheetName = ''; // Nombre de la hoja actual (ej: "NOV")

// ==================== FUNCIONES DE HOJAS MENSUALES ====================

// Obtener el nombre de la hoja del mes actual (3 letras en mayúsculas)
function obtenerNombreHojaMesActual() {
    const meses = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const hoy = new Date();
    const mesIndex = hoy.getMonth(); // 0-11
    return meses[mesIndex];
}

// Obtener el nombre de la hoja de un mes específico (para fechas personalizadas)
function obtenerNombreHojaPorFecha(fechaDDMMYYYY) {
    const meses = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    if (!fechaDDMMYYYY) return obtenerNombreHojaMesActual();

    const [dia, mes, año] = fechaDDMMYYYY.split('/');
    const mesIndex = parseInt(mes) - 1; // 1-12 a 0-11
    return meses[mesIndex];
}

// Obtener el Sheet ID de una hoja por su nombre
async function obtenerSheetIdPorNombre(nombreHoja) {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID
        });

        const sheets = response.result.sheets;
        const sheet = sheets.find(s => s.properties.title === nombreHoja);

        if (sheet) {
            return sheet.properties.sheetId;
        } else {
            console.error(`❌ No se encontró la hoja "${nombreHoja}"`);
            throw new Error(`No se encontró la hoja "${nombreHoja}". Asegúrate de que existe en el spreadsheet.`);
        }
    } catch (error) {
        console.error('Error al obtener Sheet ID:', error);
        throw error;
    }
}

// Inicializar la hoja del mes actual
async function inicializarHojaMesActual() {
    currentSheetName = obtenerNombreHojaMesActual();
    try {
        currentSheetId = await obtenerSheetIdPorNombre(currentSheetName);
        console.log(`✅ Usando hoja del mes: ${currentSheetName} (ID: ${currentSheetId})`);

        // Actualizar el indicador visual del mes
        actualizarIndicadorMes();
    } catch (error) {
        console.error(`❌ Error al inicializar hoja del mes ${currentSheetName}:`, error);
        mostrarErrorMessage(`No se encontró la hoja del mes actual "${currentSheetName}". Verifica que existe en el spreadsheet "Economía Familia".`);
    }
}

// Actualizar el indicador del mes en el header
function actualizarIndicadorMes() {
    const mesesNombres = {
        'JAN': 'Enero',
        'FEB': 'Febrero',
        'MAR': 'Marzo',
        'APR': 'Abril',
        'MAY': 'Mayo',
        'JUN': 'Junio',
        'JUL': 'Julio',
        'AUG': 'Agosto',
        'SEP': 'Septiembre',
        'OCT': 'Octubre',
        'NOV': 'Noviembre',
        'DEC': 'Diciembre'
    };

    const monthIndicator = document.getElementById('monthIndicator');
    const nombreMes = mesesNombres[currentSheetName] || currentSheetName;
    const año = new Date().getFullYear();

    if (monthIndicator) {
        monthIndicator.textContent = `📅 ${nombreMes} ${año}`;
    }
}

// ==================== FUNCIONES AUXILIARES ====================

// Función para limpiar y parsear importes (elimina símbolos de moneda y convierte a número)
function parsearImporte(importe) {
    if (!importe) return 0;
    // Convertir a string y eliminar símbolos de moneda, espacios, y reemplazar comas por puntos
    const importeLimpio = importe.toString()
        .replace(/[€$£¥]/g, '')  // Eliminar símbolos de moneda
        .replace(/\s/g, '')       // Eliminar espacios
        .replace(',', '.');       // Reemplazar coma por punto
    const valor = parseFloat(importeLimpio);
    return isNaN(valor) ? 0 : valor;
}

// Función para formatear fecha a DD/MM/YYYY
function formatearFecha(fechaISO) {
    if (!fechaISO) return getFechaHoy();
    const [año, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${año}`;
}

// Función para convertir diferentes formatos de fecha a YYYY-MM-DD
function formatearFechaISO(fechaStr) {
    if (!fechaStr || typeof fechaStr !== 'string') {
        console.warn('formatearFechaISO: fecha vacía o no es string:', fechaStr);
        return '';
    }

    // Limpiar espacios en blanco
    const fechaLimpia = fechaStr.trim();

    // Verificar si ya está en formato ISO (YYYY-MM-DD)
    if (fechaLimpia.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fechaLimpia;
    }

    // Manejar formato "Nov-4" o "Nov-04" (mes abreviado-día) de Google Sheets
    const mesesAbrev = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const matchMesAbrev = fechaLimpia.match(/^([A-Za-z]{3})-(\d{1,2})$/);
    if (matchMesAbrev) {
        const mesAbrev = matchMesAbrev[1];
        const dia = matchMesAbrev[2].padStart(2, '0');
        const mesNum = mesesAbrev[mesAbrev];

        if (mesNum) {
            // Usar el año actual
            const añoActual = new Date().getFullYear();
            const resultado = `${añoActual}-${mesNum}-${dia}`;
            console.log('formatearFechaISO (formato Google Sheets):', fechaLimpia, '=>', resultado);
            return resultado;
        }
    }

    // Convertir de DD/MM/YYYY a YYYY-MM-DD
    const partes = fechaLimpia.split('/');
    if (partes.length !== 3) {
        console.warn('formatearFechaISO: formato de fecha inválido:', fechaLimpia);
        return '';
    }

    const [dia, mes, año] = partes;

    // Validar que son números válidos
    const diaNum = parseInt(dia);
    const mesNum = parseInt(mes);
    const añoNum = parseInt(año);

    if (isNaN(diaNum) || isNaN(mesNum) || isNaN(añoNum)) {
        console.warn('formatearFechaISO: partes no numéricas:', { dia, mes, año });
        return '';
    }

    // Asegurar que tienen el formato correcto con padding de ceros
    const diaF = dia.trim().padStart(2, '0');
    const mesF = mes.trim().padStart(2, '0');
    const añoF = año.trim();

    const resultado = `${añoF}-${mesF}-${diaF}`;
    console.log('formatearFechaISO:', fechaLimpia, '=>', resultado);
    return resultado;
}

// Función para formatear la fecha de hoy en DD/MM/YYYY
function getFechaHoy() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
}

// Función para obtener la fecha de hoy en formato ISO (YYYY-MM-DD)
function getFechaHoyISO() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// ==================== VALIDACIONES ====================

function validarImporte(importe) {
    const valor = parseFloat(importe);
    if (isNaN(valor) || valor <= 0) {
        return { valido: false, mensaje: 'El importe debe ser mayor que 0' };
    }
    return { valido: true };
}

function validarCategoria(categoria) {
    if (!categoria) {
        return { valido: false, mensaje: 'Debes seleccionar una categoría' };
    }
    return { valido: true };
}

function validarDescripcion(descripcion) {
    if (!descripcion || descripcion.trim().length < 3) {
        return { valido: false, mensaje: 'La descripción debe tener al menos 3 caracteres' };
    }
    if (descripcion.trim().length > 200) {
        return { valido: false, mensaje: 'La descripción no puede tener más de 200 caracteres' };
    }
    return { valido: true };
}

// ==================== UI HELPERS ====================

function mostrarFormulario() {
    form.style.display = 'block';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

function ocultarFormulario() {
    form.style.display = 'none';
}

function mostrarSuccessMessage(datos) {
    ocultarFormulario();
    errorMessage.style.display = 'none';

    // Construir el resumen del gasto
    const categoriaEmoji = obtenerEmojiCategoria(datos.categoria);
    expenseSummary.innerHTML = `
        <div class="summary-row">
            <span class="summary-label">Fecha</span>
            <span class="summary-value">${datos.fecha}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Importe</span>
            <span class="summary-value amount">${datos.importe} €</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Categoría</span>
            <span class="summary-value">${categoriaEmoji} ${datos.categoria}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Descripción</span>
            <span class="summary-value">${datos.descripcion}</span>
        </div>
    `;

    successMessage.style.display = 'block';
}

function mostrarErrorMessage(mensaje) {
    errorBody.textContent = mensaje;
    errorMessage.style.display = 'block';
}

function toggleBotonEnvio(enviando) {
    submitBtn.disabled = enviando;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    if (enviando) {
        btnText.textContent = 'Guardando...';
        btnIcon.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btnText.textContent = isEditMode ? 'Actualizar Gasto' : 'Guardar Gasto';
        btnIcon.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function obtenerEmojiCategoria(categoria) {
    const emojis = {
        'Vodafone': '📱',
        'Naturgy': '⚡',
        'Pagos a plazos': '💳',
        'Préstamos': '🏦',
        'Gimnasio': '💪',
        'Parking': '🅿️',
        'Suscripciones': '📺',
        'Adeslas': '🏥',
        'Hipoteca': '🏠',
        'Comunidad': '🏘️',
        'Tarjetas de crédito': '💳',
        'Supermercado': '🛒',
        'Comer fuera': '🍽️',
        'Gasolina': '⛽',
        'Compras': '🛍️',
        'Negocios': '💼',
        'Regalos': '🎁',
        'Mascotas': '🐾',
        'Salud': '💊',
        'Estudios': '📚',
        'Impuestos': '📋',
        'Andrea': '👤',
        'Lotería': '🎰',
        'Peluquería y Estética': '✂️',
        'Transporte': '🚗',
        'Coche': '🚙'
    };
    return emojis[categoria] || '📦';
}

function actualizarContadorGastos() {
    const count = gastosCache.length;
    if (count > 0) {
        expenseCount.textContent = count;
        expenseCount.style.display = 'block';
    } else {
        expenseCount.style.display = 'none';
    }
}

// ==================== TABS ====================

function cambiarTab(tabName) {
    // Actualizar tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activar tab seleccionada
    if (tabName === 'add') {
        tabAdd.classList.add('active');
        contentAdd.classList.add('active');
    } else if (tabName === 'list') {
        tabList.classList.add('active');
        contentList.classList.add('active');
        cargarGastos();
    }
}

tabAdd.addEventListener('click', () => cambiarTab('add'));
tabList.addEventListener('click', () => cambiarTab('list'));

// ==================== GOOGLE SHEETS API ====================

async function encontrarPrimeraFilaVacia() {
    try {
        // Leer todas las columnas relevantes para encontrar la primera fila realmente vacía
        // B+C = fecha (mergeadas), D+E+F = importe (mergeadas), G = categoría, K = descripción
        const range = `${currentSheetName}!B38:N`;
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range,
        });

        const values = response.result.values || [];

        // Encontrar la primera fila donde todas las columnas relevantes estén vacías
        // B=0, C=1, D=2, E=3, F=4, G=5, H=6, I=7, J=8, K=9
        for (let i = 0; i < values.length; i++) {
            const row = values[i];
            const fecha = row[0] ? row[0].toString().trim() : '';
            const importe = row[2] ? row[2].toString().trim() : '';
            const categoria = row[5] ? row[5].toString().trim() : '';
            const descripcion = row[9] ? row[9].toString().trim() : '';

            // Si todas las columnas están vacías, esta es la primera fila vacía
            if (!fecha && !importe && !categoria && !descripcion) {
                return 38 + i;
            }
        }

        // Si no se encontró ninguna fila vacía, la siguiente es después de todas las filas con datos
        return 38 + values.length;
    } catch (error) {
        console.error('Error al encontrar la primera fila vacía:', error);
        return 38;
    }
}

async function cargarGastos() {
    loadingExpenses.style.display = 'block';
    emptyState.style.display = 'none';
    expensesList.innerHTML = '';

    try {
        // B+C = fecha (mergeadas), D+E+F = importe (mergeadas), G = categoría, K = descripción
        const range = `${currentSheetName}!B38:N`;
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range,
        });

        const values = response.result.values || [];

        if (values.length === 0) {
            loadingExpenses.style.display = 'none';
            emptyState.style.display = 'block';
            gastosCache = [];
            actualizarContadorGastos();
            return;
        }

        // Procesar los datos
        // B=0, C=1, D=2, E=3, F=4, G=5, H=6, I=7, J=8, K=9
        gastosCache = values.map((row, index) => {
            // Debug: ver qué hay en cada fila
            if (row && row.length > 0) {
                console.log(`Fila ${38 + index}:`, {
                    fecha_B: row[0],
                    C: row[1],
                    importe_D: row[2],
                    E: row[3],
                    F: row[4],
                    categoria_G: row[5],
                    descripcion_K: row[9]
                });
            }
            return {
                fila: 38 + index,
                fecha: row[0] ? row[0].toString().trim() : '',
                importe: row[2] ? row[2].toString().trim() : '0',
                categoria: row[5] ? row[5].toString().trim() : '',
                descripcion: row[9] ? row[9].toString().trim() : ''
            };
        }).filter(gasto => {
            // Filtrar filas completamente vacías o con solo espacios
            const tieneFecha = gasto.fecha !== '';
            const tieneImporte = gasto.importe !== '0' && gasto.importe !== '';
            const tieneCategoria = gasto.categoria !== '';
            const tieneDescripcion = gasto.descripcion !== '';

            // Una fila válida debe tener al menos fecha O (categoría Y descripción)
            return (tieneFecha && (tieneCategoria || tieneDescripcion)) ||
                   (tieneImporte && tieneDescripcion);
        });

        loadingExpenses.style.display = 'none';

        if (gastosCache.length === 0) {
            emptyState.style.display = 'block';
        } else {
            renderizarListaGastos();
        }

        actualizarContadorGastos();
    } catch (error) {
        console.error('Error al cargar gastos:', error);
        loadingExpenses.style.display = 'none';
        expensesList.innerHTML = `
            <div class="error-card">
                <div class="error-header">
                    <div class="error-icon">❌</div>
                    <h3>Error al cargar gastos</h3>
                </div>
                <div class="error-body">
                    ${error.result?.error?.message || 'No se pudieron cargar los gastos. Verifica tu conexión.'}
                </div>
            </div>
        `;
    }
}

function renderizarListaGastos(terminoBusqueda = '') {
    // Filtrar por término de búsqueda si existe
    let gastosFiltrados = gastosCache;
    if (terminoBusqueda) {
        const termino = terminoBusqueda.toLowerCase();
        gastosFiltrados = gastosCache.filter(gasto => {
            const fecha = gasto.fecha.toLowerCase();
            const importe = gasto.importe.toString().toLowerCase();
            const categoria = gasto.categoria.toLowerCase();
            const descripcion = gasto.descripcion.toLowerCase();

            return fecha.includes(termino) ||
                   importe.includes(termino) ||
                   categoria.includes(termino) ||
                   descripcion.includes(termino);
        });
    }

    // Si no hay resultados de búsqueda
    if (terminoBusqueda && gastosFiltrados.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha (más recientes primero)
    const gastosOrdenados = [...gastosFiltrados].reverse();

    // Calcular total (solo de los gastos filtrados)
    const total = gastosFiltrados.reduce((sum, gasto) => {
        const importe = parsearImporte(gasto.importe);
        return sum + importe;
    }, 0);

    // Renderizar cada gasto
    expensesList.innerHTML = gastosOrdenados.map(gasto => {
        const categoriaEmoji = obtenerEmojiCategoria(gasto.categoria);
        const importe = parsearImporte(gasto.importe);
        const importeFormateado = importe.toFixed(2);

        return `
            <div class="expense-card" data-fila="${gasto.fila}">
                <div class="expense-card-header">
                    <div class="expense-card-date">
                        <span>📅</span>
                        <span>${gasto.fecha}</span>
                    </div>
                    <div class="expense-card-amount">${importeFormateado} €</div>
                </div>
                <div class="expense-card-body">
                    <div class="expense-card-category">
                        <span>${categoriaEmoji}</span>
                        <span>${gasto.categoria}</span>
                    </div>
                    <div class="expense-card-description">${gasto.descripcion}</div>
                </div>
                <div class="expense-card-footer">
                    <button class="btn btn-outline btn-icon-only btn-edit-expense" data-fila="${gasto.fila}">
                        <span class="btn-icon">✏️</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Añadir resumen total
    expensesList.innerHTML += `
        <div class="expenses-summary">
            <div class="expenses-summary-content">
                <div>
                    <div class="expenses-summary-label">Total de gastos${terminoBusqueda ? ' (filtrados)' : ''}</div>
                    <div class="expenses-summary-count">${gastosFiltrados.length} ${gastosFiltrados.length === 1 ? 'gasto' : 'gastos'}</div>
                </div>
                <div class="expenses-summary-amount">${total.toFixed(2)} €</div>
            </div>
        </div>
    `;

    // Añadir event listeners a los botones de editar
    document.querySelectorAll('.btn-edit-expense').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fila = parseInt(e.currentTarget.getAttribute('data-fila'));
            editarGasto(fila);
        });
    });
}

function editarGasto(fila) {
    const gasto = gastosCache.find(g => g.fila === fila);
    if (!gasto) {
        console.error('No se encontró el gasto con fila:', fila);
        return;
    }

    // Cambiar a la vista de añadir
    cambiarTab('add');

    // Rellenar el formulario
    console.log('=== EDITANDO GASTO ===');
    console.log('Datos del gasto:', gasto);

    // Convertir fecha de DD/MM/YYYY o formato Google Sheets a YYYY-MM-DD para el datepicker
    if (gasto.fecha && gasto.fecha.trim() !== '') {
        console.log('Fecha original:', gasto.fecha);
        const fechaISO = formatearFechaISO(gasto.fecha);
        console.log('Fecha convertida a ISO:', fechaISO);

        if (fechaISO && fechaISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Asegurarse de que el input esté listo
            setTimeout(() => {
                fechaInput.value = fechaISO;
                console.log('Fecha asignada al input. Valor actual:', fechaInput.value);
                // Forzar actualización visual
                fechaInput.dispatchEvent(new Event('input', { bubbles: true }));
                fechaInput.dispatchEvent(new Event('change', { bubbles: true }));
            }, 0);
        } else {
            console.warn('❌ Formato de fecha inválido después de conversión:', fechaISO);
            fechaInput.value = getFechaHoyISO();
        }
    } else {
        console.warn('Fecha vacía en el gasto, usando fecha de hoy');
        fechaInput.value = getFechaHoyISO();
    }

    // Parsear el importe correctamente
    const importeNum = parsearImporte(gasto.importe);
    importeInput.value = importeNum.toFixed(2);

    categoriaInput.value = gasto.categoria;
    descripcionInput.value = gasto.descripcion;
    charCount.textContent = `${gasto.descripcion.length}/200`;

    // Marcar como modo edición
    isEditMode = true;
    gastoEnEdicion = gasto;

    // Cambiar el botón
    submitBtn.querySelector('.btn-text').textContent = 'Actualizar Gasto';
    submitBtn.querySelector('.btn-icon').textContent = '✏️';

    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Foco en el campo de importe en lugar de fecha (más común editarlo)
    setTimeout(() => {
        importeInput.focus();
        importeInput.select();
        console.log('=== FORMULARIO LISTO PARA EDITAR ===');
    }, 150);
}

async function enviarAGoogleSheets(datos, fila = null) {
    try {
        // Si no se especifica fila, encontrar la primera vacía
        const filaAUsar = fila || await encontrarPrimeraFilaVacia();

        // Preparar los datos según la estructura especificada
        // B+C = fecha (mergeadas), D+E+F = importe (mergeadas), G = categoría, K = descripción
        const valores = [
            datos.fecha,         // B
            '',                  // C (vacío porque está mergeado con B)
            datos.importe,       // D
            '',                  // E (vacío porque está mergeado con D)
            '',                  // F (vacío porque está mergeado con D)
            datos.categoria,     // G
            '',                  // H (vacío porque está mergeado con G)
            '',                  // I (vacío porque está mergeado con G)
            '',                  // J (vacío porque está mergeado con G)
            datos.descripcion,   // K
            '',                  // L (vacío porque está mergeado con K)
            '',                  // M (vacío porque está mergeado con K)
            ''                   // N (vacío porque está mergeado con K)
        ];

        const range = `${currentSheetName}!B${filaAUsar}:N${filaAUsar}`;

        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [valores]
            }
        });

        // Aplicar los merges solo si es una fila nueva
        if (!fila) {
            await aplicarMerges(filaAUsar);
        }

        return { response, fila: filaAUsar };
    } catch (error) {
        console.error('Error al enviar datos:', error);
        throw error;
    }
}

async function aplicarMerges(fila) {
    try {
        const requests = [
            // Merge B-C (fecha)
            {
                mergeCells: {
                    range: {
                        sheetId: currentSheetId,
                        startRowIndex: fila - 1,
                        endRowIndex: fila,
                        startColumnIndex: 1,
                        endColumnIndex: 3
                    },
                    mergeType: 'MERGE_ALL'
                }
            },
            // Merge D-F (importe)
            {
                mergeCells: {
                    range: {
                        sheetId: currentSheetId,
                        startRowIndex: fila - 1,
                        endRowIndex: fila,
                        startColumnIndex: 3,
                        endColumnIndex: 6
                    },
                    mergeType: 'MERGE_ALL'
                }
            },
            // Merge G-J (categoría)
            {
                mergeCells: {
                    range: {
                        sheetId: currentSheetId,
                        startRowIndex: fila - 1,
                        endRowIndex: fila,
                        startColumnIndex: 6,
                        endColumnIndex: 10
                    },
                    mergeType: 'MERGE_ALL'
                }
            },
            // Merge K-N (descripción)
            {
                mergeCells: {
                    range: {
                        sheetId: currentSheetId,
                        startRowIndex: fila - 1,
                        endRowIndex: fila,
                        startColumnIndex: 10,
                        endColumnIndex: 14
                    },
                    mergeType: 'MERGE_ALL'
                }
            }
        ];

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            resource: { requests }
        });
    } catch (error) {
        console.error('Error al aplicar merges:', error);
    }
}

// ==================== EVENT HANDLERS ====================

// Botón "Hoy" para el datepicker
btnHoy.addEventListener('click', () => {
    fechaInput.value = getFechaHoyISO();
});

// Contador de caracteres para la descripción
descripcionInput.addEventListener('input', function() {
    const length = this.value.length;
    charCount.textContent = `${length}/200`;

    if (length > 200) {
        charCount.style.color = 'var(--error-color)';
    } else {
        charCount.style.color = 'var(--text-light)';
    }
});

// Validación en tiempo real del importe
importeInput.addEventListener('blur', function() {
    if (this.value) {
        const valor = parseFloat(this.value);
        if (!isNaN(valor)) {
            this.value = valor.toFixed(2);
        }
    }
});

// Submit del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fecha = fechaInput.value;
    const importe = importeInput.value;
    const categoria = categoriaInput.value;
    const descripcion = descripcionInput.value.trim();

    // Validaciones
    const validacionImporte = validarImporte(importe);
    if (!validacionImporte.valido) {
        mostrarErrorMessage(validacionImporte.mensaje);
        return;
    }

    const validacionCategoria = validarCategoria(categoria);
    if (!validacionCategoria.valido) {
        mostrarErrorMessage(validacionCategoria.mensaje);
        return;
    }

    const validacionDescripcion = validarDescripcion(descripcion);
    if (!validacionDescripcion.valido) {
        mostrarErrorMessage(validacionDescripcion.mensaje);
        return;
    }

    // Preparar datos
    const datos = {
        fecha: formatearFecha(fecha),
        importe: parseFloat(importe).toFixed(2),
        categoria: categoria,
        descripcion: descripcion
    };

    // Enviar a Google Sheets
    toggleBotonEnvio(true);

    try {
        const filaAEditar = isEditMode ? gastoEnEdicion.fila : null;
        const { response, fila } = await enviarAGoogleSheets(datos, filaAEditar);

        // Mostrar mensaje de éxito
        mostrarSuccessMessage(datos);

        // Reset del modo edición
        isEditMode = false;
        gastoEnEdicion = null;

        // Actualizar el cache si estamos en modo edición
        if (filaAEditar) {
            const index = gastosCache.findIndex(g => g.fila === filaAEditar);
            if (index !== -1) {
                gastosCache[index] = {
                    fila: filaAEditar,
                    ...datos
                };
            }
        }

        actualizarContadorGastos();
    } catch (error) {
        console.error('Error:', error);
        let mensajeError = 'Error al guardar el gasto. ';

        if (error.result && error.result.error) {
            mensajeError += error.result.error.message;
        } else {
            mensajeError += 'Verifica tu conexión y la configuración de Google Sheets.';
        }

        mostrarErrorMessage(mensajeError);
    } finally {
        toggleBotonEnvio(false);
    }
});

// Botón "Añadir otro"
btnAddAnother.addEventListener('click', () => {
    form.reset();
    charCount.textContent = '0/200';
    isEditMode = false;
    gastoEnEdicion = null;
    mostrarFormulario();

    // Restaurar el botón
    submitBtn.querySelector('.btn-text').textContent = 'Guardar Gasto';
    submitBtn.querySelector('.btn-icon').textContent = '💾';

    fechaInput.focus();
});

// Botón "Ver lista"
btnViewList.addEventListener('click', () => {
    cambiarTab('list');
});

// Botón "Ver en Sheets"
btnViewSheet.addEventListener('click', () => {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=${currentSheetId}`;
    window.open(url, '_blank');
});

// Botón "Reintentar"
btnRetry.addEventListener('click', () => {
    errorMessage.style.display = 'none';
    if (form.style.display === 'none') {
        mostrarFormulario();
    }
});

// Botón "Cerrar" del error
btnDismissError.addEventListener('click', () => {
    errorMessage.style.display = 'none';
    mostrarFormulario();
});

// Botón "Limpiar"
resetBtn.addEventListener('click', () => {
    form.reset();
    charCount.textContent = '0/200';
    isEditMode = false;
    gastoEnEdicion = null;
    errorMessage.style.display = 'none';

    // Restaurar el botón de submit
    submitBtn.querySelector('.btn-text').textContent = 'Guardar Gasto';
    submitBtn.querySelector('.btn-icon').textContent = '💾';

    fechaInput.focus();
});

// Botón "Actualizar" en la lista
btnRefresh.addEventListener('click', () => {
    cargarGastos();
});

// Botón "Añadir Gasto" en empty state
btnGoToAdd.addEventListener('click', () => {
    cambiarTab('add');
});

// Buscador en la lista de gastos
searchInput.addEventListener('input', function() {
    const termino = this.value.trim();
    renderizarListaGastos(termino);
});

// ==================== AUTENTICACIÓN ====================

let isSignedIn = false;
let gapiInited = false;
let gisInited = false;
let tokenClient;

// Inicializar cliente de Google Identity Services
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: CONFIG.API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        });
        gapiInited = true;
        console.log('✅ GAPI client inicializado');
        maybeEnableButtons();
    } catch (error) {
        console.error('❌ Error al inicializar GAPI client:', error);
        mostrarErrorMessage('Error al inicializar Google API. Verifica tu configuración.');
    }
}

function gisLoaded() {
    // Obtener el origin actual para el redirect_uri
    const redirectUri = window.location.origin;
    console.log('🔗 Redirect URI configurado:', redirectUri);
    console.log('ℹ️  Asegúrate de que este URI esté en "Orígenes de JavaScript autorizados" y "URIs de redireccionamiento" en Google Cloud Console');

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: '', // se definirá más tarde
        redirect_uri: redirectUri,
    });
    gisInited = true;
    console.log('✅ GIS client inicializado');
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        console.log('✅ Ambos clientes inicializados correctamente');

        // Verificar si ya está autenticado
        const token = gapi.client.getToken();
        if (token !== null) {
            isSignedIn = true;
            onSignInSuccess();
        } else {
            mostrarPantallaLogin();
        }
    }
}

function mostrarPantallaLogin() {
    const loginHTML = `
        <div class="login-container">
            <div class="login-card">
                <h2>🔐 Autenticación Requerida</h2>
                <p>Para usar esta aplicación necesitas autenticarte con tu cuenta de Google.</p>
                <button id="btnAutorizar" class="btn btn-primary">
                    <span class="btn-icon">🔑</span>
                    Autorizar con Google
                </button>
                <p class="help-text">
                    La aplicación necesita permiso para leer y escribir en tu Google Sheet "Economía Familia"
                </p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', loginHTML);
    document.getElementById('btnAutorizar').addEventListener('click', handleAuthClick);

    // Ocultar el contenido principal
    document.querySelector('.container').style.display = 'none';
}

function ocultarPantallaLogin() {
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        loginContainer.remove();
    }
    document.querySelector('.container').style.display = 'block';
}

function handleAuthClick() {
    console.log('🔐 Iniciando autenticación...');

    tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
            console.error('❌ Error de autenticación:', response.error);
            if (response.error_description) {
                console.error('📄 Descripción:', response.error_description);
            }
            mostrarErrorMessage('Error al autenticar: ' + response.error + '. Revisa la consola para más detalles.');
            throw response;
        }
        console.log('✅ Autenticación exitosa');
        isSignedIn = true;
        ocultarPantallaLogin();
        await onSignInSuccess();
    };

    if (gapi.client.getToken() === null) {
        // Solicitar token de acceso
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        // Ya hay token, solo solicitar uno nuevo
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        isSignedIn = false;
        mostrarPantallaLogin();
    }
}

async function onSignInSuccess() {
    try {
        // Inicializar la hoja del mes actual
        await inicializarHojaMesActual();

        // Cargar gastos inicial para actualizar el contador
        await cargarGastos();

        // Volver a la tab de añadir después de cargar
        cambiarTab('add');
    } catch (error) {
        console.error('❌ Error al inicializar después del login:', error);
        mostrarErrorMessage('Error al conectar con Google Sheets. Verifica que el spreadsheet existe.');
    }
}

// ==================== INICIALIZACIÓN ====================

function inicializarGoogleAPI() {
    // Cargar GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = gapiLoaded;
    document.head.appendChild(gapiScript);

    // Cargar GIS (Google Identity Services)
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = gisLoaded;
    document.head.appendChild(gisScript);
}

// Cargar la API de Google cuando se carga la página
window.addEventListener('load', () => {
    inicializarGoogleAPI();

    // Foco inicial en el campo de importe (el más común)
    setTimeout(() => {
        if (isSignedIn) {
            importeInput.focus();
        }
    }, 500);
});
