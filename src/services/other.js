export function transformWeex(code){
    return fetch('/weex', {
        method : 'POST',
        body : code
    });
}

export function beautifyCode (code, mode){
    return fetch('/beautify', {
        method : 'POST',
        body : {code, mode}
    })
}
