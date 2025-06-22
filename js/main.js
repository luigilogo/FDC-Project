// Funzione per caricare dati CSV
async function loadCSV(filePath) {
    console.log(`Tentativo di caricamento CSV da: ${filePath}`);
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true, // Ignora righe vuote
            complete: function(results) {
                if (results.errors.length) {
                    console.error(`Errore nel parsing CSV per ${filePath}:`, results.errors);
                    reject(results.errors);
                } else if (!results.data || results.data.length === 0) {
                    console.warn(`File CSV vuoto o senza dati per: ${filePath}`);
                    reject(new Error("No data in CSV file."));
                } else {
                    console.log(`Dati CSV caricati con successo da: ${filePath}`, results.data);
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
        tickmode: 'array', // Forzo tickmode per anni interi
        tickvals: Array.from({length: (2024 - 1994 + 1)}, (v, k) => 1994 + k), // Anni da 1994 a 2024
        ticktext: Array.from({length: (2024 - 1994 + 1)}, (v, k) => (1994 + k).toString()),
        tickangle: -45 // Inclinazione etichette anni
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

// Funzione per creare un grafico generico con trendline
async function createPlot(id, filePath, title, yAxisTitle, color = '#007bff') {
    const plotContainer = document.getElementById(id);
    plotContainer.innerHTML = `<p class="loading-message">Caricamento grafico...</p>`;
    console.log(`Inizio creazione grafico per ID: ${id}`);

    try {
        const rawData = await loadCSV(filePath);
        console.log(`Dati grezzi ricevuti per ${id}:`, rawData);

        // Filtra le righe con dati nulli o non validi
        const filteredData = rawData.filter(row => {
            const year = row.Year;
            const valueKey = Object.keys(row).find(key => key !== 'Year');
            const value = valueKey ? row[valueKey] : undefined;
            return year !== null && year !== undefined && !isNaN(year) &&
                   value !== null && value !== undefined && !isNaN(value);
        });
        
        if (filteredData.length === 0) {
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Nessun dato valido trovato per il grafico di ${title}.</p>`;
            console.error(`Nessun dato valido dopo il filtro per ${id} da ${filePath}.`);
            return;
        }

        const years = filteredData.map(row => row.Year);
        // Trova la colonna dei valori in modo più robusto
        const valueKey = Object.keys(filteredData[0]).find(key => key.toLowerCase() !== 'year' && key.toLowerCase() !== 'anno');
        if (!valueKey) {
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Colonna dei valori non trovata nel CSV per ${title}.</p>`;
            console.error(`Impossibile trovare la colonna dei valori per ${id} da ${filePath}. Colonne disponibili:`, Object.keys(filteredData[0]));
            return;
        }
        const values = filteredData.map(row => row[valueKey]);
        
        console.log(`Estratti anni per ${id}:`, years);
        console.log(`Estratti valori (${valueKey}) per ${id}:`, values);

        if (years.length !== values.length || years.length < 2) { // Almeno 2 punti per la regressione
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Dati insufficienti o non coerenti per il grafico di ${title}.</p>`;
            console.error(`Dati insufficienti o incoerenti per ${id}: Anni=${years.length}, Valori=${values.length}`);
            return;
        }

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
                    color: '#FF0000',
                    width: 3,
                    dash: 'dash'
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
                    text: `Trend: ${slope.toFixed(3)} ${yAxisTitle}/anno`,
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
        }).catch(plotError => {
            console.error(`Errore nella creazione del grafico Plotly per ${id}:`, plotError);
            plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore durante la visualizzazione del grafico.</p>`;
        });
    } catch (error) {
        console.error(`Errore generale nel caricamento o preparazione dati per ${id}:`, error);
        plotContainer.innerHTML = `<p style="color: red; text-align: center;">Errore nel caricamento dei dati per il grafico.</p>`;
    }
}

// Chiama la funzione per creare ogni grafico al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente caricato. Inizio caricamento grafici.");
    // Indici di Precipitazione
    createPlot('plot-prcptot', 'data/Vercelli_94_24_prcptot_ANN.csv', 'prcptot: Precipitazione Totale Annuale', 'mm', '#007bff');
    createPlot('plot-sdii', 'data/Vercelli_94_24_sdii_ANN.csv', 'sdii: Intensità Media Precipitazioni', 'mm/giorno', '#28a745');

    // Indici di Siccità
    createPlot('plot-spi_24_month', 'data/Vercelli_94_24_24month_spi_MON.csv', 'spi_24_month: Indice di Precipitazione Standardizzato (24 Mesi)', 'Valore SPI', '#ffc107');
    createPlot('plot-spei_24_month', 'data/Vercelli_94_24_24month_spei_MON.csv', 'spei_24_month: Indice Standardizzato di Precipitazione ed Evapotraspirazione (24 Mesi)', 'Valore SPEI', '#fd7e14');

    // Indici di Temperatura Estrema (Minima e Massima)
    createPlot('plot-tn90p', 'data/Vercelli_94_24_tn90p_ANN.csv', 'tn90p: Giorni con Minima Estremamente Calda', '% Giorni', '#dc3545');
    createPlot('plot-tx10p', 'data/Vercelli_94_24_tx10p_ANN.csv', 'tx10p: Giorni con Massima Estremamente Fredda', '% Giorni', '#6c757d');
    createPlot('plot-tx90p', 'data/Vercelli_94_24_tx90p_ANN.csv', 'tx90p: Giorni con Massima Estremamente Calda', '% Giorni', '#e83e8c');
});
