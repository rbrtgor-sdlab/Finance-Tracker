const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const chartCanvas = document.getElementById("chart");
const date = document.getElementById("date");

let chart;

// Load saved data
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Form submit
if (form) {
  form.addEventListener("submit", addTransaction);
}

function addTransaction(e) {
  e.preventDefault();

  // Validation of form input to ensure all fields in the add transaction page are filled
  if (!text.value || !amount.value || !date.value) {
    alert("Please fill all fields");
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    date: date.value,
  };

  transactions.push(transaction);

  // Save transactions
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Reset form
  text.value = "";
  amount.value = "";
  date.value = "";

  // Update UI immediately
  updateUI();

  // ✅ Redirect to dashboard (better UX)
  window.location.href = "index.html";
}

function updateUI() {
  if (list) list.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (list) {
      const li = document.createElement("li");

      li.innerHTML = `
        <div>
          <strong>${t.text}</strong><br>
          <small>${t.date}</small>
        </div>
        <span>KES ${Math.abs(t.amount)}</span>
        <button onclick="deleteTransaction(${t.id})">x</button>
      `;

      // ✅ Color indicator
      li.style.borderRight = t.amount > 0 ? "5px solid green" : "5px solid red";

      list.appendChild(li);
    }

    if (t.amount > 0) income += t.amount;
    else expense += t.amount;
  });

  if (balance) balance.innerText = income + expense;
  if (incomeEl) incomeEl.innerText = income;
  if (expenseEl) expenseEl.innerText = Math.abs(expense);

  if (chartCanvas) updateChart(income, Math.abs(expense));
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateUI();
}

function updateChart(income, expense) {
  if (!chartCanvas) return;

  // Destroy old chart
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["green", "red"],
        },
      ],
    },
  });
}

// Load UI on page start
updateUI();
