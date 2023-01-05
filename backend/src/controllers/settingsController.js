function getSettings(req, res, next) {
    res.json({
        email: 'arturmoiscontato@gmail.com'
    })
}

module.exports = { getSettings }