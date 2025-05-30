document.addEventListener('DOMContentLoaded', function() {
    //contador de vistas
    initViewCounter();
    
    //Navegación suave
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    //Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.project-card, .education-card, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    //Tracking de engagement
    trackPageEngagement();
});

function initViewCounter() {
    const viewCountElement = document.getElementById('view-count');
    
    if (!viewCountElement) {
        console.warn('Elemento view-count no encontrado');
        return;
    }
    
    try {
        //Verificar si localStorage está disponible
        if (typeof(Storage) === "undefined") {
            console.warn('LocalStorage no está disponible');
            viewCountElement.textContent = '0';
            return;
        }
        
        //Obtener contador actual
        let viewCount = localStorage.getItem('pageViews');
        
        if (!viewCount || isNaN(viewCount)) {
            viewCount = 0;
        } else {
            viewCount = parseInt(viewCount);
        }

        let sessionViewed = sessionStorage.getItem('sessionViewed');
        
        if (!sessionViewed) {
            viewCount++;
            localStorage.setItem('pageViews', viewCount);
            sessionStorage.setItem('sessionViewed', 'true');

            const visitData = {
                count: viewCount,
                lastVisit: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 50) 
            };
            localStorage.setItem('visitData', JSON.stringify(visitData));
        }
        
        animateCounter(viewCountElement, viewCount);
        
    } catch (error) {
        console.error('Error en el contador de vistas:', error);
        viewCountElement.textContent = '1';
    }
}

function animateCounter(element, finalValue) {
    if (!element || finalValue < 1) {
        element.textContent = finalValue || '0';
        return;
    }
    
    let currentValue = 0;
    const increment = Math.max(1, Math.ceil(finalValue / 30));
    const duration = 1500; // 1.5 segundos
    const stepTime = Math.max(16, duration / (finalValue / increment));
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        element.textContent = currentValue.toLocaleString();
    }, stepTime);
}

function trackPageEngagement() {
    let startTime = Date.now();
    let maxScroll = 0;
    let isActive = true;

    window.addEventListener('scroll', () => {
        if (!isActive) return;
        
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        maxScroll = Math.max(maxScroll, scrollPercent || 0);
    });

    document.addEventListener('visibilitychange', () => {
        isActive = !document.hidden;
    });

    window.addEventListener('beforeunload', () => {
        try {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            
            const metrics = {
                timeSpent: timeSpent,
                maxScroll: Math.min(maxScroll, 100),
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href
            };
            
            localStorage.setItem('lastVisitMetrics', JSON.stringify(metrics));
        } catch (error) {
            console.error('Error guardando métricas:', error);
        }
    });
}

//Función para mostrar estadísticas (funciona en desarrollo y producción)
function showPageStats() {
    try {
        const viewCount = localStorage.getItem('pageViews');
        const visitData = JSON.parse(localStorage.getItem('visitData') || '{}');
        const lastMetrics = JSON.parse(localStorage.getItem('lastVisitMetrics') || '{}');
        
        console.log('=== Estadísticas de la página ===');
        console.log('📊 Total de vistas:', viewCount || '0');
        console.log('📅 Última visita:', visitData.lastVisit || 'No disponible');
        console.log('⏱️ Tiempo última sesión:', lastMetrics.timeSpent ? `${lastMetrics.timeSpent}s` : 'No disponible');
        console.log('📜 Scroll máximo:', lastMetrics.maxScroll ? `${lastMetrics.maxScroll}%` : 'No disponible');
        
    } catch (error) {
        console.error('Error mostrando estadísticas:', error);
    }
}

//Función para resetear contador (funciona siempre)
function resetViewCounter() {
    try {
        localStorage.removeItem('pageViews');
        localStorage.removeItem('visitData');
        localStorage.removeItem('lastVisitMetrics');
        sessionStorage.removeItem('sessionViewed');
        
        //Actualizar display
        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement) {
            viewCountElement.textContent = '0';
        }
        
        console.log('✅ Contador de vistas reseteado');
    } catch (error) {
        console.error('Error reseteando contador:', error);
    }
}

//Hacer funciones disponibles globalmente para poder usarlas en la consola
window.showPageStats = showPageStats;
window.resetViewCounter = resetViewCounter;

//Solo en desarrollo local - mostrar estadísticas automáticamente
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.protocol === 'file:') {
    
    setTimeout(() => {
        showPageStats();
        console.log('💡 Ejecuta showPageStats() o resetViewCounter() en la consola cuando quieras');
    }, 3000);
} else {
    //En GitHub Pages - solo mostrar mensaje informativo
    setTimeout(() => {
        console.log('📊 Página desplegada en producción');
        console.log('💡 Ejecuta showPageStats() en la consola para ver estadísticas');
        console.log('🔧 Ejecuta resetViewCounter() para resetear el contador');
    }, 2000);
}
