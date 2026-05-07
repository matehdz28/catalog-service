export const validate = (schema) => {
    return (request, _response, next) => {
        request.body = schema.parse(request.body);
        next();
    };
};
