document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('back-to-top');
    const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('nav .nav-link');
    const sections = document.querySelectorAll('section');
    const heroContent = document.querySelector('.hero-content'); // Seleziona il contenuto della hero

    // --- Animazione iniziale Hero Section ---
    // Attiva l'animazione della hero subito al caricamento della pagina
    if (heroContent) {
        heroContent.classList.add('active');
    }

    // --- Gestione Eventi Scroll ---
    window.addEventListener('scroll', () => {
        // Mostra/Nascondi bottone "Torna su"
        if (backToTopButton) { // Controllo per assicurarsi che il bottone esista
            if (window.scrollY > 500) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }

        // Cambio stile header allo scroll
        if (header) { // Controllo per assicurarsi che l'header esista
            if (window.scrollY > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Aggiorna indicatore di progresso dello scroll
        if (scrollProgressIndicator) { // Controllo per assicurarsi che l'indicatore esista
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
            scrollProgressIndicator.style.width = scrollPercentage + '%';
        }

        // Aggiorna link di navigazione attivo
        updateActiveNavLink();
    });

    // --- Funzione per aggiornare il link di navigazione attivo ---
    function updateActiveNavLink() {
        let currentActiveSectionId = '';
        const headerOffset = header ? header.offsetHeight : 0; // Prende l'altezza dell'header se esiste

        sections.forEach(section => {
            const sectionTop = section.offsetTop - (headerOffset + 50); // Offset per la barra fissa
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentActiveSectionId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentActiveSectionId) {
                link.classList.add('active');
            }
        });
    }

    // --- Gestione Click Bottone "Torna su" ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Gestione Click Link di Navigazione ---
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = header ? header.offsetHeight : 0;
                const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Rimuovi 'active' da tutti i link e aggiungilo al click
                navLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // --- Animazioni al Reveal con IntersectionObserver (Ottimizzato e Robusto) ---
    const elementsToAnimate = document.querySelectorAll(
        '.content-reveal, .fade-in, .slide-up, .slide-left, .slide-right, .scale-in-sm, .section-title-animated, .section-description' // Tolti i delays da qui, gestiti dal CSS
    );

    const observerOptions = {
        root: null, // viewport come root
        threshold: 0.1, // L'elemento si attiva quando il 10% è visibile
        rootMargin: "0px 0px -100px 0px" // Carica gli elementi 100px prima di entrare nella viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Smetti di osservare dopo la prima attivazione
            }
        });
    }, observerOptions);

    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // --- Inizializzazione all'apertura della pagina ---
    // Funzione per impostare la sezione attiva e lo scroll iniziale
    const initializePage = () => {
        const initialHash = window.location.hash;
        if (initialHash) {
            const targetElement = document.querySelector(initialHash);
            if (targetElement) {
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === initialHash) {
                        link.classList.add('active');
                    }
                });
            }
        } else {
            // Se non c'è hash, imposta 'Introduzione' come attivo di default
            const introLink = document.querySelector('nav .nav-link[href="#introduzione"]');
            if (introLink) {
                introLink.classList.add('active');
            }
        }
        updateActiveNavLink(); // Assicura che lo stato attivo sia corretto
    };

    // Esegui l'inizializzazione dopo un breve ritardo per assicurare che il DOM sia completamente renderizzato
    setTimeout(initializePage, 250);
});
