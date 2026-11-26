function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || 'value';
    return res.status(409).json({
      success: false,
      message: duplicateField === 'email'
        ? 'An employee with this email address already exists.'
        : `A record with this ${duplicateField} already exists.`,
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
  }

  const statusCode = error.statusCode || error.status || 500;
  if (statusCode >= 500) {
    console.error('API error:', error.message);
  }
  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'An unexpected server error occurred.' : error.message,
  });
}

module.exports = { notFound, errorHandler };
