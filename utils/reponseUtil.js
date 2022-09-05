const successResponse = (message,data, output) => ({
    error: false,
    data,
    message,
    output,
});

const errorResponse = (message,data, output) => ({
    error: true,
    data,
    message,
});

module.exports = {
    successResponse,
    errorResponse,
};
