const HOST = 'http://' + window.location.host;

const token = localStorage.getItem('token');
let balance = 0;
let EXPENSE_ID = null;
let amountBeforeEdit = 0;

const expenseList = document.getElementById('expense-list');
const form = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const errMsg = document.getElementById('err-msg');
const balanceDisplay = document.getElementById('balance');
const showUsername = document.getElementById('username');
const premiumStatus = document.getElementById('premiumStatus');
const premiumFeatures = document.getElementById('premiumFeatures');
const showLeaderboardBtn = document.getElementById('showLeaderboard');
const showLeaderboardLI = document.getElementById('showLeaderboardLI');
const hideLeaderboardBtn = document.getElementById('hideLeaderboard');
const hideLeaderboardLI = document.getElementById('hideLeaderboardLI');
const leaderboardList = document.getElementById('leaderboard-list');
const expenseListHeading = document.getElementById('expense-list-heading');
const leaderboardHeading = document.getElementById('leaderboard-heading');
const logoutBtn = document.getElementById('logout');
const downloadExpensesFileBtn = document.getElementById('downloadExpensesFile');
const showDownloadHistoryBtn = document.getElementById('showDownloadHistory');
const showDownloadHistoryLI = document.getElementById('showDownloadHistoryLI');
const hideDownloadHistoryBtn = document.getElementById('hideDownloadHistory');
const hideDownloadHistoryLI = document.getElementById('hideDownloadHistoryLI');
const downloadHistoryHeading = document.getElementById('download-history-heading');
const downloadHistoryList= document.getElementById('download-history-list');
const paginationButtons = document.getElementById('paginationButtons');

/* function calculateBalanceDOM(expenses){
    balance = expenses.reduce((total, expense) => total + expense.amount, 0);
    balanceDisplay.innerText = balance;
} */

//mode = '+' means add the amount, '-' means substract the amount
function updateBalanceDOM(amount, mode){ 
    if(mode === '+'){
        balance += parseInt(amount);
    }else if(mode === '-'){
        balance -= parseInt(amount);
    }
    balanceDisplay.innerText = balance;
}

