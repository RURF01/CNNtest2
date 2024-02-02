let model;
let canvas;
let ctx;
let drawing = false;

// Función para cargar el modelo
async function loadModel() {
    model = await tf.loadLayersModel('https://raw.githubusercontent.com/RURF01/CNNtest2/main/model.json');
    console.log("Modelo cargado.");
}

function startDrawing(event) {
    drawing = true;
    draw(event);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;

    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

function preprocessCanvas(image) {
    // Obtener el contexto 2D de la imagen
    const ctx = image.getContext('2d');

    // Crear un nuevo canvas para redimensionar la imagen a 28x28
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = 28;
    tempCanvas.height = 28;

    // Dibujar la imagen en el nuevo canvas y redimensionar
    tempCtx.drawImage(image, 0, 0, 28, 28);

    // Obtener los datos de píxeles del nuevo canvas
    const imageData = tempCtx.getImageData(0, 0, 28, 28);

    // Convertir los datos de píxeles a un tensor
    let tensor = tf.browser.fromPixels(imageData)
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();

    // Normalizar los valores de píxeles
    tensor = tensor.div(255.0);

    return tensor;
}

function predict() {
    let tensor = preprocessCanvas(canvas);
    model.predict(tensor).data().then(prediction => {
        let results = Array.from(prediction);
        displayResult(results);
    });
}

function displayResult(results) {
    const resultContainer = document.getElementById('prediction');
    resultContainer.innerHTML = '';

    results.forEach((value, index) => {
        const percentage = (value * 100).toFixed(2);
        const resultItem = document.createElement('div');
        resultItem.innerText = `Clase ${index}: ${percentage}%`;
        resultContainer.appendChild(resultItem);
    });
}

window.onload = function() {
    loadModel();

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', function(event) {
        let touch = event.touches[0];
        let mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

    document.getElementById('predict-button').addEventListener('click', predict);
}
