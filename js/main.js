// Funzione per caricare dati CSV
async function loadCSV(filePath) {
    console.log(`Tentativo di caricamento CSV da: ${filePath}`);
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            dynamicTyping: true, // Tenta di convertire automaticamente i numeri
            skipEmptyLines: true, // Ignora righe vuote
            complete: function(results) {
                if (results.errors.length) {
                    console.error(`Errore nel parsing CSV per ${filePath}:`, results.errors);
                    reject(results.errors);
                } else if (!results.data || results.data.length === 0) {
                    console.warn(`File CSV vuoto o senza dati per: ${filePath}`);
                    reject(new Error(`No data in CSV file: ${filePath}`));
                } else {
                    console.log(`Dati CSV caricati con successo da: ${filePath}. Righe: ${results.data.length}`);
                    resolve(results.data);
                }
            },
            error: function(err) {
                console.error(`Errore di rete/caricamento per ${filePath}:`, err);
                reject(err);
            }
        });
    });
}

// Funzione per calcolare la regressione lineare (trendline) e R-quadro
function calculateLinearRegression(x, y) {
    const n = x.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let sum_yy = 0;

    for (let i = 0; i < n; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += x[i] * y[i];
        sum_xx += x[i] * x[i];
        sum_yy += y[i] * y[i];
    }

    const denominator = (n * sum_xx - sum_x * sum_x);
    const slope = (denominator === 0) ? 0 : (n * sum_xy - sum_x * sum_y) / denominator;
    const intercept = (n === 0) ? 0 : (sum_y - slope * sum_x) / n;

    // Calcolo R-quadro
    let ss_total = 0; // Somma dei quadrati totale
    let ss_residual = 0; // Somma dei quadrati dei residui
    const mean_y = sum_y / n;

    for (let i = 0; i < n; i++) {
        ss_total += Math.pow(y[i] - mean_y, 2);
        const predicted_y = intercept + slope * x[i];
        ss_residual += Math.pow(y[i] - predicted_y, 2);
    }
    const r_squared = (ss_total === 0) ? 1 : 1 - (ss_residual / ss_total); // Se ss_total è 0, tutti i punti sono uguali, R^2 è 1

    // Genera i punti per la linea di regressione
    const trend_x = [Math.min(...x), Math.max(...x)];
    const trend_y = [intercept + slope * trend_x[0], intercept + slope * trend_x[1]];

    return { slope, intercept, r_squared, trend_x, trend_y };
}

// Configurazione comune per i layout dei grafici
const commonLayout = {
    font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#333'
    },
    hovermode: 'closest',
    margin: { t: 50, b: 80, l: 60, r: 20 }, // Margine inferiore aumentato per il range slider
    xaxis: {
        title: {
            text: 'Anno',
            font: {
                size: 14
            }
        },
        showgrid: true,
        gridcolor: '#e0e0e0',
        linecolor: '#ccc',
        linewidth: 1,
        mirror: true,
        tickmode: 'array',
        tickvals: Array.from({length: (2024 - 1994 + 1)}, (v, k) => 1994 + k),
        ticktext: Array.from({length: (2024 - 1994 + 1)}, (v, k) => (1994 + k).toString()),
        tickangle: -45,
        rangeslider: { // Aggiunto Range Slider all'asse X
            visible: true,
            thickness: 0.08,
            bgcolor: '#f0f0f0',
            range: [1994, 2024]
        },
        rangeselector: { // Pulsanti per la selezione del range
            buttons: [
                {
                    count: 10,
                    label: '10a',
                    step: 'year',
                    stepmode: 'backward'
                },
                {
                    count: 20,
                    label: '20a',
                    step: 'year',
                    stepmode: 'backward'
                },
                {step: 'all'}
            ]
        }
    },
    yaxis: {
        title: {
            font: {
                size: 14
            }
        },
        showgrid: true,
        gridcolor: '#e0e0e0',
        linecolor: '#ccc',
        linewidth: 1,
        mirror: true,
        rangemode: 'tozero'
    },
    plot_bgcolor: '#fcfcfc',
    paper_bgcolor: '#fcfcfc',
    legend: {
        x: 0,
        y: 1.15,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#ccc',
        borderwidth: 1,
        orientation: 'h'
    },
    'xaxis.showline': true,
    'yaxis.showline': true
};

