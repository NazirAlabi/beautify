Here's a specification you can hand almost directly to an AI coding agent.

---

# Beauty Business Finance Tracker

## Overview

A lightweight, mobile-first web application for a small beauty business that records earnings, tracks expenses, stores optional client information, and provides financial summaries.

The application should be fast, simple, and optimized for a single business owner. It should be hosted on Firebase Hosting and use Cloud Firestore as its database.

---

# Core Principles

* Very few clicks to record a transaction
* Mobile-first
* Clean modern UI
* Works well on phones
* No accounting knowledge required
* Automatic calculations
* Editable records
* Cloud synced

---

# Main Pages

## Dashboard

Shows a quick overview.

Cards:

* Today's earnings
* This week's earnings
* This month's earnings
* Total expenses this month
* Estimated profit
* Number of clients served

Charts:

* Earnings by day
* Earnings by month
* Most popular services

Recent transactions list.

---

## New Income

Form fields

Required

* Date (default today)
* Service
* Amount

Optional

* Client
* Phone
* Instagram
* Notes
* Payment method
* Discount

Buttons

* Save
* Save & Add Another

---

## New Expense

Fields

* Date
* Category
* Amount
* Description
* Vendor (optional)

Categories

* Makeup products
* Transportation
* Food
* Equipment
* Utilities
* Miscellaneous

---

## Clients

Shows all clients.

Searchable.

Each client page shows

* Name
* Phone
* Instagram
* Notes
* Total spent
* Number of visits
* Last visit
* Transaction history

Creating a client is optional.

If a transaction has no client, it still saves normally.

---

## Transactions

Complete history.

Filters

* Date range
* Service
* Client
* Payment method

Actions

* Edit
* Delete

---

## Reports

Date selector.

Shows

* Total income
* Total expenses
* Net profit
* Income by service
* Monthly trend
* Best earning day
* Highest paying client

Export

* Excel
* CSV
* PDF (future)

---

# Firestore Structure

```
businesses
    businessId
        clients
        income
        expenses
```

Example

```
businesses
    ramat-beauty
        clients
        income
        expenses
```

---

# Income Document

```
{
    id: auto,

    date: Timestamp,

    serviceId: "soft-glam",

    serviceName: "Soft Glam",

    amount: 150,

    paymentMethod: "Cash",

    discount: 20,

    finalAmount: 130,

    notes: "",

    clientId: "client123",      // optional

    createdAt: Timestamp,

    updatedAt: Timestamp
}
```

---

# Expense Document

```
{
    id: auto,

    date: Timestamp,

    category: "Products",

    amount: 80,

    description: "Foundation",

    vendor: "Melcom",

    notes: "",

    createdAt: Timestamp,

    updatedAt: Timestamp
}
```

---

# Client Document

```
{
    id: auto,

    name: "Ama",

    phone: "024xxxxxxx",

    instagram: "@ama",

    notes: "",

    birthday: null,

    createdAt: Timestamp,

    updatedAt: Timestamp
}
```

Notice there is **no duplicated financial information** here. Total spent, visits, and last visit should be computed from income records (or cached later if performance becomes an issue).

---

# Services Collection

Instead of hardcoding prices.

```
services
```

Document

```
{
    id: "soft-glam",

    name: "Soft Glam",

    defaultPrice: 150,

    active: true,

    color: "#E38AAE"
}
```

Allows changing prices without changing code.

---

# Dashboard Calculations

Income

```
SUM(finalAmount)
```

Expenses

```
SUM(amount)
```

Profit

```
Income - Expenses
```

Clients served

```
COUNT(income documents)
```

Average transaction

```
Income / Number of Transactions
```

---

# Search Flow

When adding income:

Search client

If found

→ attach clientId

If not found

→ continue without client

or

→ create client inline

---

# Nice UX Features

* Auto-save draft while typing
* Date defaults to today
* Remember last payment method
* Service dropdown auto-fills price
* Amount remains editable
* Toast notification after save
* Undo delete
* Dark mode
* Responsive layout

---

# Future Features

* Inventory tracking
* Before/after photos
* Appointment calendar
* WhatsApp reminders
* Customer loyalty
* Multiple staff accounts
* Role-based permissions
* Offline support with Firestore persistence
* AI-generated business insights (e.g., busiest days, top services, revenue trends)

---

# Suggested Tech Stack

* **Frontend:** React + Vite
* **UI:** Tailwind CSS + shadcn/ui
* **Charts:** Recharts
* **Backend:** Firebase (Firestore, Authentication, Hosting)
* **State Management:** React Context or Zustand
* **Forms:** React Hook Form + Zod
* **Date Handling:** date-fns

This architecture keeps the app simple while leaving room to grow without requiring major restructuring.
