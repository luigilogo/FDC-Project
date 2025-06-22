// Funzione per caricare dati CSV
async function loadCSV(filePath) {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            dynamicTyping: true, // Tenta di convertire automaticamente i numeri
            complete: function(results) {
                if (results.errors.length) {
                    console.error("Error parsing CSV:", results.errors);
                    reject(results.errors);
                } else {
                    resolve(results.data);
                }
            },
            error: function(err) {
                reject(err);
            }
        });
    });
}

// Funzione per calcolare la regressione lineare (trendline)
function calculateLinearRegression(x, y) {
    const n = x.length;
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

    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;

    // Genera i punti per la linea di regressione
    const trend_x = [Math.min(...x), Math.max(...x)];
    const trend_y = [intercept + slope * trend_x[0], intercept + slope * trend_x[1]];

    return { slope, intercept, trend_x, trend_y };
}

// Configurazione comune per i layout dei grafici
const commonLayout = {
    font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#333'
    },
    hovermode: 'closest',
    margin: { t: 50, b: 60, l: 60, r: 20 },
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
        // Plotly è smart, non forzo rangemode per l'anno
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
        rangemode: 'tozero' // Inizia sempre da zero sull'asse Y per valori positivi
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
    // Abilita le linee degli assi
    'xaxis.showline': true,
    'yaxis.showline': true
};

// Funzione per creare un grafico generico con trendline
async function createPlot(id, filePath, title, yAxisTitle, color = '#007bff') {
    const plotContainer = document.getElementById(id);
    // Mostra messaggio di caricamento
    plotContainer.innerHTML = `<p class="loading-message">Caricamento grafico...</p>`;

    try {
        const data = await loadCSV(filePath);
        
        // Estrai Anno e Valore. Assumi che la prima colonna sia l'anno e la seconda il valore.
        const years = data.map(row => row.Year || row.Anno).filter(year => year !== null);
        const values = data.map(row => row[Object.keys(row)[1]]).filter(value => value !== null);

        // Controllo per dati insufficienti
        if (years.length === 0 || values.length === 0 || years.length !== values.length) {
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Dati insufficienti o non validi per il grafico.</p>`;
            return;
        }

        // Calcola la regressione lineare
        const { slope, trend_x, trend_y } = calculateLinearRegression(years, values);

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
                name: 'Trend',
                line: {
                    color: '#FF0000', // Colore rosso per la trendline
                    width: 3,
                    dash: 'dash' // Linea tratteggiata
                },
                hoverinfo: 'none' // Non mostrare informazioni al passaggio del mouse sulla trendline
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
                    x: 0.05, // Posizione a sinistra
                    y: 0.95, // Posizione in alto
                    xanchor: 'left',
                    yanchor: 'top',
                    text: `Trend: ${slope.toFixed(3)} ${yAxisTitle}/anno`, // Mostra la pendenza
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

        Plotly.newPlot(id, dataTraces, layout, { responsive: true });
    } catch (error) {
        console.error(`Errore nel caricamento o nella creazione del grafico per ${id}:`, error);
        plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore nel caricamento del grafico. Controlla la console.</p>`;
    }
}

// Chiama la funzione per creare ogni grafico al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    // Indici di Precipitazione
    createPlot('plot-prcptot', 'data/prcptot.csv', 'prcptot: Precipitazione Totale Annuale', 'mm', '#007bff');
    createPlot('plot-sdii', 'data/sdii.csv', 'sdii: Intensità Media Precipitazioni', 'mm/giorno', '#28a745');

    // Indici di Siccità
    createPlot('plot-spi_24_month', 'data/spi_24_month.csv', 'spi_24_month: Indice di Precipitazione Standardizzato (24 Mesi)', 'Valore SPI', '#ffc107');
    createPlot('plot-spei_24_month', 'data/spei_24_month.csv', 'spei_24_month: Indice Standardizzato di Precipitazione ed Evapotraspirazione (24 Mesi)', 'Valore SPEI', '#fd7e14');

    // Indici di Temperatura Estrema (Minima)
    createPlot('plot-tn10p', 'data/tn10p.csv', 'tn10p: Giorni con Minima Estremamente Fredda', '% Giorni', '#17a2b8');
    createPlot('plot-tn90p', 'data/tn90p.csv', 'tn90p: Giorni con Minima Estremamente Calda', '% Giorni', '#dc3545');

    // Indici di Temperatura Estrema (Massima)
    createPlot('plot-tx10p', 'data/tx10p.csv', 'tx10p: Giorni con Massima Estremamente Fredda', '% Giorni', '#6c757d');
    createPlot('plot-tx90p', 'data/tx90p.csv', 'tx90p: Giorni con Massima Estremamente Calda', '% Giorni', '#e83e8c');
    
    // Indice di Ondate di Calore
    createPlot('plot-hwf_tx90', 'data/hwf_tx90.csv', 'HWF-Tx90: Frequenza Ondate di Calore', 'Giorni', '#6f42c1');
});
