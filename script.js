
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
// Forzamos la vista al tope exacto de la página
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {



    const pantallaSobre = document.getElementById('pantalla-sobre');
    const videoSobre = document.getElementById('video-sobre');
    const capaInstruccion = document.getElementById('capa-instruccion');
    const elementosAnimados = document.querySelectorAll('.animar-fade-up');
    const bgMusic = document.getElementById('bg-music'); // <-- NUEVO
    const musicControl = document.getElementById('music-control'); // <-- NUEVO



    // --- LÓGICA MANUAL DEL BOTÓN DE MÚSICA ---
    if (musicControl && bgMusic) {
        musicControl.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                musicControl.classList.remove('paused');
                musicControl.classList.add('playing');
            } else {
                bgMusic.pause();
                musicControl.classList.remove('playing');
                musicControl.classList.add('paused');
            }
        });
    }


    let videoYaReproducido = false;
    let transicionIniciada = false;

    // 1. Tocar para reproducir
    pantallaSobre.addEventListener('click', () => {
        if (!videoYaReproducido) {
            videoYaReproducido = true;
            capaInstruccion.style.opacity = '0';
            setTimeout(() => capaInstruccion.style.display = 'none', 500);
            videoSobre.play();
        }
    });

    // 2. Monitorear tiempo del video
    videoSobre.addEventListener('timeupdate', () => {
        const segundosAntesDelFinal = 2.0;
        const tiempoDeFlash = videoSobre.duration - segundosAntesDelFinal;

        if (videoSobre.currentTime >= tiempoDeFlash && !transicionIniciada) {
            transicionIniciada = true;

            // Disparamos el flash dorado
            pantallaSobre.classList.add('flash-activo');

            // A. Desbloqueamos el scroll
            document.body.classList.remove('bloquear-scroll');

            // B. Le avisamos a la app que ya empezó (Muestra el botón de música)
            document.body.classList.add('app-activa');

            // C. ENCENDEMOS LA MÚSICA AQUÍ
            if (bgMusic) {
                bgMusic.play().catch(error => console.log("Música bloqueada:", error));
                if (musicControl) {
                    musicControl.classList.remove('paused');
                    musicControl.classList.add('playing');
                }
            }

            // D. Retrasamos la aparición de los nombres.
            setTimeout(() => {
                elementosAnimados.forEach(elemento => {
                    elemento.classList.add('visible');
                });
            }, 1600);
        }
    });

    // --- LÓGICA DEL BOTÓN AÑADIR AL CALENDARIO ---
    const btnCalendario = document.getElementById('btn-calendario');

    if (btnCalendario) {
        btnCalendario.addEventListener('click', () => {
            // URL generada con la fecha (16 Agosto 2026) y hora (3:00 PM hora Colombia)
            const titulo = encodeURIComponent('Boda de Emanuel & Richelle');
            const detalles = encodeURIComponent('¡Nos llena de alegría contar con tu presencia en este día tan especial!');
            const ubicacion = encodeURIComponent('Cartagena, Colombia');

            // Fechas en formato UTC (YYYYMMDDTHHMMSSZ). 3:00 PM Colombia (UTC-5) es 8:00 PM UTC (20:00:00).
            const fechaInicio = '20260816T200000Z';
            const fechaFin = '20260816T230000Z'; // Asumimos 3 horas de evento para el calendario

            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaInicio}/${fechaFin}&details=${detalles}&location=${ubicacion}`;

            // Abre Google Calendar en una nueva pestaña
            window.open(googleCalendarUrl, '_blank');
        });
    }

    // --- LÓGICA DE ANIMACIÓN AL HACER SCROLL ---
    // Usamos IntersectionObserver para saber cuándo una sección entra en la pantalla
    const elementosScroll = document.querySelectorAll('.animar-scroll');

    const observador = new IntersectionObserver((entradas, observador) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                // Hacemos visible el elemento
                entrada.target.classList.add('visible');


                // Dejamos de observar este elemento para que la animación solo ocurra una vez
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.15 // Se dispara cuando al menos el 10% del elemento es visible
    });

    // Le decimos al observador que vigile todos los elementos con la clase .animar-scroll
    elementosScroll.forEach(elemento => {
        observador.observe(elemento);
    });

    // --- LÓGICA DE DESCUBRIR LA FECHA (SAVE THE DATE) ---
    const cubiertaFecha = document.getElementById('cubierta-fecha');
    const numeroCalendario = document.getElementById('flip-numero');

    if (cubiertaFecha) {
        cubiertaFecha.addEventListener('click', () => {
            // 1. Plegamos la tapa hacia atrás
            cubiertaFecha.classList.add('destapado');

            // 2. Esperamos a que la tapa casi desaparezca para girar el número 16
            setTimeout(() => {
                numeroCalendario.classList.add('flip-animacion');
            }, 300); // 300ms es el tiempo ideal para sincronizar las dos animaciones
        });
    }

    // --- 1. LÓGICA DEL NOMBRE PERSONALIZADO ---

    // =========================================================
    // --- LÓGICA DEL NOMBRE PERSONALIZADO Y CONEXIÓN A GOOGLE ---
    // =========================================================

    // ¡PEGA AQUÍ TU NUEVA URL DE GOOGLE APPS SCRIPT!
    const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbxSn-tni_frpbS62kXY0Sw_L7678lUj-LltJ1XqwpP01O4DpnSjvtHoMMrKyRj9U8C6/exec"; 

    const params = new URLSearchParams(window.location.search);
    const nombreInvitado = params.get('invitado') || "Invitado Especial";

    // Variables globales para el control del Checklist
    let esUnSoloCupo = false;
    let integrantesData = [];
    let integrantesFinalesString = "";
    let cuposFinalesConfirmados = 0;

    const elementoNombreFinal = document.getElementById('nombre-invitado-final');
    if (elementoNombreFinal && nombreInvitado !== "Invitado Especial") {
        elementoNombreFinal.textContent = decodeURIComponent(nombreInvitado);
    }

    // Modal y Botones de Confirmación
    const modal = document.getElementById('modal-confirmar');
    const btnAbrir = document.getElementById('btn-abrir-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnAceptar = document.getElementById('btn-aceptar-confirmacion');
    const displayNombre = document.getElementById('nombre-confirmacion-modal');

    // --- A. FUNCIÓN PARA BUSCAR DATOS AL CARGAR LA PÁGINA ---
    async function cargarDatosInvitado() {
        if (nombreInvitado === "Invitado Especial") return;

        try {
            const response = await fetch(`${URL_GOOGLE_SCRIPT}?accion=obtenerFamilia&nombre=${encodeURIComponent(nombreInvitado)}`);
            const data = await response.json();

            if (data.encontrado) {
                // Quitamos el mensaje de cargando y habilitamos el botón
                document.getElementById('mensaje-cargando-datos').style.display = 'none';
                btnAbrir.disabled = false;
                btnAbrir.style.opacity = '1';

                const cuposTotales = parseInt(data.cupos);
                const stringIntegrantes = data.integrantes || "";
                
                // Convertimos el texto del Excel separado por comas en un Array
                integrantesData = stringIntegrantes.split(',').map(i => i.trim()).filter(i => i !== "");

                // CRITERIO 4: Si es 1 solo cupo, ocultamos checklist
                if (cuposTotales <= 1) {
                    esUnSoloCupo = true;
                    document.getElementById('cupos-tarjeta').textContent = "1";
                } 
                // CRITERIO 2: Si son varios, pintamos el checklist
                else {
                    esUnSoloCupo = false;
                    document.getElementById('cupos-tarjeta').textContent = cuposTotales;
                    
                    const contenedorLista = document.getElementById('lista-integrantes');
                    contenedorLista.innerHTML = ''; // Limpiamos por precaución

                    integrantesData.forEach(integrante => {
                        // CRITERIO 5: Separamos el nombre de la mesa mediante el guion "-"
                        let nombre = integrante;
                        let mesa = "";
                        if (integrante.includes('-')) {
                            const partes = integrante.split('-');
                            nombre = partes[0].trim();
                            mesa = partes[1].trim();
                        }

                        // Creamos el HTML de cada checkbox
                        const div = document.createElement('div');
                        div.className = 'checkbox-item';
                        div.innerHTML = `
                            <label>
                                <input type="checkbox" class="check-integrante" value="${integrante}">
                                <span class="nombre-check">${nombre}</span>
                                ${mesa ? `<span class="mesa-check">${mesa}</span>` : ''}
                            </label>
                        `;
                        contenedorLista.appendChild(div);
                    });

                    // Mostramos el recuadro del checklist
                    document.getElementById('contenedor-checklist').style.display = 'block';
                }
            } else {
                document.getElementById('mensaje-cargando-datos').textContent = "No encontramos tu invitación en la lista.";
            }
        } catch (error) {
            console.error(error);
            document.getElementById('mensaje-cargando-datos').textContent = "Hubo un error cargando tus datos de invitado.";
        }
    }

    // Arrancamos la búsqueda de datos inmediatamente
    cargarDatosInvitado();


// --- B. LÓGICA DE ABRIR MODAL (Y VALIDAR SELECCIÓN MÍNIMA) ---
    btnAbrir.addEventListener('click', () => {
        let mesasAsignadas = []; // <-- NUEVO: Array para capturar las mesas

        // CRITERIO 1: Validación estricta si hay checklist
        if (!esUnSoloCupo) {
            const seleccionados = document.querySelectorAll('.check-integrante:checked');
            if (seleccionados.length === 0) {
                alert("Debes seleccionar al menos a un invitado para poder confirmar tu asistencia.");
                return; // Bloquea la apertura de la ventana modal
            }
            cuposFinalesConfirmados = seleccionados.length;
            
            // Guardamos los strings exactos ("Nombre - Mesa X") de los seleccionados
            const arrSeleccionados = Array.from(seleccionados).map(cb => cb.value);
            integrantesFinalesString = arrSeleccionados.join(", ");

            // <-- NUEVO: Extraemos las mesas de los que sí van a ir
            arrSeleccionados.forEach(item => {
                if (item.includes('-')) {
                    const mesa = item.split('-')[1].trim();
                    // Solo la añadimos si no está repetida
                    if (!mesasAsignadas.includes(mesa)) {
                        mesasAsignadas.push(mesa);
                    }
                }
            });

        } else {
            // Si es un invitado solitario
            cuposFinalesConfirmados = 1;
            integrantesFinalesString = integrantesData[0] || nombreInvitado;

            // <-- NUEVO: Extraemos su mesa
            if (integrantesFinalesString.includes('-')) {
                const mesa = integrantesFinalesString.split('-')[1].trim();
                mesasAsignadas.push(mesa);
            }
        }

        // Llenamos los datos visuales en la ventanita modal antes de abrirla
        displayNombre.textContent = nombreInvitado;
        document.getElementById('num-cupos-modal').textContent = cuposFinalesConfirmados;
        
        // <-- NUEVO: Inyectamos las mesas en el Modal
        const displayMesaModal = document.getElementById('mesa-modal');
        if (displayMesaModal) {
            // Si hay mesas guardadas, las une con coma (ej. "Mesa 1, Mesa 11"). Si no, dice "Por definir".
            displayMesaModal.textContent = mesasAsignadas.length > 0 ? mesasAsignadas.join(', ') : "Por definir";
        }

        modal.style.display = 'flex';
    });

    btnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
    });


    // --- C. LÓGICA DE ENVIAR A GOOGLE (CRITERIO 3) ---
    btnAceptar.addEventListener('click', () => {
        btnAceptar.disabled = true;
        btnAceptar.textContent = "Confirmando...";

        const datos = new FormData();
        datos.append('nombre', nombreInvitado);
        datos.append('cupos', cuposFinalesConfirmados);
        datos.append('integrantes', integrantesFinalesString); // Enviamos los nombres de los que van
        datos.append('fecha', new Date().toLocaleString());

        fetch(URL_GOOGLE_SCRIPT, {
            method: 'POST',
            body: datos
        })
        .then(response => response.text())
        .then(textoRespuesta => {
            if (textoRespuesta.trim() === "Success") {
                modal.style.display = 'none';
                document.getElementById('confirmacion').style.display = 'none';

                // Llenamos el recibo visual de "Muchas Gracias"
                document.getElementById('gracias-nombre').textContent = nombreInvitado;
                document.getElementById('gracias-cupos').textContent = cuposFinalesConfirmados;
                
                const listaUl = document.getElementById('gracias-lista-integrantes');
                listaUl.innerHTML = ""; // Limpiamos residuos
                
                // Pintamos la lista de los que confirmaron en el HTML
                const arrFinales = integrantesFinalesString.split(',');
                arrFinales.forEach(item => {
                    const li = document.createElement('li');
                    li.style.marginBottom = "5px";
                    li.textContent = item.trim(); 
                    listaUl.appendChild(li);
                });

                // Hacemos visible la tarjeta final
                const seccionGracias = document.getElementById('agradecimiento');
                seccionGracias.style.display = 'flex';
                seccionGracias.scrollIntoView({ behavior: 'smooth' });

            } else {
                alert("Hubo un problema al procesar tu confirmación. Intenta de nuevo.");
                btnAceptar.disabled = false;
                btnAceptar.textContent = "Sí, Confirmar";
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('Error de conexión. Revisa tu internet e intenta de nuevo.');
            btnAceptar.disabled = false;
            btnAceptar.textContent = "Sí, Confirmar";
        });
    });


    // --- D. LÓGICA DEL BOTÓN COPIAR DATOS PARA WHATSAPP ---
    const btnCopiar = document.getElementById('btn-copiar');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            // Construimos la lista con viñetas para el portapapeles
            const listaParaWhatsapp = integrantesFinalesString.split(',').map(i => `  - ${i.trim()}`).join('\n');
            
            const textoACopiar = `💍 Boda de Emanuel & Richelle\n\n✅ Asistencia Confirmada\n👤 Grupo: ${nombreInvitado}\n🎟️ Cupos confirmados: ${cuposFinalesConfirmados}\n\n👥 Asistirán:\n${listaParaWhatsapp}\n\n¡Nos vemos pronto!`;
            
            navigator.clipboard.writeText(textoACopiar).then(() => {
                const textoOriginal = btnCopiar.innerHTML;
                
                // Cambiamos el estilo del botón temporalmente
                btnCopiar.innerHTML = "¡Copiado! ✓";
                btnCopiar.classList.add('copiado');
                
                setTimeout(() => {
                    btnCopiar.innerHTML = textoOriginal;
                    btnCopiar.classList.remove('copiado');
                }, 3000);
            }).catch(err => {
                console.error('Error al copiar: ', err);
                alert("Hubo un error al copiar los datos.");
            });
        });
    }

}); // <-- FIN DEL DOMContentLoaded