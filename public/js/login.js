const HOST = 'http://' + window.location.host;

const form = document.getElementById('user-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('err-msg');
const successMsg = document.getElementById('success-msg');

function loginUser(e){
    e.preventDefault();
    const user = {
        email: emailInput.value,
        password: passwordInput.value
    };
    axios.post(`${HOST}/user/login`, user)
    .then((res) => {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/expense/add-expense';
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not login user';
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

form.addEventListener('submit', loginUser);
