const intToBRL = (number) => {
    const nString = number.toString();
    const reals = nString.substring(0, nString.length - 2);
    const cents = nString.substring(nString.length - 2);
    return `R$ ${reals},${cents}`
}

module.exports = { intToBRL }