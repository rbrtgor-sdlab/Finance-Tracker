# Finance Tracker

A simple personal finance tracker built with HTML, CSS, and JavaScript.

## What it does

- Displays current balance, total income, and total expenses.
- Lets users add new transactions with description, date, and amount.
- Stores transactions in browser `localStorage` so data persists between sessions.
- Shows a doughnut chart summarizing income vs expenses using Chart.js.
- Provides a transaction history view with delete support.

## Files

- `index.html` — Dashboard view with summary totals and chart.
- `addtransaction.html` — Form to add new income or expense transactions.
- `transactionhistory.html` — List of saved transactions with delete buttons.
- `script.js` — Main application logic, including localStorage storage, calculations, and chart rendering.
- `styles.css` — Styling for the UI and layout.

## Usage

1. Open `index.html` in a browser.
2. Go to `Add Transaction` to add a new record.
3. Enter a description, select a date, and add an amount (`+` for income, `-` for expenses).
4. Submit to save the transaction and update the dashboard.
5. Visit `Transaction History` to review or delete transactions.

## Notes

- This is a static, client-side app and does not require a backend.
- Transactions are saved locally in the browser using `localStorage`.

## Optional local server

If you prefer to run the project on a local development server, use one of these commands from the project folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.
