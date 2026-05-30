const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const list = document.getElementById("list");
const recentList = document.getElementById("recentList");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const chartCanvas = document.getElementById("chart");
const date = document.getElementById("date");
const historySearch = document.getElementById("historySearch");
const historyFilter = document.getElementById("historyFilter");
const clearHistoryBtn = document.getElementById("clearHistory");
const goalInput = document.getElementById("goalInput");
const saveGoalBtn = document.getElementById("saveGoalBtn");
const goalBarFill = document.getElementById("goalBarFill");
const goalText = document.getElementById("goalText");
const themeToggle = document.getElementById("themeToggle");
const toastContainer =
  document.getElementById("toast") || createToastContainer();

let chart;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let savingsGoal = Number(localStorage.getItem("savingsGoal")) || 0;
let currentTheme = localStorage.getItem("theme") || "light";

if (form) form.addEventListener("submit", addTransaction);
if (historySearch) historySearch.addEventListener("input", updateUI);
if (historyFilter) historyFilter.addEventListener("change", updateUI);
if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);
if (saveGoalBtn) saveGoalBtn.addEventListener("click", saveGoal);
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

applyTheme();
updateGoalProgress();
updateUI();

function addTransaction(e) {
  e.preventDefault();

  if (!text.value || !amount.value || !date.value) {
    showToast("Please fill all fields", "error");
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value.trim(),
    amount: +amount.value,
    date: date.value,
    category: category ? category.value : "Other",
  };

  transactions.push(transaction);
  saveTransactions();

  text.value = "";
  amount.value = "";
  date.value = "";
  if (category) category.value = "Salary";

  showToast("Transaction added", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

function updateUI() {
  if (list) list.innerHTML = "";

  const searchTerm = historySearch
    ? historySearch.value.trim().toLowerCase()
    : "";
  const selectedFilter = historyFilter ? historyFilter.value : "all";

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.text.toLowerCase().includes(searchTerm) ||
      (t.category && t.category.toLowerCase().includes(searchTerm));

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "income" && t.amount > 0) ||
      (selectedFilter === "expense" && t.amount < 0);

    return matchesSearch && matchesFilter;
  });

  let income = 0;
  let expense = 0;

  filteredTransactions.forEach((t) => {
    if (list) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${t.text}</strong><br>
          <small>${t.date} • ${t.category}</small>
        </div>
        <div class="item-actions">
          <span>KES ${Math.abs(t.amount)}</span>
          <button onclick="editTransaction(${t.id})" class="edit-btn" type="button">Edit</button>
          <button onclick="deleteTransaction(${t.id})" type="button">Delete</button>
        </div>
      `;

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
  if (recentList) renderRecentActivity();
  if (goalBarFill) updateGoalProgress();
}

function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  updateUI();
  showToast("Transaction deleted", "success");
}

function editTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  const newText = prompt("Edit description:", transaction.text);
  if (newText === null) return;

  const newAmount = prompt(
    "Edit amount (+income, -expense):",
    transaction.amount,
  );
  if (newAmount === null || isNaN(newAmount) || newAmount === "") {
    showToast("Invalid amount", "error");
    return;
  }

  const newCategory = prompt("Edit category:", transaction.category || "Other");
  if (newCategory === null) return;

  transaction.text = newText.trim() || transaction.text;
  transaction.amount = +newAmount;
  transaction.category = newCategory.trim() || transaction.category;

  saveTransactions();
  updateUI();
  showToast("Transaction updated", "success");
}

function updateChart(income, expense) {
  if (!chartCanvas) return;

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
          backgroundColor: ["#34d399", "#f87171"],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function renderRecentActivity() {
  if (!recentList) return;

  recentList.innerHTML = "";
  const recent = transactions
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (!recent.length) {
    recentList.innerHTML = "<li>No recent transactions yet.</li>";
    return;
  }

  recent.forEach((t) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${t.text}</strong>
      <span>${t.date} • ${t.category} • KES ${Math.abs(t.amount)}</span>
    `;
    recentList.appendChild(item);
  });
}

function saveGoal() {
  if (!goalInput || !goalInput.value || Number(goalInput.value) <= 0) {
    showToast("Enter a valid goal amount", "error");
    return;
  }

  savingsGoal = +goalInput.value;
  localStorage.setItem("savingsGoal", savingsGoal);
  updateGoalProgress();
  showToast("Savings goal saved", "success");
}

function updateGoalProgress() {
  if (!goalBarFill || !goalText) return;
  if (goalInput) goalInput.value = savingsGoal || "";

  const totalIncome = transactions.reduce(
    (sum, t) => sum + (t.amount > 0 ? t.amount : 0),
    0,
  );
  if (!savingsGoal) {
    goalBarFill.style.width = "0%";
    goalText.innerText = "No goal set yet.";
    return;
  }

  const progress = Math.min(100, Math.round((totalIncome / savingsGoal) * 100));
  goalBarFill.style.width = `${progress}%`;
  goalText.innerText = `Income is ${progress}% of your KES ${savingsGoal} goal.`;
}

function clearHistory() {
  if (!confirm("Clear all transactions? This cannot be undone.")) return;

  transactions = [];
  saveTransactions();
  updateUI();
  showToast("All transactions cleared", "success");
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", currentTheme);
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle("dark-mode", currentTheme === "dark");
  if (themeToggle) {
    themeToggle.textContent =
      currentTheme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function createToastContainer() {
  const element = document.createElement("div");
  element.id = "toast";
  element.className = "toast-container";
  document.body.appendChild(element);
  return element;
}

function showToast(message, type = "info") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3000);
}

window.deleteTransaction = deleteTransaction;
window.editTransaction = editTransaction;
