const HOST = 'http://' + window.location.host;

const form = document.getElementById('user-form');
const password1Input = document.getElementById('password1');
const password2Input = document.getElementById('password2');
const errorMsg = document.getElementById('err-msg');
const successMsg = document.getElementById('success-msg');

function resetPassword(e){
    e.preventDefault();
    if(password1Input.value !== password2Input.value){
        showErrorInDOM('Passwords must match');
        return;
    }
    const user = {
        password: password1Input.value,
        link: window.location.href
    };
    axios.post(`${HOST}/password/reset-password`, user)
    .then((res) => {
        const msg = res.data.msg;
        showSuccessInDOM(msg);
        passwordInput1.value = '';
        passwordInput2.value = '';
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

form.addEventListener('submit', resetPassword);
