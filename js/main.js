// Funzione per caricare dati CSV
async function loadCSV(filePath) {
    console.log(`[CSV Load] Tentativo di caricamento da: ${filePath}`);
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            dynamicTyping: true, // Tenta di convertire automaticamente i numeri
            skipEmptyLines: true, // Ignora righe vuote
            complete: function(results) {
                if (results.errors.length) {
                    console.error(`[CSV Error] Errore nel parsing per ${filePath}:`, results.errors);
                    reject(results.errors);
                } else if (!results.data || results.data.length === 0 || Object.keys(results.data[0]).length === 0) {
                    console.warn(`[CSV Warning] File CSV vuoto o senza dati validi per: ${filePath}`);
                    reject(new Error(`No valid data in CSV file: ${filePath}`));
                } else {
                    console.log(`[CSV Success] Dati caricati da: ${filePath}. Righe: ${results.data.length}`);
                    resolve(results.data);
                }
            },
            error: function(err) { // Questo cattura errori di rete, 404, ecc.
                console.error(`[Network Error] Errore di rete/caricamento per ${filePath}:`, err);
                reject(err);
            }
        });
    });
}

// Funzione per calcolare la regressione lineare (trendline) e R-quadro
function calculateLinearRegression(x, y) {
    const n = x.length;
    if (n < 2) return { slope: 0, intercept: 0, r_squared: 0, trend_x: [], trend_y: [] };

    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;

    for (let i = 0; i < n; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += x[i] * y[i];
        sum_xx += x[i] * x[i];
    }

    const denominator = (n * sum_xx - sum_x * sum_x);
    let slope, intercept;

    if (denominator === 0) { // Tutti i valori di X sono gli stessi
        slope = 0;
        intercept = sum_y / n;
    } else {
        slope = (n * sum_xy - sum_x * sum_y) / denominator;
        intercept = (sum_y - slope * sum_x) / n;
    }

    // Calcolo R-quadro
    let ss_total = 0;
    let ss_residual = 0;
    const mean_y = sum_y / n;

    for (let i = 0; i < n; i++) {
        ss_total += Math.pow(y[i] - mean_y, 2);
        const predicted_y = intercept + slope * x[i];
        ss_residual += Math.pow(y[i] - predicted_y, 2);
    }
    const r_squared = (ss_total === 0) ? 1 : 1 - (ss_residual / ss_total); // Se ss_total è 0, R^2 è 1

    // Genera i punti per la linea di regressione
    const trend_x = [Math.min(...x), Math.max(...x)];
    const trend_y = [intercept + slope * trend_x[0], intercept + slope * trend_x[1]];

    return { slope, intercept, r_squared, trend_x, trend_y };
}

