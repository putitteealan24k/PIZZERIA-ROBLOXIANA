
let carrito = JSON.parse(localStorage.getItem('robloxPizzaCarrito')) || [];


const PRECIOS = {
    
    'Pepperoni': 20.00,
    'Champiñones': 15.00,
    'Tocino': 20.00,
    'Pimientos': 15.00,
    
    // Extras
    'Cola grande': 20.00,
    'Limonada': 15.00,
    'Papas Fritas Grandes': 30.00,
    'Palitos de Queso': 40.00
};


console.log("Scripts.js cargado correctamente. Iniciando Pizzeria Roblox.");




function guardarCarrito() {
    localStorage.setItem('robloxPizzaCarrito', JSON.stringify(carrito));
}


function calcularCostoPedido(pedido) {
    // Usamos el precio base guardado en el pedido (viene de index.html)
    let subtotal = pedido.precioBase || 0; 
    
    // Sumar ingredientes
    pedido.ingredientes.forEach(ing => {
        subtotal += PRECIOS[ing] || 0;
    });

    // Sumar bebida
    if (pedido.bebida) {
        subtotal += PRECIOS[pedido.bebida] || 0;
    }

    // Sumar extras
    pedido.extras.forEach(extra => {
        subtotal += PRECIOS[extra] || 0;
    });

    return subtotal;
}

/**
 * Elimina un artículo del carrito por su ID
 */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(pedido => pedido.id !== id);
    guardarCarrito();
    renderizarCarrito();
}

// =======================================================
// 3. FUNCIONES PARA index.html (Selección de Tamaño)
// =======================================================

/**
 * Guarda el tamaño seleccionado en localStorage y activa el botón de menú.
 */
function seleccionarTamano(tamano, precio) {
    // 1. Guardar la selección en el localStorage
    localStorage.setItem('pizzaTamanoSeleccionado', tamano);
    localStorage.setItem('pizzaPrecioSeleccionado', precio);

    // 2. Resaltar la selección
    const opciones = document.querySelectorAll('.opcion-tamano');
    opciones.forEach(op => {
        op.classList.remove('seleccionado'); 
        if (op.dataset.tamano === tamano) {
            op.classList.add('seleccionado'); 
        }
    });

    // 3. Activar y modificar el botón principal
    const btnMenu = document.getElementById('btn-ir-menu');
    if (btnMenu) {
        btnMenu.disabled = false;
        btnMenu.textContent = `¡Vamos al Menú para tu Pizza ${tamano}! ➡️`;
        btnMenu.onclick = () => {
            window.location.href = 'menu.html';
        };
    }
}


// =======================================================
// 4. FUNCIONES PARA menu.html (Añadir al Carrito)
// =======================================================

/**
 * Función que se ejecuta al presionar "Añadir al Carrito"
 */
function agregarAlCarrito() {
    const form = document.getElementById('formulario-pizza');
    if (!form) return;

    // Obtener el tamaño y precio BASE del localStorage
    const tamanoElegido = localStorage.getItem('pizzaTamanoSeleccionado') || 'Grande'; 
    const precioBase = parseFloat(localStorage.getItem('pizzaPrecioSeleccionado')) || 0;

    // 1. Recoger ingredientes de la pizza
    const ingredientesSeleccionados = Array.from(form.querySelectorAll('input[name="ingrediente"]:checked'))
        .map(input => input.value);
    
    // 2. Recoger bebida
    const bebidaSeleccionada = form.querySelector('select[name="bebida"]').value;

    // 3. Recoger adicionales/extras
    const extrasSeleccionados = Array.from(form.querySelectorAll('input[name="extra"]:checked'))
        .map(input => input.value);

    // Crear el objeto del nuevo pedido
    const nuevoPedido = {
        id: Date.now(), 
        base: tamanoElegido,
        precioBase: precioBase, 
        ingredientes: ingredientesSeleccionados,
        bebida: bebidaSeleccionada !== 'Ninguno' ? bebidaSeleccionada : null,
        extras: extrasSeleccionados,
    };
    
    carrito.push(nuevoPedido); 
    guardarCarrito(); 

    alert('¡Pizza y Extras añadidos al Carrito!');
    window.location.href = 'carrito.html'; 
}


// =======================================================
// 5. FUNCIONES PARA carrito.html (Renderizar)
// =======================================================

/**
 * Función para renderizar el contenido del carrito
 */
