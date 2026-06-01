
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
    const params = new URLSearchParams(window.location.search);
    const nombreInvitado = params.get('invitado');
    const cuposInvitado = params.get('c') || "1"; // 'c' será el parámetro para cupos, por defecto 1
    const mesaInvitado = params.get('m') || "No asignada"; // <--- NUEVO: Extraemos la mesa

    // Buscamos el elemento que acabamos de crear en el HTML
    const elementoNombreFinal = document.getElementById('nombre-invitado-final');

    // Si encontramos el elemento y hay un nombre en la URL, lo inyectamos
    if (elementoNombreFinal && nombreInvitado) {
        // Usamos decodeURIComponent por si el nombre tiene espacios o tildes
        elementoNombreFinal.textContent = decodeURIComponent(nombreInvitado);
    }

    // --- LÓGICA DEL CRONÓMETRO DE DÍAS FALTANTES ---

    // Configuramos la fecha exacta: 16 de Agosto de 2026 a las 15:00:00 (3:00 PM)
    const fechaBoda = new Date("Aug 16, 2026 15:00:00").getTime();

    // Función que se ejecuta cada 1 segundo (1000ms)
    const intervaloCronometro = setInterval(() => {

        // Obtenemos la fecha y hora de este mismo instante
        const ahora = new Date().getTime();

        // Encontramos la distancia entre ahora y la fecha de la boda
        const distancia = fechaBoda - ahora;

        // Cálculos matemáticos para extraer días, horas, minutos y segundos
        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        // Ubicamos los elementos en el HTML
        const elDias = document.getElementById("dias");

        // Si el elemento existe, inyectamos los números.
        // El operador (dias < 10 ? "0" + dias : dias) es para que los números del 0 al 9 tengan un "0" delante (ej: 09, 08)
        if (elDias) {
            elDias.textContent = dias; // Los días pueden ser más de 99, así que no le ponemos cero inicial
            document.getElementById("horas").textContent = horas < 10 ? "0" + horas : horas;
            document.getElementById("minutos").textContent = minutos < 10 ? "0" + minutos : minutos;
            document.getElementById("segundos").textContent = segundos < 10 ? "0" + segundos : segundos;
        }

        // ¿Qué pasa si el cronómetro llega a cero? 
        if (distancia < 0) {
            clearInterval(intervaloCronometro); // Detenemos el reloj
            const contenedorCrono = document.querySelector(".cronometro-container");
            if (contenedorCrono) {
                // Cambiamos los círculos por un mensaje de celebración
                contenedorCrono.innerHTML = "<div style='font-size: 1.2rem; color: var(--verde-oliva); font-weight: 600;'>¡El gran día ha llegado! 🎉</div>";
            }
        }
    }, 1000);

    // --- LÓGICA DEL CARRUSEL DE FOTOS (Bucle Infinito y 10s) ---
    const track = document.getElementById('carousel-track');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const dots = document.querySelectorAll('.dot');
    const slidesOriginales = document.querySelectorAll('.carousel-slide');

    if (track && btnPrev && btnNext && slidesOriginales.length > 0) {
        const totalOriginal = dots.length;

        // 1. Clonar la primera y última foto para crear la ilusión del bucle infinito
        const primerSlideClon = slidesOriginales[0].cloneNode(true);
        const ultimoSlideClon = slidesOriginales[totalOriginal - 1].cloneNode(true);

        // 2. Añadimos el clon del último al principio, y el clon del primero al final
        track.insertBefore(ultimoSlideClon, slidesOriginales[0]);
        track.appendChild(primerSlideClon);

        // Como añadimos una foto al principio, nuestro índice real empieza en 1
        let indexReal = 1;

        // Ajustamos la pista para que muestre la foto original 1 sin animación al cargar
        track.style.transition = "none";
        track.style.transform = `translateX(-100%)`;

        let enTransicion = false;

        // Función para iluminar el puntito correcto
        function actualizarPuntitos() {
            let indexDot = indexReal - 1;
            // Corregir los índices si estamos parados sobre los clones invisibles
            if (indexReal === totalOriginal + 1) indexDot = 0;
            if (indexReal === 0) indexDot = totalOriginal - 1;

            dots.forEach(dot => dot.classList.remove('activo'));
            if (dots[indexDot]) dots[indexDot].classList.add('activo');
        }

        // Función principal para mover el carrusel
        function moverA(index) {
            if (enTransicion) return; // Evita que se vuelva loco si el usuario hace muchos clics rápidos
            enTransicion = true;

            track.style.transition = "transform 0.6s ease-in-out"; // Animación suave
            track.style.transform = `translateX(-${index * 100}%)`;
            indexReal = index;
            actualizarPuntitos();
        }

        // 3. El truco de magia: El "salto invisible" cuando termina la animación
        track.addEventListener('transitionend', () => {
            enTransicion = false;

            // Si pasamos la última foto y llegamos al clon de la primera...
            if (indexReal === totalOriginal + 1) {
                track.style.transition = "none"; // Apagamos la animación
                indexReal = 1; // Saltamos mágicamente a la foto 1 real
                track.style.transform = `translateX(-${indexReal * 100}%)`;
            }

            // Si retrocedemos desde la primera y llegamos al clon de la última...
            if (indexReal === 0) {
                track.style.transition = "none";
                indexReal = totalOriginal; // Saltamos a la última foto real
                track.style.transform = `translateX(-${indexReal * 100}%)`;
            }
        });

        // Eventos de los botones
        btnNext.addEventListener('click', () => { moverA(indexReal + 1); });
        btnPrev.addEventListener('click', () => { moverA(indexReal - 1); });

        // Eventos para que los puntitos también sean clickeables
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                moverA(i + 1);
            });
        });

        // 4. Automatización de 10 segundos (10000 milisegundos)
        setInterval(() => {
            moverA(indexReal + 1);
        }, 10000); // <-- Aquí están los 10 segundos
    }

    // --- LÓGICA DE CONFIRMACIÓN AUTOMÁTICA ---
    const modal = document.getElementById('modal-confirmar');
    const btnAbrir = document.getElementById('btn-abrir-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnAceptar = document.getElementById('btn-aceptar-confirmacion');
    const displayNombre = document.getElementById('nombre-confirmacion-modal');

    // 1. Abrir Modal
    btnAbrir.addEventListener('click', () => {
        // Usamos la variable nombreInvitado que ya extrajiste de la URL al inicio del script
        displayNombre.textContent = nombreInvitado || "Invitado Especial";
        document.getElementById('num-cupos-modal').textContent = cuposInvitado;
        document.getElementById('mesa-modal').textContent = mesaInvitado || "Por definir";
        modal.style.display = 'flex';
    });

    // 2. Cerrar Modal
    btnCancelar.addEventListener('click', () => modal.style.display = 'none');

    // 3. ENVIAR A GOOGLE SHEETS
    btnAceptar.addEventListener('click', () => {
        btnAceptar.disabled = true;
        btnAceptar.textContent = "Enviando...";

        const scriptURL = 'https://script.google.com/macros/s/AKfycbzBplLIzmPyDjzdsIXFrl1VhGwYgQ2zXaTBDv2uak-ciC6SUCpAdcK3ryrNif2DTJc/exec'; // <--- LEER ABAJO

        const datos = new FormData();
        datos.append('nombre', nombreInvitado || "Invitado Especial");
        datos.append('cupos', cuposInvitado); // <--- ENVIAMOS LOS CUPOS
        datos.append('mesa', mesaInvitado); // <--- NUEVO: Enviamos la mesa a Google
        datos.append('fecha', new Date().toLocaleString());

        fetch(scriptURL, {
            method: 'POST',
            body: datos
        })
            .then(response => response.text()) // <-- AQUÍ LEEMOS LA RESPUESTA
            .then(textoRespuesta => {

                // Si Google dice que todo es válido ("Success")
                if (textoRespuesta.trim() === "Success") {
                    modal.style.display = 'none';
                    document.getElementById('confirmacion').style.display = 'none';

                    const seccionGracias = document.getElementById('agradecimiento');
                    seccionGracias.style.display = 'flex';
                    seccionGracias.scrollIntoView({ behavior: 'smooth' });

                } else {
                    // Si la validación falla, muestra tu mensaje de error en una alerta
                    alert(textoRespuesta);
                    btnAceptar.disabled = false;
                    btnAceptar.textContent = "Sí, Confirmar";
                }
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Hubo un error al enviar. Por favor, intenta de nuevo.');
                btnAceptar.disabled = false;
                btnAceptar.textContent = "Sí, Confirmar";
            });
    });

    const displayCuposTarjeta = document.getElementById('cupos-tarjeta');
    if (displayCuposTarjeta) {
        displayCuposTarjeta.textContent = cuposInvitado;
    }

    const displayMesaTarjeta = document.getElementById('mesa-tarjeta');
    if (displayMesaTarjeta) {
        // Si no hay mesa en la URL, mostrará "Por definir" o lo que elijas
        displayMesaTarjeta.textContent = mesaInvitado || "Por definir"; 
    }

});