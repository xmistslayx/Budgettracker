import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import "./managetransaction.css";

// Currency formatter function - same as in the Home component
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const ManageTransactions = () => {
  const { user, loading } = useAuth();

  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchTransactions = async () => {
    if (!user || loading) return;
    const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, loading]);

  const isValidDate = (date) => {
    const parts = date.split("/");
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    return true;
  };

  const handleSaveTransaction = async () => {
    if (!user) {
      alert("Please log in to save a transaction.");
      return;
    }
    if (!category || !name || !cost || !date || !type) {
      alert("Please fill out all required fields.");
      return;
    }

    if (name.length > 30) {
      alert("Transaction name must be 30 characters or less.");
      return;
    }

    const amount = parseFloat(cost);
    if (isNaN(amount) || amount < 0 || amount > 1000000) {
      alert("Please enter a valid cost between 0 and 1,000,000.");
      return;
    }

    if (!isValidDate(date)) {
      alert("Date must be in format DD/MM/YYYY with month between 1-12.");
      return;
    }

    try {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        category,
        name,
        cost: amount,
        date,
        description,
        type,
        timestamp: new Date(),
      });
      alert("Transaction saved!");
      handleReset();
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction.");
    }
  };

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    if (!isValidDate(date)) {
      alert("Date must be in format DD/MM/YYYY with month between 1-12.");
      return;
    }

    if (name.length > 30) {
      alert("Transaction name must be 30 characters or less.");
      return;
    }

    const amount = parseFloat(cost);
    if (isNaN(amount) || amount < 0 || amount > 1000000) {
      alert("Please enter a valid cost between 0 and 1,000,000.");
      return;
    }

    try {
      const ref = doc(db, "transactions", selectedTransaction.id);
      await updateDoc(ref, {
        category,
        name,
        cost: amount,
        date,
        description,
        type,
      });
      alert("Transaction updated!");
      handleReset();
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction.");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "transactions", selectedTransaction.id));
      alert("Transaction deleted.");
      handleReset();
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    }
  };

  const handleReset = () => {
    setCategory("");
    setName("");
    setCost("");
    setDate("");
    setDescription("");
    setType("expense");
    setSelectedTransaction(null);
  };

  const handleSelect = (tx) => {
    setSelectedTransaction(tx);
    setCategory(tx.category || "");
    setName(tx.name || "");
    setCost(tx.cost || "");
    setDate(tx.date || "");
    setDescription(tx.description || "");
    setType(tx.type || "expense");
  };

  return (
    <div className="transactions-container">
      <Header />
      <h1 className="page-title">Add or Remove transactions</h1>

      <div className="content">
        <div className="add-transactions">
          <h2>Add Transactions</h2>

          <select
            className="transaction-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category Of Transaction</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="bills">Bills</option>
            <option value="entertainment">Entertainment</option>
            <option value="income">Income</option>
          </select>

          <input
            type="text"
            placeholder="Name Of Transaction (max 30 chars)"
            className="transaction-input"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Cost"
            className="transaction-input"
            value={cost}
            onChange={(e) => {
              const val = e.target.value;
              if (!val || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                setCost(val);
              }
            }}
            min="0"
            max="1000000"
          />

          <input
            type="text"
            placeholder="Date Of Transaction (DD/MM/YYYY)"
            className="transaction-input"
            value={date}
            onChange={(e) => {
              let input = e.target.value.replace(/[^\d]/g, "");
              if (input.length > 2) input = input.slice(0, 2) + "/" + input.slice(2);
              if (input.length > 5) input = input.slice(0, 5) + "/" + input.slice(5, 9);
              setDate(input.slice(0, 10));
            }}
          />

          <input
            type="text"
            placeholder="Description Of Transaction"
            className="transaction-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="transaction-input">
            <label>
              <input
                type="radio"
                value="income"
                checked={type === "income"}
                onChange={(e) => setType(e.target.value)}
              />
              Income
            </label>
            <label style={{ marginLeft: "20px" }}>
              <input
                type="radio"
                value="expense"
                checked={type === "expense"}
                onChange={(e) => setType(e.target.value)}
              />
              Expense
            </label>
          </div>

          <div className="buttons">
            <button className="reset-button" onClick={handleReset}>
              Reset Transaction
            </button>
            <button className="save-button" onClick={handleSaveTransaction}>
              Save Transaction
            </button>
          </div>
        </div>

        <div className="past-transactions">
          <h2>Past Transactions</h2>
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p style={{ color: "white", padding: "10px" }}>No transactions found.</p>
            ) : (
              <ul style={{ color: "white", listStyle: "none", padding: "10px" }}>
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    style={{
                      marginBottom: "8px",
                      cursor: "pointer",
                      backgroundColor: selectedTransaction?.id === tx.id ? "#444" : "transparent",
                      padding: "5px",
                      borderRadius: "5px"
                    }}
                    onClick={() => handleSelect(tx)}
                  >
                    <strong>{tx.date}</strong> - {tx.name} - {formatCurrency(Number(tx.cost))} (
                    <span style={{ color: tx.type === "income" ? "lightgreen" : "lightcoral" }}>
                      {tx.type}
                    </span>
                    )
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="buttons">
            <button
              className="edit-button"
              onClick={selectedTransaction ? handleUpdateTransaction : undefined}
              disabled={!selectedTransaction}
            >
              {selectedTransaction ? "Update Transaction" : "Edit Transaction"}
            </button>
            <button
              className="remove-button"
              onClick={handleDeleteTransaction}
              disabled={!selectedTransaction}
            >
              Remove Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTransactions;