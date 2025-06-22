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

// Configurazione comune per i layout dei grafici (migliora l'estetica)
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
        rangemode: 'tozero' // Inizia sempre da zero sull'asse X
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
    // Aggiungi un'ombra al grafico
    'xaxis.showline': true,
    'yaxis.showline': true
};

// Funzione per creare un grafico generico
async function createPlot(id, filePath, title, yAxisTitle, color = '#007bff') {
    try {
        const data = await loadCSV(filePath);
        
        // Estrai Anno e Valore. Assumi che la prima colonna sia l'anno e la seconda il valore.
        const years = data.map(row => row.Year || row.Anno); // Adatta al nome della tua colonna anno
        const values = data.map(row => row[Object.keys(row)[1]]); // Prende il valore dalla seconda colonna

        const trace = {
            x: years,
            y: values,
            mode: 'lines+markers',
            type: 'scatter',
            name: title.split(':')[0], // Usa solo la prima parte del titolo per la legenda
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
        };

        const layout = {
            ...commonLayout, // Copia le impostazioni comuni
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
            }
        };

        Plotly.newPlot(id, [trace], layout, { responsive: true }); // responsive: true per adattarsi alla dimensione del container
    } catch (error) {
        console.error(`Errore nel caricamento o nella creazione del grafico per ${id}:`, error);
        document.getElementById(id).innerHTML = `<p style="color: red; text-align: center;">Errore nel caricamento del grafico.</p>`;
    }
}

// Chiama la funzione per creare ogni grafico
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