// Configurazione comune per i layout dei grafici Plotly
const commonLayout = {
    font: {
        family: 'Montserrat, Arial, sans-serif',
        size: 12,
        color: '#333'
    },
    hovermode: 'closest',
    margin: { t: 50, b: 80, l: 60, r: 20 },
    xaxis: {
        title: {
            text: 'Anno',
            font: { size: 14 }
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
        rangeslider: {
            visible: true,
            thickness: 0.08,
            bgcolor: '#f0f0f0',
            range: [1994, 2024]
        },
        rangeselector: {
            buttons: [
                { count: 10, label: '10a', step: 'year', stepmode: 'backward' },
                { count: 20, label: '20a', step: 'year', stepmode: 'backward' },
                { step: 'all' }
            ]
        }
    },
    yaxis: {
        title: { font: { size: 14 } },
        showgrid: true,
        gridcolor: '#e0e0e0',
        linecolor: '#ccc',
        linewidth: 1,
        mirror: true,
        rangemode: 'tozero' // Inizia sempre da zero
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
    const loadingSpinner = plotContainer.querySelector('.loading-spinner');
    const loadingMessage = plotContainer.querySelector('.loading-message');

    // Mostra spinner e messaggio di caricamento
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (loadingMessage) loadingMessage.style.display = 'block';
    plotContainer.innerHTML = ''; // Pulisce il contenuto precedente, ma manterrà spinner/message se sono figli

    console.log(`[Plot Creation] Inizio creazione grafico per ID: ${id}`);

    try {
        const rawData = await loadCSV(filePath);
        
        const years = [];
        const values = [];
        let valueKey = null;

        if (rawData.length === 0) {
            throw new Error("Dati CSV vuoti o non validi dopo il caricamento.");
        }

        // Tenta di identificare la colonna dell'anno e dei valori in modo flessibile
        const headerKeys = Object.keys(rawData[0]).map(key => key.trim()); // Pulisci spazi
        const yearKey = headerKeys.find(key => 
            key.toLowerCase() === 'year' || 
            key.toLowerCase() === 'anno' || 
            key.toLowerCase().includes('year') || // Es: 'Anni', 'Yearly'
            key.toLowerCase().includes('data') // Se l'anno è in una colonna "Data"
        );
        
        // Trova la colonna dei valori escludendo quelle relative a tempo/identificatori
        valueKey = headerKeys.find(key => 
            key.toLowerCase() !== (yearKey ? yearKey.toLowerCase() : '') && // Non sia la colonna dell'anno
            !key.toLowerCase().includes('date') && 
            !key.toLowerCase().includes('month') &&
            !key.toLowerCase().includes('id') && // Escludi colonne ID
            key // Assicurati che la chiave non sia vuota
        );

        if (!yearKey) {
            console.error(`[Plot Error] Colonna 'Year' o 'Anno' non trovata nel CSV per ${id}. Header disponibili:`, headerKeys);
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore: Colonna 'Anno' non trovata nel CSV.</p>`;
            return;
        }
        if (!valueKey) {
            console.error(`[Plot Error] Colonna dei valori non trovata nel CSV per ${id}. Header disponibili:`, headerKeys);
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore: Colonna dei valori non trovata nel CSV.</p>`;
            return;
        }

        rawData.forEach(row => {
            const yearCandidate = row[yearKey];
            const valueCandidate = row[valueKey];

            // Gestisce vari formati di anno (es. "2000" o "2000-01-01")
            let year = parseFloat(yearCandidate);
            if (isNaN(year) && typeof yearCandidate === 'string' && yearCandidate.length >= 4) {
                year = parseFloat(yearCandidate.substring(0, 4));
            }

            const value = parseFloat(valueCandidate);

            if (!isNaN(year) && !isNaN(value) && year !== null && value !== null) {
                years.push(year);
                values.push(value);
            } else {
                console.warn(`[Data Warning] Riga saltata per ${id} a causa di dati non numerici: Anno='${yearCandidate}', Valore='${valueCandidate}'`);
            }
        });
        
        if (years.length < 2 || years.length !== values.length) {
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Dati insufficienti o non validi per il grafico.</p>`;
            console.error(`[Plot Error] Dati insufficienti o non validi dopo il parsing per ${id}: Anni=${years.length}, Valori=${values.length}. File: ${filePath}`);
            return;
        }

        console.log(`[Plot Data] Estratti anni per ${id}:`, years);
        console.log(`[Plot Data] Estratti valori (${valueKey}) per ${id}:`, values);

        const { slope, r_squared, trend_x, trend_y } = calculateLinearRegression(years, values);

        const dataTraces = [
            {
                x: years,
                y: values,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Valori',
                line: { color: color, width: 2 },
                marker: { size: 7, color: color, line: { color: 'white', width: 1.5 } }
            },
            {
                x: trend_x,
                y: trend_y,
                mode: 'lines',
                type: 'scatter',
                name: 'Trend Lineare',
                line: { color: '#FF0000', width: 3, dash: 'dash' },
                hoverinfo: 'none'
            }
        ];

        const layout = {
            ...commonLayout,
            title: {
                text: `<b>${title}</b>`,
                font: { size: 18, color: '#333' }
            },
            yaxis: {
                ...commonLayout.yaxis,
                title: { text: yAxisTitle, font: { size: 14 } }
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
                    font: { size: 12, color: '#FF0000' },
                    showarrow: false,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    bordercolor: '#ccc',
                    borderwidth: 1,
                    borderpad: 5
                }
            ]
        };

        Plotly.newPlot(id, dataTraces, layout, { responsive: true }).then(() => {
            console.log(`[Plot Success] Grafico ${id} creato con successo.`);
        }).catch(plotError => {
            console.error(`[Plotly Error] Errore nella creazione del grafico Plotly per ${id}:`, plotError);
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore nella visualizzazione del grafico. Controlla la console.</p>`;
        });
    } catch (error) {
        console.error(`[Plot Error] Errore generale nel caricamento/preparazione dati per ${id}:`, error);
        plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore nel caricamento dei dati per il grafico. Controlla la console.</p>`;
    } finally {
        // Nascondi spinner e messaggio una volta completato il tentativo di plotting
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';
    }
}

// Funzione per mostrare/nascondere il bottone "Torna su"
function setupBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) {
        console.warn("[BackToTop] Bottone 'back-to-top' non trovato nell'HTML.");
        return;
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) { // Mostra il bottone dopo aver scrollato 400px
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
    console.log("[BackToTop] Bottone 'Torna su' configurato.");
}

// Funzione per attivare le animazioni fade-in
function setupFadeInAnimations() {
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length === 0) {
        console.warn("[Animations] Nessun elemento con classe 'fade-in' trovato per le animazioni.");
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
    console.log("[Animations] Animazioni fade-in configurate.");
}


// Inizializzazione di tutte le funzionalità al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("--- DOM completamente caricato. Inizio configurazione sito. ---");
    
    // Configura il bottone "Torna su"
    setupBackToTopButton();

    // Configura le animazioni fade-in
    setupFadeInAnimations();

    // Richiama la funzione per creare ogni grafico con i tuoi NOMI FILE AGGIORNATI
    // Assicurati che questi file siano nella cartella 'data/' sul tuo GitHub e siano accessibili
    // Nomi dei file basati su Barcellona.pdf e logica Climpact. Assicurati che le colonne Year/Anno e i dati siano validi.
    createPlot('plot-prcptot', 'data/Vercelli_94_24_prcptot_ANN.csv', 'prcptot: Precipitazione Totale Annuale', 'mm', '#007bff');
    createPlot('plot-sdii', 'data/Vercelli_94_24_sdii_ANN.csv', 'sdii: Intensità Media Precipitazioni', 'mm/giorno', '#28a745');
    createPlot('plot-spi_24_month', 'data/Vercelli_94_24_24month_spi_MON.csv', 'spi_24_month: Indice di Precipitazione Standardizzato (24 Mesi)', 'Valore SPI', '#ffc107');
    createPlot('plot-spei_24_month', 'data/Vercelli_94_24_24month_spei_MON.csv', 'spei_24_month: Indice Standardizzato di Precipitazione ed Evapotraspirazione (24 Mesi)', 'Valore SPEI', '#fd7e14');
    createPlot('plot-tn90p', 'data/Vercelli_94_24_tn90p_ANN.csv', 'tn90p: Giorni con Minima Estremamente Calda', '% Giorni', '#dc3545');
    createPlot('plot-tx10p', 'data/Vercelli_94_24_tx10p_ANN.csv', 'tx10p: Giorni con Massima Estremamente Fredda', '% Giorni', '#6c757d');
    createPlot('plot-tx90p', 'data/Vercelli_94_24_tx90p_ANN.csv', 'tx90p: Giorni con Massima Estremamente Calda', '% Giorni', '#e83e8c');
});
