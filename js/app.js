axios.get('/lifecycle/scan', (response) => {
    let qrCode = response.qrCode;
    console.log(response);
    ReactDOM.render(qrCode, document.getElementById('qrCode'));
});