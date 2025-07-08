document.addEventListener('DOMContentLoaded', function() {
    // --- Smooth Scroll per la Navigazione ---
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });

            // Rimuove la classe 'active' da tutti i link e la aggiunge al link cliccato
            document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Imposta il link attivo all'avvio o allo scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.main-nav a');

    const setActiveNavLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Un piccolo offset per rendere l'attivazione più precisa durante lo scroll
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', setActiveNavLink);
    setActiveNavLink(); // Chiama al caricamento della pagina


    // --- Accordion (Sezioni a Scomparsa) ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.paddingTop = '0';
                content.style.paddingBottom = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 40 + 'px'; // Aggiungi padding extra
                content.style.paddingTop = '20px';
                content.style.paddingBottom = '20px';
            }
        });
    });

    // --- Grafici Dinamici (Chart.js) ---

    // Grafico Composizione Fonti (Pie Chart)
    const sourceCompositionCtx = document.getElementById('sourceCompositionChart');
    if (sourceCompositionCtx) {
        new Chart(sourceCompositionCtx, {
            type: 'doughnut', // Doughnut chart per un look moderno
            data: {
                labels: ['Mais', 'Canna da Zucchero', 'Biomasse Lignocellulosiche', 'Altre Biomasse'],
                datasets: [{
                    data: [45, 30, 20, 5], // Dati reali o stimati per la tua analisi
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.9)', // Arancio vibrante
                        'rgba(75, 192, 192, 0.9)', // Turchese
                        'rgba(153, 102, 255, 0.9)', // Viola
                        'rgba(255, 205, 86, 0.9)'  // Giallo
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        }
                    },
                    title: {
                        display: false // Il titolo è già nell'HTML
                    }
                }
            }
        });
    }

    // Grafico Resa Fermentazione (Bar Chart)
    const fermentationYieldCtx = document.getElementById('fermentationYieldChart');
    if (fermentationYieldCtx) {
        new Chart(fermentationYieldCtx, {
            type: 'bar',
            data: {
                labels: ['Processo Standard', 'Processo Ottimizzato', 'Nuovo Ceppo Microbico'],
                datasets: [{
                    label: 'Resa Acido Lattico (g/L)',
                    data: [80, 105, 130], // Dati di esempio di miglioramento
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)', // Blu standard
                        'rgba(75, 192, 192, 0.8)', // Verde ottimizzato
                        'rgba(153, 102, 255, 0.8)' // Viola innovativo
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Resa (g/L)',
                            font: { size: 14 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Grafico Tasso Degradazione (Line Chart)
    const biodegradationRateCtx = document.getElementById('biodegradationRateChart');
    if (biodegradationRateCtx) {
        new Chart(biodegradationRateCtx, {
            type: 'line',
            data: {
                labels: ['Giorno 0', 'Giorno 30', 'Giorno 60', 'Giorno 90', 'Giorno 120', 'Giorno 180'],
                datasets: [{
                    label: 'Percentuale Degr. (%)',
                    data: [0, 15, 50, 85, 98, 100], // Dati stimati per compostaggio industriale
                    borderColor: 'rgba(0, 200, 83, 1)', // Verde secondario
                    backgroundColor: 'rgba(0, 200, 83, 0.2)',
                    fill: true,
                    tension: 0.4, // Curva più morbida
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(0, 200, 83, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Degradazione (%)',
                            font: { size: 14 }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tempo',
                            font: { size: 14 }
                        }
                    }
                }
            }
        });
    }

    // --- Galleria Immagini (LightGallery.js) ---
    const productionGallery = document.getElementById('production-gallery');
    if (productionGallery) {
        lightGallery(productionGallery, {
            plugins: [lgThumbnail, lgZoom],
            licenseKey: '0000-0000-0000-0000', // Sostituisci con la tua chiave se ne hai una, altrimenti non è obbligatoria per test.
            speed: 600,
            thumbnail: true,
            zoom: true,
            actualSize: false,
            autoplay: false,
            pager: false,
            download: false,
            counter: true,
            controls: true,
            loop: true
        });
    }

    // --- Mappa Interattiva (Leaflet.js) ---
    const worldMapElement = document.getElementById('world-map');
    if (worldMapElement) {
        const mymap = L.map('world-map').setView([20, 0], 2); // Vista centrata sul mondo, zoom 2

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { // Stile mappa scuro e moderno
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 18
        }).addTo(mymap);

        // Dati fittizi per i marker (sostituisci con dati reali di bioraffinerie/centri ricerca)
        const plaLocations = [
            { lat: 45.4642, lon: 9.1900, name: 'Polo Innovazione Bioplastica, Italia', info: 'R&D su PLA da sottoprodotti agricoli e applicazioni biomediche.', type: 'R&D' },
            { lat: 39.9042, lon: 116.4074, name: 'Impianto di Produzione PLA, Cina', info: 'Uno dei maggiori produttori mondiali di PLA da amido di mais.', type: 'Produzione' },
            { lat: 33.7490, lon: -84.3880, name: 'Centro di Riciclo Avanzato, USA', info: 'Focus su riciclo chimico e compostaggio del PLA.', type: 'Riciclo' },
            { lat: 52.3676, lon: 4.9041, name: 'Bioraffineria Circolare, Paesi Bassi', info: 'Produzione integrata di PLA e altri bioprodotti da biomassa.', type: 'Produzione' },
            { lat: -23.5505, lon: -46.6333, name: 'Sviluppo PLA da Canna da Zucchero, Brasile', info: 'Leader nella produzione di biopolimeri da fonti di canna da zucchero.', type: 'Produzione' },
            { lat: 35.6895, lon: 139.6917, name: 'Laboratorio Biotecnologico, Giappone', info: 'Ricerca su nuovi microrganismi per l\'acido lattico.', type: 'R&D' }
        ];

        // Icone personalizzate per la mappa
        const customIcon = (type) => {
            let iconClass = 'fas fa-map-marker-alt';
            let iconColor = '#ffffff'; // Colore di default
            let backgroundColor = 'var(--primary-color)';

            if (type === 'R&D') {
                iconClass = 'fas fa-flask';
                backgroundColor = 'var(--accent-color)';
            } else if (type === 'Produzione') {
                iconClass = 'fas fa-factory';
                backgroundColor = 'var(--secondary-color)';
            } else if (type === 'Riciclo') {
                iconClass = 'fas fa-recycle';
                backgroundColor = '#8e24aa'; // Viola
            }

            // Nota: per usare le variabili CSS qui, dovremmo estrarre i valori
            // direttamente da un elemento DOM o hardcodarli. Per semplicità,
            // li ho hardcodati per l'esempio.
            const primaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            const accentColorVal = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            const secondaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
            
            let finalBackgroundColor = primaryColorVal;
            if (type === 'R&D') finalBackgroundColor = accentColorVal;
            else if (type === 'Produzione') finalBackgroundColor = secondaryColorVal;
            else if (type === 'Riciclo') finalBackgroundColor = '#8e24aa'; // Viola

            return L.divIcon({
                html: `<div style="background-color: ${finalBackgroundColor}; color: ${iconColor}; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 1.2em; border: 2px solid ${iconColor}; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="${iconClass}"></i></div>`,
                className: 'custom-map-icon',
                iconSize: [35, 35],
                iconAnchor: [17, 35],
                popupAnchor: [0, -30]
            });
        };

        plaLocations.forEach(loc => {
            L.marker([loc.lat, loc.lon], { icon: customIcon(loc.type) })
                .addTo(mymap)
                .bindPopup(`<b>${loc.name}</b><br>${loc.info}`);
        });

        // Adatta la vista della mappa ai marker
        const group = new L.featureGroup(plaLocations.map(loc => L.marker([loc.lat, loc.lon])));
        if (plaLocations.length > 0) {
            mymap.fitBounds(group.getBounds().pad(0.5)); // padding per non farli stare sul bordo
        }
    }
});
