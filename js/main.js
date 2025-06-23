document.addEventListener('DOMContentLoaded', () => {
    // Gestione del bottone "Torna su"
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
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

    function updateActiveNavLink() {
        let currentActiveSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - (header.offsetHeight + 20); // Considera l'altezza dell'header e un offset
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
    const revealElements = document.querySelectorAll('.content-reveal, .fade-in, .slide-up, .slide-left, .slide-right, .scale-in, .scale-in-sm');

    const observerOptions = {
        threshold: 0.2, // L'elemento appare quando il 20% è visibile
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
            const headerOffset = document.getElementById('main-header').offsetHeight;
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

    // Attiva la prima sezione all'apertura se non c'è hash nell'URL
    if (!window.location.hash) {
        document.querySelector('nav .nav-link[href="#introduzione"]').classList.add('active');
    } else {
        // Se c'è un hash, imposta il link attivo corrispondente
        const initialLink = document.querySelector(`nav .nav-link[href="${window.location.hash}"]`);
        if (initialLink) {
            initialLink.classList.add('active');
        }
    }

    // Esegui l'aggiornamento iniziale dello stato attivo dei link
    updateActiveNavLink();
});
