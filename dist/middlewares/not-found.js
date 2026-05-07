export const notFoundHandler = (request, response) => {
    response.status(404).json({
        message: `Route ${request.method} ${request.originalUrl} not found`,
    });
};