function deleteExpense(li){
    const expenseId = li.id;
    axios.delete(`${HOST}/expense/delete-expense/${expenseId}`, {headers: {'Authorization': token}})
    .then((res) => {
        expenseList.removeChild(li);
        updateBalanceDOM(res.data.amount, '-');
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not Delete Expense :(');
    });
}

function editExpense(li){
    const expenseId = li.id;
    axios.get(`${HOST}/expense/edit-expense/${expenseId}`, {headers: {'Authorization': token}})
    .then((res) => {
        const amount = parseInt(res.data.amount);
        if(amount > 0){
            incomeRadio.checked = true;
            amountBeforeEdit = Math.abs(amount);
        }else{
            expenseRadio.checked = true;
            amountBeforeEdit = -Math.abs(amount);
        }
        amountInput.value = Math.abs(amount);
        descriptionInput.value = res.data.description;
        categoryInput.value = res.data.category;
        EXPENSE_ID = expenseId;
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not Edit Expense :(');
    });
}

function showExpenseInDOM(expense){
    const sign = expense.amount > 0 ? '+' : '-';

    const li = document.createElement('li');
    li.className = expense.amount > 0 ? 'list-group-item text-success' : 'list-group-item text-danger';
    li.id = expense.id;
    li.innerText = `${sign}${Math.abs(expense.amount)} : ${expense.description} : ${expense.category}`;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'btn-group btn-group-sm float-end';
    buttonGroup.role = 'group';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline-secondary';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', (e) => {
        editExpense(li);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-outline-danger';
    delBtn.innerText = 'Delete';
    delBtn.addEventListener('click', (e) => {
        deleteExpense(li);
    });

    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(delBtn);
    li.appendChild(buttonGroup);

    expenseList.appendChild(li);
}

function showAllExpensesInDOM(expenses){
    if(expenses.length > 0){
        expenseListHeading.innerText = 'Expense List';
    }
    expenseList.innerHTML = '';
    expenses.forEach((expense) => {
        showExpenseInDOM(expense);
    });
    balanceDisplay.innerText = balance;
}

function paginationInDOM(currentPage, prevPage, nextPage, limit=5){
    currentPage = parseInt(currentPage);
    prevPage = parseInt(prevPage);
    nextPage = parseInt(nextPage);
    
    paginationButtons.innerText = '';
    
    const currentPageBtn = document.createElement('button');
    currentPageBtn.innerText = currentPage;
    currentPageBtn.className = 'btn btn-secondary';
    currentPageBtn.addEventListener('click', () => getAllExpenses(currentPage, limit));

    const prevPageBtn = document.createElement('button');
    prevPageBtn.innerText = '<< Prev';
    prevPageBtn.className = 'btn btn-outline-secondary';
    prevPageBtn.addEventListener('click', () => getAllExpenses(prevPage, limit));

    const nextPageBtn = document.createElement('button');
    nextPageBtn.innerText = 'Next >>';
    nextPageBtn.className = 'btn btn-outline-secondary';
    nextPageBtn.addEventListener('click', () => getAllExpenses(nextPage, limit));

    if(prevPage){
        prevPageBtn.classList.remove('disabled');
    }else{
        prevPageBtn.classList.add('disabled');
    }
    if(nextPage){
        nextPageBtn.classList.remove('disabled');
    }else{
        nextPageBtn.classList.add('disabled');
    }

    paginationButtons.appendChild(prevPageBtn);
    paginationButtons.appendChild(currentPageBtn);
    paginationButtons.appendChild(nextPageBtn);
}

function getAllExpenses(page=1, limit=5){
    if(localStorage.getItem('limit')){
        limit = localStorage.getItem('limit');
    }
    axios.get(`${HOST}/expense/get-expenses?page=${page}&limit=${limit}`, {headers: {'Authorization': token}})
    .then((res) => {
        const expenses = res.data.expenses;
        balance = res.data.balance;
        if(expenses.length <= 0){
            const paginationRowDiv = document.getElementById('paginationRowDiv');
            paginationRowDiv.innerText = '';
            return;
        }
        showAllExpensesInDOM(expenses);
        const currentPage = res.data.currentPage;
        const prevPage = res.data.prevPage;
        const nextPage = res.data.nextPage;
        paginationInDOM(currentPage, prevPage, nextPage, limit);
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not Fetch Expenses :(');
    });
}

function addExpense(e){ 
    e.preventDefault();

    const incomeRadio = document.getElementById('incomeRadio');
    const expenseRadio = document.getElementById('expenseRadio');

    let amount = parseInt(amountInput.value);
    if(incomeRadio.checked === true){
        amount = Math.abs(amount);
    }else if(expenseRadio.checked === true){
        amount = -Math.abs(amount);
    }else{
        showErrorInDOM('Select either Income or Expense!');
        return;
    }

    const expense = {
        amount: amount,
        description: descriptionInput.value,
        category: categoryInput.value,
        expenseId: EXPENSE_ID
    };
    
    axios.post(`${HOST}/expense/add-expense`, expense, {headers: {'Authorization': token}})
    .then((res) => {
        showExpenseInDOM(res.data);
        if(EXPENSE_ID){
            expenseList.removeChild(document.getElementById(EXPENSE_ID));
            updateBalanceDOM(amountBeforeEdit, '-');
        }
        updateBalanceDOM(res.data.amount, '+');
        amountInput.value = '';
        descriptionInput.value = '';
        categoryInput.selectedIndex = 0;
        incomeRadio.checked = false;
        expenseRadio.checked = false;
        EXPENSE_ID = null;
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not add Expense :(');
        EXPENSE_ID = null;
    });
}

function showErrorInDOM(msg){
    errMsg.innerHTML = `<h4>${msg}</h4>`;
    setTimeout(() => errMsg.innerHTML = '', 3000);
}

function razorpay(e){
    axios.get(`${HOST}/purchase/premium-membership`, {headers: {'Authorization': token}})
    .then((res) => {
        const options = {
            "key": res.data.key_id, //enter the key id generated from the dashboard
            "order_id": res.data.order.id, //for one time payment
            "handler": async function () {
                try{
                    const res1 = await axios.post(`${HOST}/purchase/update-transaction-status`, {
                        status: 'success',
                        order_id: options.order_id,
                        payment_id: res.razorpay_payment_id
                    }, {headers: {'Authorization': token}});
                    alert('Congrats! You are now a Premium user!');
                    localStorage.setItem('token', res1.data.token);
                    showUserInfoInDOM();
                }catch(err){
                    console.log(err);
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', async (err) => {
            try{
                await axios.post(`${HOST}/purchase/update-transaction-status`, {
                    status: 'failed',
                    order_id: err.error.metadata.order_id
                }, {headers: {'Authorization': token}});
                alert('Payment Failed!');
            }catch(err){
                console.log(err);
            }
        });

        rzp1.open();
        e.preventDefault();
    })
    .catch((err) => console.log(err));
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function logoutUser(){
    window.location.href = `${HOST}/user/login`;
}

function downloadExpenses(){
    axios.get(`${HOST}/premium/download-expenses`, {headers: {'Authorization': token}})
    .then((res) => {
        const fileURL = res.data;
        window.open(fileURL, '_blank');
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not get expenses file :(');
    })
}

function showUserInfoInDOM(){
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const username = decodedToken.username;
    const isPremiumUser = decodedToken.isPremiumUser;
    showUsername.innerText = username;

    if(isPremiumUser){
        premiumFeatures.style.display = 'block';
        premiumStatus.innerText = 'Premium User';
    }else{
        premiumFeatures.style.display = 'none';

        const premiumBtn = document.createElement('button');
        premiumBtn.className = 'btn btn-outline-warning border-0 px-0';
        premiumBtn.innerText = 'Get Premium';
        premiumBtn.addEventListener('click', razorpay);
        premiumStatus.innerText = '';
        premiumStatus.appendChild(premiumBtn);
    }

    logoutBtn.addEventListener('click', logoutUser);
}

function showLeaderInDOM(leader, rank){
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-warning';
    li.innerText = `${rank}. Name: ${leader.username} , Balance: ${leader.balance}`;
    leaderboardList.appendChild(li);
}

function hideLeaderboardInDOM(){
    leaderboardHeading.innerText = '';
    leaderboardList.innerText = '';
    showLeaderboardLI.style.display = 'block';
    hideLeaderboardLI.style.display = 'none';
}

function showLeaderboardInDOM(){
    axios.get(`${HOST}/premium/get-leaderboard`, {headers: {'Authorization': token}})
    .then((res) => {
        leaderboardHeading.innerText = 'Leaderboard (Top 5)';
        const list = res.data;
        leaderboardList.innerText = '';
        let rank = 1;
        list.forEach((leader) => {
            showLeaderInDOM(leader, rank);
            rank++;
        });
        showLeaderboardLI.style.display = 'none';
        hideLeaderboardLI.style.display = 'block';
    })
    .catch((err) => showErrorInDOM('Could not fetch leaderboard!'));
}

function showDownloadInDOM(item, rank){
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-warning';
    li.innerHTML = `${rank}. <a href="${item.fileURL}">${item.createdAt}</a>`;
    downloadHistoryList.appendChild(li);
}

function hideDownloadedExpenseFileHistoryInDOM(){
    downloadHistoryHeading.innerText = '';
    downloadHistoryList.innerText = '';
    showDownloadHistoryLI.style.display = 'block';
    hideDownloadHistoryLI.style.display = 'none';
}

function showDownloadedExpenseFileHistoryInDOM(){
    axios.get(`${HOST}/premium/downloaded-expense-file-history`, {headers: {'Authorization': token}})
    .then((res) => {
        downloadHistoryHeading.innerText = 'Download History (Last 10)';
        const list = res.data.reverse();
        downloadHistoryList.innerText = '';
        let rank = 1;
        list.reverse().forEach((item) => {
            showDownloadInDOM(item, rank);
            rank++;
        });
        showDownloadHistoryLI.style.display = 'none';
        hideDownloadHistoryLI.style.display = 'block';
    })
    .catch((err) => {
        showErrorInDOM('Error: Could not get downloaded expense file history :(');
    })
}

function initPremiumEventListeners(){
    showLeaderboardBtn.addEventListener('click', showLeaderboardInDOM);
    hideLeaderboardBtn.addEventListener('click', hideLeaderboardInDOM);
    downloadExpensesFileBtn.addEventListener('click', downloadExpenses);
    showDownloadHistoryBtn.addEventListener('click', showDownloadedExpenseFileHistoryInDOM);
    hideDownloadHistoryBtn.addEventListener('click', hideDownloadedExpenseFileHistoryInDOM);
}

function setPaginationLimit(){
    const paginationLimit = document.getElementById('paginationLimit');
    paginationLimit.addEventListener('change', () => {
        localStorage.setItem('limit', paginationLimit.value);
        window.location.reload();
    });
}

form.addEventListener('submit', addExpense);

window.addEventListener('DOMContentLoaded', () => {
    getAllExpenses();
    showUserInfoInDOM();
    initPremiumEventListeners();
    setPaginationLimit();
});
