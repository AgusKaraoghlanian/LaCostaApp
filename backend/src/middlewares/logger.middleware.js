const logMiddleware = (req, res, next) => {
    console.log(`Se ejecutó el metodo ${req.method} a la url ${req.protocol}://${req.host}${req.url}`);

    next();
}

export { logMiddleware }