function renderizarCarrito() {
    const resumenDiv = document.getElementById('resumen-orden');
    const totalSpan = document.getElementById('total-final');
    const btnPago = document.getElementById('btn-ir-pago');

    if (!resumenDiv) return; 

    let htmlCarrito = '';
    // Calcular el total global sumando el costo de cada pedido en el carrito
    let totalGlobal = carrito.reduce((sum, pedido) => sum + calcularCostoPedido(pedido), 0);

    if (carrito.length === 0) {
        htmlCarrito = '<p class="carrito-vacio">Tu mochila de pedidos está vacía. ¡Añade tu primera pizza!</p>';
        btnPago.style.display = 'none';
    } else {
        btnPago.style.display = 'block';
        
        carrito.forEach((pedido, index) => {
            const costoPedido = calcularCostoPedido(pedido);

            htmlCarrito += `
                <div class="item-carrito">
                    <h4>Pedido #${index + 1} - Base: ${pedido.base}</h4>
                    <p><strong>Ingredientes:</strong> ${pedido.ingredientes.join(', ') || 'Queso y salsa (básicos)'}</p>
                    <p><strong>Bebida:</strong> ${pedido.bebida || 'Ninguna'}</p>
                    <p><strong>Extras:</strong> ${pedido.extras.join(', ') || 'Ninguno'}</p>
                    <p class="costo-item">Subtotal: $${costoPedido.toFixed(2)}</p>
                    <button class="boton-eliminar" data-id="${pedido.id}">X Eliminar</button>
                </div>
                <hr>
            `;
        });
    }

    resumenDiv.innerHTML = htmlCarrito;
    totalSpan.textContent = `$${totalGlobal.toFixed(2)}`;

    // Añadir eventos a los botones de eliminar
    document.querySelectorAll('.boton-eliminar').forEach(button => {
        button.addEventListener('click', function() {
            eliminarDelCarrito(parseInt(this.dataset.id));
        });
    });
}


// =======================================================
// 6. FUNCIONES PARA metodosdepago.html (Pago)
// =======================================================

/**
 * Función que se ejecuta al enviar el formulario de pago
 */
function confirmarPago(event) {
    event.preventDefault();
    
    // Aseguramos que el usuario seleccionó un método
    const pagoSeleccionado = document.querySelector('input[name="pago"]:checked');
    if (!pagoSeleccionado) {
        alert("Por favor, selecciona un método de pago.");
        return;
    }

    // Leemos el total que debe estar visible en la página de pago
    const totalPagarElemento = document.getElementById('total-pago-final');
    const totalPagar = totalPagarElemento ? totalPagarElemento.textContent : '$ERROR';

    alert(`¡Pedido Confirmado! Se seleccionó ${pagoSeleccionado.value}. El total a pagar es ${totalPagar}. \n\n¡Tu pizza está en camino!`);

    // ** Lógica de Limpieza **
    carrito = []; 
    localStorage.clear(); // Limpiamos todo lo relacionado al pedido
    
    // Opcional: Redirigir
    // window.location.href = 'gracias.html'; 
}


// =======================================================
// 7. INICIALIZACIÓN DE EVENTOS (EJECUCIÓN)
// =======================================================

// --- PARA index.html (Selección de Tamaño) ---
if (document.URL.includes("index.html")) {
    const opcionesTamano = document.querySelectorAll('.opcion-tamano');
    
    opcionesTamano.forEach(opcion => {
        opcion.addEventListener('click', function(e) {
            e.preventDefault(); 
            const tamano = this.dataset.tamano;
            const precio = this.dataset.precio;
            seleccionarTamano(tamano, precio);
        });
    });

    // Restaurar selección al cargar la página
    const tamanoGuardado = localStorage.getItem('pizzaTamanoSeleccionado');
    const precioGuardado = localStorage.getItem('pizzaPrecioSeleccionado');
    if (tamanoGuardado) {
        seleccionarTamano(tamanoGuardado, precioGuardado);
    }
}

// --- PARA menu.html (Agregar al Carrito) ---
const btnAgregar = document.getElementById('btn-agregar-carrito');
if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarAlCarrito);
}

// --- PARA carrito.html (Mostrar Carrito) ---
if (document.getElementById('resumen-orden')) {
    renderizarCarrito();
}

// --- PARA metodosdepago.html (Pago y Total) ---
const formPago = document.getElementById('formulario-pago');
if (formPago) {
    // 1. Calcular y mostrar el total global en la página de pago
    const totalGlobal = carrito.reduce((sum, pedido) => sum + calcularCostoPedido(pedido), 0);
    
    const totalDisplay = document.getElementById('total-pago-final');
    if (totalDisplay) {
        totalDisplay.textContent = `$${totalGlobal.toFixed(2)}`;
    }
    
    // 2. Asignar el evento al formulario de pago
    formPago.addEventListener('submit', confirmarPago);
}