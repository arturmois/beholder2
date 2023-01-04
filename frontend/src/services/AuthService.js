export function doLogin(email, password) {
    return new Promise((resonse, reject) => {
        if (email === 'arturmoiscontato@gmail.com'
            && password === '123456') {
            resonse(true);
        }
        reject(`Invalid user and/or password!`);
    })
}

export function doLogout(email, password) {

}