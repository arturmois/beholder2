function doLogin(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    if (email === 'arturmoiscontato@gmail.com'
        && password === '123456') {
        res.sendStatus(200);
    }
    else
        res.sendStatus(401)
}

function doLogout(req, res, next) {

}

module.exports = {
    doLogin,
    doLogout
}