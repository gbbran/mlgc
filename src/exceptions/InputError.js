const CustomClientError = require("../exceptions/ClientError");

class ValidationError extends CustomClientError {
  constructor(msg) {
    super(msg);
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;
