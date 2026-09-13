# G-Core &bull; Behavioral Banking Loyalty Infrastructure
### Created by Team EMPTY

> *"We don't reward wealth. We reward financial consistency in context."*

Live GitHub Pages Demo: [https://kantimohanthy.github.io/Team-Empty-Sarajevo-Hackathon/](https://kantimohanthy.github.io/Team-Empty-Sarajevo-Hackathon/)

---

## 💡 Problem

Traditional bank loyalty programs reward high spending, credit debt, or large account balances — favoring wealthy customers while ignoring healthy financial habits. Customers who manage tight budgets responsibly get zero portable recognition.

---

## 🔄 How G-Core Works

```
Banking Activity ➔ Financial Context ➔ Behavioral Evaluation ➔ Personalized Goals ➔ Rewards + GP ➔ Portable G-Core Status
```

1. **Banking Activity**: Daily transactions, savings transfers, and bill payments occur at XYZ Bank.
2. **Financial Context**: Context engine distinguishes essential healthcare/emergencies from discretionary spending and filters out self-transfers.
3. **Behavioral Evaluation**: Evaluates 5 core dimensions against personal historical baselines.
4. **Personalized Goals**: Sets dynamic monthly targets based on the customer's own 3-month medians.
5. **Rewards + GP**: Consistent behavior earns GP (G-Core Points) and tier progression.
6. **Portable G-Core Status**: Pseudonymous G-Pass hash preserves status across participating network institutions.

---

## 📊 5 Behavioral Evaluation Dimensions

| Dimension | Weight | Description |
| :--- | :--- | :--- |
| **Budget Discipline** | `30%` | Staying within personalized discretionary spending targets |
| **Payment Consistency** | `25%` | On-time fixed obligations (rent, utilities, loans) |
| **Savings Consistency** | `20%` | Regular monthly savings contributions, regardless of size |
| **Liquidity Resilience** | `15%` | Maintaining positive account buffer without overdraft |
| **Goal Consistency** | `10%` | Multi-month streak adherence and milestone completion |

---

## 🛡️ Context-Aware Intelligence & Privacy

* **Healthcare Protection**: Emergency expenses (e.g., medical or laptop repairs) are classified as **PROTECTED** — preventing unfair penalties on discretionary budget targets.
* **Anti-Gaming Transfer Filter**: Internal self-transfers between personal accounts are detected and excluded from behavioral score padding.
* **Bank-Side Data Boundary**: Raw transaction logs and merchant details **never leave the bank**. G-Core only receives derived monthly evaluation events, G-Pass ID, GP balance, and tier status.

---

## 🤝 Three Stakeholders

1. **Customer**: Gains portable financial reputation, lower borrowing rates, and cross-bank benefits earned through consistency.
2. **Bank**: Reduces customer churn, increases deposit retention, and improves portfolio stability.
3. **Merchant Ecosystem**: Offers exclusive access and perks to high-consistency customers through G-Market.

---

## 🔮 Vision & Roadmap

* **Today**: Behavioral banking loyalty MVP for hackathon demonstration.
* **Next**: Expanded bank + merchant ecosystem partnership integration.
* **Future**: Cross-border portable financial reputation infrastructure across financial institutions.

---

## 💻 Local Development & Build

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production static export
set GITHUB_ACTIONS=true&& npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view locally.
