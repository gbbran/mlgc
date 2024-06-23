const performPrediction = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const sharp = require('sharp');

async function handlePredictionRequest(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  console.log('Request payload:', request.payload);
  if (!image) {
    console.log('No image provided in payload.');
    return h.response({
      status: 'fail',
      message: 'No image provided or invalid format'
    }).code(400);
  }

  let imageBuffer;
  if (Buffer.isBuffer(image)) {
    imageBuffer = image;
  } else if (image._data) {
    imageBuffer = image._data;
  } else if (image._readableState && image._readableState.buffer && image._readableState.buffer.head && image._readableState.buffer.head.data) {
    imageBuffer = image._readableState.buffer.head.data;
  } else {
    console.log('No valid image buffer found in payload.');
    return h.response({
      status: 'fail',
      message: 'No image provided or invalid format'
    }).code(400);
  }

  console.log('Image data length:', imageBuffer.length);

  if (imageBuffer.length > 1000000) {
    return h.response({
      status: 'fail',
      message: 'Payload content length greater than maximum allowed: 1000000'
    }).code(413);
  }

  try {
    console.log('Performing prediction...');

    let metadata;
    try {
      metadata = await sharp(imageBuffer).metadata();
      console.log('Image metadata:', metadata);

      if (!['jpeg', 'jpg', 'png'].includes(metadata.format)) {
        return h.response({
          status: 'fail',
          message: 'Invalid image format. Only JPEG, JPG, and PNG are allowed.'
        }).code(400);
      }

      if (metadata.width < 100 || metadata.height < 100) {
        return h.response({
          status: 'fail',
          message: 'Invalid image dimensions. Image dimensions should be at least 100x100.'
        }).code(400);
      }

      if (metadata.channels !== 3) {
        return h.response({
          status: 'fail',
          message: 'Invalid image channels. Image must have 3 channels (RGB).'
        }).code(400);
      }
    } catch (error) {
      console.error('Invalid image format:', error);
      return h.response({
        status: 'fail',
        message: 'Invalid image format'
      }).code(400);
    }

    const { confidenceScore, label, explanation, suggestion } = await performPrediction(model, imageBuffer);
    console.log('Prediction result:', { confidenceScore, label, explanation, suggestion });
    
    const uniqueId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const record = {
      id: uniqueId,
      result: label,
      suggestion: suggestion,
      createdAt: timestamp
    };

    console.log('Saving data to Firestore:', record);
    try {
      await storeData(uniqueId, record);  // Menggunakan fungsi storeData yang diperbaiki
      console.log('Data saved successfully.');
    } catch (error) {
      console.error('Error saving data to Firestore:', error);
      throw new Error('Error saving data to Firestore');
    }

    const response = h.response({
      status: 'success',
      message: confidenceScore > 50 ? 'Model is predicted successfully.' : 'Model is predicted successfully but under threshold. Please use a clearer image.',
      data: {
        id: uniqueId,
        result: label,
        suggestion: suggestion,
        createdAt: timestamp
      }
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('Error in prediction:', error);
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    }).code(400);
  }
}

async function handleHistoryRequest(request, h) {
  const db = new Firestore({
    projectId: 'submissionmlgc-isla-inayah', 
    keyFilename: 'https://storage.googleapis.com/submissionmlgc-isla-inayah/model.json', 
  });

  const predictCollection = db.collection('predictions');
  const snapshot = await predictCollection.get();

  const histories = snapshot.docs.map(doc => ({
    id: doc.id,
    history: doc.data()
  }));

  return h.response({
    status: 'success',
    data: histories
  }).code(200);
}

module.exports = { handlePredictionRequest, handleHistoryRequest };
