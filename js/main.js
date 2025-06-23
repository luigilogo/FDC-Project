document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('back-to-top');
    const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('nav .nav-link');
    const sections = document.querySelectorAll('section');

    // --- Gestione Eventi Scroll ---
    window.addEventListener('scroll', () => {
        // Mostra/Nascondi bottone "Torna su"
        if (window.scrollY > 500) { // Aumentato il trigger per un'esperienza più pulita
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }

        // Cambio stile header allo scroll
        if (window.scrollY > 80) { // Aumentato il trigger per un'esperienza più fluida
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Aggiorna indicatore di progresso dello scroll
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0; // Evita divisione per zero
        scrollProgressIndicator.style.width = scrollPercentage + '%';

        // Aggiorna link di navigazione attivo
        updateActiveNavLink();
    });

    // --- Funzione per aggiornare il link di navigazione attivo ---
    function updateActiveNavLink() {
        let currentActiveSectionId = '';
        const headerOffset = header.offsetHeight;

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
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Gestione Click Link di Navigazione ---
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = header.offsetHeight;
                // Calcola la posizione di scroll con offset
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

    // --- Animazioni al Reveal con IntersectionObserver (Ottimizzato) ---
    // Seleziona tutti gli elementi che devono essere animati
    const elementsToAnimate = document.querySelectorAll(
        '.content-reveal, .fade-in, .slide-up, .slide-left, .slide-right, .scale-in, .scale-in-sm, .section-title-animated, .section-description, .fade-in-delayed, .scale-in-delayed'
    );

    const observerOptions = {
        root: null, // viewport come root
        threshold: 0.1, // L'elemento si attiva quando il 10% è visibile
        rootMargin: "0px 0px -100px 0px" // Carica gli elementi 100px prima di entrare nella viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Aggiunge la classe 'active' per scatenare l'animazione CSS
                entry.target.classList.add('active');

                // Gestione specifica per le animazioni iniziali della Hero Section
                if (entry.target.classList.contains('fade-in-delayed') || entry.target.classList.contains('scale-in-delayed')) {
                    // Questi elementi vengono animati una volta sola all'inizio senza unobserve immediato per permettere i delay
                    // Potresti aggiungere un timeout per rimuovere l'observer dopo che l'animazione è finita, se necessario
                    // Per ora, li lasciamo nell'observer, ma il CSS garantisce l'animazione solo una volta.
                } else {
                    // Per gli altri elementi, smetti di osservare dopo la prima attivazione per efficienza
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    // Inizia l'osservazione per tutti gli elementi animati
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // --- Inizializzazione all'apertura della pagina ---
    // Imposta la sezione attiva all'apertura in base all'hash nell'URL o di default su Introduzione
    const initialHash = window.location.hash;
    if (initialHash) {
        // Se c'è un hash, scorri a quella sezione
        const targetElement = document.querySelector(initialHash);
        if (targetElement) {
            // Un piccolo ritardo per assicurarsi che l'header sia renderizzato correttamente e le altezze calcolate
            setTimeout(() => {
                const headerOffset = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                // Imposta anche il link attivo nella navbar
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === initialHash) {
                        link.classList.add('active');
                    }
                });
            }, 100); // Breve ritardo
        }
    } else {
        // Se non c'è hash, imposta 'Introduzione' come attivo di default
        const introLink = document.querySelector('nav .nav-link[href="#introduzione"]');
        if (introLink) {
            introLink.classList.add('active');
        }
    }

    // Esegui un aggiornamento iniziale dello stato attivo dei link dopo un breve ritardo
    // per assicurarsi che tutte le altezze degli elementi siano calcolate correttamente
    setTimeout(updateActiveNavLink, 250); // Ritardo leggermente maggiore per maggiore robustezza
});
