document.addEventListener('DOMContentLoaded', () => {
    // Gestione del bottone "Torna su"
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Mostra il bottone dopo 300px di scroll
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Gestione animazione fade-in delle sezioni
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.1, // La sezione appare quando il 10% è visibile
        rootMargin: "0px 0px -100px 0px" // Inizia a caricare un po' prima di entrare nella viewport
    };

    const appearOnScroll = new IntersectionObserver(function(
        entries,
        appearOnScroll
    ) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Gestione dello scrolling per i link di navigazione
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Opzionale: Aggiungi/rimuovi la classe 'active' per l'indicatore nel menu
            document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Imposta la sezione attiva all'inizio (se l'URL ha un hash) o altrimenti la prima
    const initialHash = window.location.hash;
    if (initialHash) {
        const targetElement = document.querySelector(`nav a[href="${initialHash}"]`);
        if (targetElement) {
            targetElement.classList.add('active');
        }
    } else {
        // Se non c'è hash, imposta 'Introduzione' come attivo di default
        const introLink = document.querySelector('nav a[href="#introduzione"]');
        if (introLink) {
            introLink.classList.add('active');
        }
    }
});
