document.addEventListener('DOMContentLoaded', () => {
    // Gestione del bottone "Torna su"
    const backToTopButton = document.getElementById('back-to-top');
    // Indicatore di progresso dello scroll
    const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');

    window.addEventListener('scroll', () => {
        // Logica per il bottone "Torna su"
        if (window.scrollY > 400) { // Mostra il bottone dopo 400px di scroll
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }

        // Cambia stile header allo scroll
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) { // Aggiunge classe 'scrolled' dopo 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Logica per l'indicatore di progresso dello scroll
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgressIndicator.style.width = scrollPercentage + '%';

        // Aggiorna link di navigazione attivo in base alla sezione visibile
        updateActiveNavLink();
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Funzione per aggiornare il link di navigazione attivo
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav .nav-link');
    const header = document.getElementById('main-header'); // Ottieni l'header fuori dalla funzione per efficienza

    function updateActiveNavLink() {
        let currentActiveSection = '';
        sections.forEach(section => {
            // Regola l'offset per la barra di navigazione fissa
            const sectionTop = section.offsetTop - (header.offsetHeight + 50); // Aggiunto un buffer di 50px
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentActiveSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentActiveSection) {
                link.classList.add('active');
            }
        });
    }

    // Gestione animazioni al reveal delle sezioni (Intersection Observer)
    const revealElements = document.querySelectorAll('.content-reveal, .fade-in, .slide-up, .slide-left, .slide-right, .scale-in, .scale-in-sm, .section-title-animated, .section-description');

    const observerOptions = {
        threshold: 0.1, // L'elemento appare quando il 10% è visibile
        rootMargin: "0px 0px -100px 0px" // Inizia a caricare un po' prima di entrare nella viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Ferma l'osservazione una volta attivato
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Gestione dello scrolling per i link di navigazione al click
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Rimuovi 'active' da tutti i link e aggiungilo al click
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Imposta la sezione attiva all'apertura se non c'è hash nell'URL o carica la prima
    const initialHash = window.location.hash;
    if (initialHash) {
        const targetElement = document.querySelector(`nav .nav-link[href="${initialHash}"]`);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        // Scroll to the hash element after DOM is fully loaded to ensure correct offset
        setTimeout(() => {
            const el = document.querySelector(initialHash);
            if (el) {
                const headerOffset = header.offsetHeight;
                const elementPosition = el.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }, 100); // Short delay to ensure all elements are rendered
    } else {
        // Se non c'è hash, imposta 'Introduzione' come attivo di default
        const introLink = document.querySelector('nav .nav-link[href="#introduzione"]');
        if (introLink) {
            introLink.classList.add('active');
        }
    }

    // Esegui l'aggiornamento iniziale dello stato attivo dei link dopo un breve ritardo
    // per assicurarsi che tutte le altezze degli elementi siano calcolate correttamente
    setTimeout(updateActiveNavLink, 200); 
});
