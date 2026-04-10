
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

            // --- AQUÍ ESTÁN LOS CAMBIOS CLAVE ---
            
            // A. Desbloqueamos el scroll justo cuando empieza el flash
            document.body.classList.remove('bloquear-scroll');

            // B. Retrasamos la aparición de los nombres.
            // Si el flash dura 1.8s, esperamos 1.6s o 1.8s para que 
            // los nombres suban cuando la pantalla ya está clara.
            setTimeout(() => {
                elementosAnimados.forEach(elemento => {
                    elemento.classList.add('visible');
                });
            }, 1600); // <-- Ajustado para esperar casi todo el flash
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
        threshold: 0.1 // Se dispara cuando al menos el 10% del elemento es visible
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

});