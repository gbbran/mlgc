const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function performPrediction(model, imageBuffer) {
    try {
        // Decode the image to a tensor
        const tensor = tf.node.decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims();

        console.log('Image tensor shape:', tensor.shape);

        // Perform the prediction
        const prediction = model.predict(tensor);
        const predictionData = prediction.dataSync();

        console.log('Raw prediction data:', predictionData);

        const confidenceScore = predictionData[0] * 100; // Assuming the model returns a single output with probability
        const label = confidenceScore > 50 ? 'Cancer' : 'Non-cancer';

        // Explanation and suggestion based on the label
        let explanation, suggestion;
        if (label === 'Cancer') {
            explanation = "Hasil prediksi menunjukkan adanya kanker kulit.";
            suggestion = "Segera konsultasi dengan dokter untuk pemeriksaan lebih lanjut.";
        } else {
            explanation = "Hasil prediksi menunjukkan tidak adanya kanker kulit.";
            suggestion = "Anda sehat! Tetap jaga kesehatan kulit Anda.";
        }

        return { confidenceScore, label, explanation, suggestion };
    } catch (error) {
        console.error('Error during prediction:', error);
        throw new InputError(`Terjadi kesalahan input: ${error.message}`);
    }
}

module.exports = performPrediction;