// Funzione per creare un grafico generico con trendline e R-quadro
async function createPlot(id, filePath, title, yAxisTitle, color = '#007bff') {
    const plotContainer = document.getElementById(id);
    plotContainer.innerHTML = `<p class="loading-message">Caricamento grafico...</p>`;
    console.log(`Inizio creazione grafico per ID: ${id}`);

    try {
        const rawData = await loadCSV(filePath);
        // console.log(`Dati grezzi ricevuti per ${id}:`, rawData); // Disabilitato per evitare spam console

        const years = [];
        const values = [];
        let valueKey = null;

        // Tenta di identificare la colonna dell'anno e dei valori
        if (rawData.length > 0) {
            const headerKeys = Object.keys(rawData[0]);
            // Trova la colonna dell'anno (insensibile a maiuscole/minuscole e varianti)
            const yearKey = headerKeys.find(key => 
                key.toLowerCase() === 'year' || 
                key.toLowerCase() === 'anno' || 
                key.toLowerCase().includes('year') // Es: 'Anni'
            );
            // Trova la colonna dei valori (non sia l'anno, data o mese)
            valueKey = headerKeys.find(key => 
                key.toLowerCase() !== 'year' && 
                key.toLowerCase() !== 'anno' && 
                !key.toLowerCase().includes('date') && 
                !key.toLowerCase().includes('month') &&
                key // Assicurati che la chiave non sia vuota
            );
            
            if (!yearKey) {
                console.error(`Colonna 'Year' o 'Anno' non trovata nel CSV per ${id}. Header disponibili:`, headerKeys);
                plotContainer.innerHTML = `<p style="color: red; text-align: center;">Colonna 'Anno' non trovata nel CSV per ${title}.</p>`;
                return;
            }
            if (!valueKey) {
                console.error(`Colonna dei valori non trovata nel CSV per ${id}. Header disponibili:`, headerKeys);
                plotContainer.innerHTML = `<p style="color: red; text-align: center;">Colonna dei valori non trovata nel CSV per ${title}.</p>`;
                return;
            }

            rawData.forEach(row => {
                const year = parseFloat(row[yearKey]);
                const value = parseFloat(row[valueKey]);
                // Includi solo righe con numeri validi
                if (!isNaN(year) && !isNaN(value) && year !== null && value !== null) {
                    years.push(year);
                    values.push(value);
                }
            });
        }
        
        if (years.length < 2 || years.length !== values.length) {
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Dati insufficienti o non validi per il grafico di ${title}.</p>`;
            console.error(`Dati insufficienti o non validi dopo il parsing per ${id}: Anni=${years.length}, Valori=${values.length}. File: ${filePath}`);
            return;
        }

        console.log(`Estratti anni per ${id}:`, years);
        console.log(`Estratti valori (${valueKey}) per ${id}:`, values);

        const { slope, r_squared, trend_x, trend_y } = calculateLinearRegression(years, values);

        const dataTraces = [
            {
                x: years,
                y: values,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Valori',
                line: {
                    color: color,
                    width: 2
                },
                marker: {
                    size: 6,
                    color: color,
                    line: {
                        color: 'white',
                        width: 1
                    }
                }
            },
            {
                x: trend_x,
                y: trend_y,
                mode: 'lines',
                type: 'scatter',
                name: 'Trend Lineare',
                line: {
                    color: '#FF0000', // Rosso
                    width: 3,
                    dash: 'dash' // Linea tratteggiata
                },
                hoverinfo: 'none'
            }
        ];

        const layout = {
            ...commonLayout,
            title: {
                text: `<b>${title}</b>`,
                font: {
                    size: 16
                }
            },
            yaxis: {
                ...commonLayout.yaxis,
                title: {
                    text: yAxisTitle,
                    font: {
                        size: 14
                    }
                }
            },
            annotations: [
                {
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.05,
                    y: 0.95,
                    xanchor: 'left',
                    yanchor: 'top',
                    text: `Trend: ${slope.toFixed(3)} ${yAxisTitle}/anno <br>R²: ${r_squared.toFixed(3)}`,
                    font: {
                        size: 12,
                        color: '#FF0000'
                    },
                    showarrow: false,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    bordercolor: '#ccc',
                    borderwidth: 1,
                    borderpad: 4
                }
            ]
        };

        Plotly.newPlot(id, dataTraces, layout, { responsive: true }).then(() => {
            console.log(`Grafico ${id} creato con successo.`);
            // Rimuovi il messaggio di caricamento dopo che il grafico è stato creato
            const loadingMessage = plotContainer.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }).catch(plotError => {
            console.error(`Errore nella creazione del grafico Plotly per ${id}:`, plotError);
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore durante la visualizzazione del grafico. Controlla la console.</p>`;
        });
    } catch (error) {
        console.error(`Errore generale nel caricamento o preparazione dati per ${id}:`, error);
        plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore nel caricamento dei dati per il grafico. Controlla la console.</p>`;
    }
}

// Funzione per mostrare/nascondere il bottone "Torna su"
function setupBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) {
        console.warn("Bottone 'back-to-top' non trovato nell'HTML.");
        return;
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Mostra il bottone dopo aver scrollato 300px
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
    console.log("Bottone 'Torna su' configurato.");
}

// Funzione per attivare le animazioni fade-in
function setupFadeInAnimations() {
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length === 0) {
        console.warn("Nessun elemento con classe 'fade-in' trovato per le animazioni.");
        return;
    }

    const appearOptions = {
        threshold: 0.2 // Attiva quando il 20% dell'elemento è visibile
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                appearOnScroll.unobserve(entry.target); // Ferma l'osservazione una volta che l'animazione è partita
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
    console.log("Animazioni fade-in configurate.");
}


// Inizializzazione di tutte le funzionalità al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente caricato. Inizio configurazione sito.");
    
    // Configura il bottone "Torna su"
    setupBackToTopButton();

    // Configura le animazioni fade-in
    setupFadeInAnimations();

    // Richiama la funzione per creare ogni grafico con i tuoi NOMI FILE AGGIORNATI
    // Assicurati che questi file siano nella cartella 'data/' sul tuo GitHub
    createPlot('plot-prcptot', 'data/Vercelli_94_24_prcptot_ANN.csv', 'prcptot: Precipitazione Totale Annuale', 'mm', '#007bff');
    createPlot('plot-sdii', 'data/Vercelli_94_24_sdii_ANN.csv', 'sdii: Intensità Media Precipitazioni', 'mm/giorno', '#28a745');
    createPlot('plot-spi_24_month', 'data/Vercelli_94_24_24month_spi_MON.csv', 'spi_24_month: Indice di Precipitazione Standardizzato (24 Mesi)', 'Valore SPI', '#ffc107');
    createPlot('plot-spei_24_month', 'data/Vercelli_94_24_24month_spei_MON.csv', 'spei_24_month: Indice Standardizzato di Precipitazione ed Evapotraspirazione (24 Mesi)', 'Valore SPEI', '#fd7e14');
    createPlot('plot-tn90p', 'data/Vercelli_94_24_tn90p_ANN.csv', 'tn90p: Giorni con Minima Estremamente Calda', '% Giorni', '#dc3545');
    createPlot('plot-tx10p', 'data/Vercelli_94_24_tx10p_ANN.csv', 'tx10p: Giorni con Massima Estremamente Fredda', '% Giorni', '#6c757d');
    createPlot('plot-tx90p', 'data/Vercelli_94_24_tx90p_ANN.csv', 'tx90p: Giorni con Massima Estremamente Calda', '% Giorni', '#e83e8c');
});
