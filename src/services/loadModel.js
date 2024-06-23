const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
  const modelUrl = process.env.MODEL_URL;
  console.log(`Loading model from URL: ${modelUrl}`);
  return tf.loadGraphModel(modelUrl);
}

module.exports = loadModel;
