class CustomClientError extends Error {
  constructor(msg, code = 400) {
    super(msg);
    this.code = code;
    this.name = 'CustomClientError';
  }
}

module.exports = CustomClientError;
