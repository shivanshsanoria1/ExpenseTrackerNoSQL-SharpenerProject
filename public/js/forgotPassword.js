const HOST = 'http://' + window.location.host;

const form = document.getElementById('user-form');
const emailInput = document.getElementById('email');
const errorMsg = document.getElementById('err-msg');
const successMsg = document.getElementById('success-msg');

function forgotPassword(e){
    e.preventDefault();
    const user = {
        email: emailInput.value
    };
    axios.post(`${HOST}/password/forgot-password`, user)
    .then((res) => {
        const msg = res.data.msg;
        showSuccessInDOM(msg);
        emailInput.value = '';
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Something went wrong :(';
        showErrorInDOM(msg);
    });
}

function showSuccessInDOM(msg){
    successMsg.innerText = msg;
    setTimeout(() => successMsg.innerText = '', 3000);
}

function showErrorInDOM(msg){
    errorMsg.innerText = msg;
    setTimeout(() => errorMsg.innerText = '', 3000);
}

form.addEventListener('submit', forgotPassword);
