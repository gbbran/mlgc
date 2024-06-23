const { handlePredictionRequest, handleHistoryRequest } = require('./handler');

const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: handlePredictionRequest,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true
      }
    }
  },
  {
    path: '/predict/histories',
    method: 'GET',
    handler: handleHistoryRequest
  }
];

module.exports = routes;
