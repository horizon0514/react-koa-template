export const updateCuiVersion = (version) => {
    return fetch('/cuiversion', {
        method: 'POST',
        body: version
    })
}

export const getCuiVersion = () => {
    return fetch('/cuiversion')
}
