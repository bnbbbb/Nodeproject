const handleError = (statusCode, message, next) => {
  const error = new Error(message);
  error.status = statusCode || 500;
  if (next) {
    return next(error);
  } else {
    throw error;
  }
};

module.exports = handleError;
