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
import Header from "../components/header"; // ✅ import header
import "./managetransaction.css";

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

  const handleSaveTransaction = async () => {
    if (!user) {
      alert("Please log in to save a transaction.");
      return;
    }
    if (!category || !name || !cost || !date || !type) {
      alert("Please fill out all required fields.");
      return;
    }

    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(date)) {
      alert("Date must be in format DD/MM/YYYY");
      return;
    }

    try {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        category,
        name,
        cost: parseFloat(cost),
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
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(date)) {
      alert("Date must be in format DD/MM/YYYY");
      return;
    }

    try {
      const ref = doc(db, "transactions", selectedTransaction.id);
      await updateDoc(ref, {
        category,
        name,
        cost: parseFloat(cost),
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
      <Header /> {/* ✅ fixed header */}
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
            placeholder="Name Of Transaction"
            className="transaction-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Cost"
            className="transaction-input"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
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
                    <strong>{tx.date}</strong> - {tx.name} - £{Number(tx.cost).toFixed(2)} (
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
