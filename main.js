// Questo è un esempio semplificato con dati fittizi.
// Dovrai sostituirlo con la logica per caricare i TUOI dati Climpact
// e creare i TUOI 9 grafici.

// Dati di esempio per prcptot (sostituisci con i tuoi dati reali)
const prcptot_data = {
    anni: Array.from({length: 36}, (_, i) => 1988 + i), // Anni dal 1988 al 2023
    valori: [650, 500, 800, 600, 750, 550, 950, 480, 530, 470, 580, 450, 950, 500, 600, 550, 470, 590, 520, 600, 850, 700, 580, 350, 480, 980, 600, 720, 300, 310, 290, 320, 400, 500, 600, 700]
};

const trace1 = {
    x: prcptot_data.anni,
    y: prcptot_data.valori,
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Precip. Totale Annuale'
};

const layout1 = {
    title: 'Andamento Annuale Precipitazioni Totali (prcptot)',
    xaxis: {
        title: 'Anno'
    },
    yaxis: {
        title: 'mm'
    }
};

// Crea il grafico nel div con id="plot-prcptot"
Plotly.newPlot('plot-prcptot', [trace1], layout1);

// Aggiungi qui la logica per gli altri 8 indici
// Avrai bisogno di un div HTML per ciascuno (es. <div id="plot-spi24month"></div>)
// e un blocco di codice JS simile a questo per ogni grafico.
