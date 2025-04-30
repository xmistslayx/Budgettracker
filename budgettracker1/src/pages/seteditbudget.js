import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import "./seteditbudget.css";

// Currency formatter function - same as in other components
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const SetEditBudget = () => {
  const { user, loading } = useAuth();
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [newBudget, setNewBudget] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!user || loading) return;

      const docRef = doc(db, "budgets", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.target !== undefined) {
          setBudgetTarget(data.target);
        }
      }
    };

    const fetchCurrentAmount = async () => {
      if (!user) return;

      const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => doc.data());
      const total = transactions.reduce((sum, tx) => {
        return tx.type === "income"
          ? sum + Number(tx.cost)
          : sum - Number(tx.cost);
      }, 0);
      setCurrentAmount(total);
    };

    fetchBudget();
    fetchCurrentAmount();
  }, [user, loading]);

  const handleSaveBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount)) {
      alert("Please enter a valid number for the budget.");
      return;
    }
    if (amount < 0) {
      alert("Budget cannot be negative.");
      return;
    }
    if (amount > 1000000) {
      alert("Budget cannot be greater than 1,000,000.");
      return;
    }

    try {
      const docRef = doc(db, "budgets", user.uid);
      await setDoc(docRef, { target: amount });
      setBudgetTarget(amount);
      setNewBudget("");
      alert("Budget target updated successfully!");
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget. Please try again later.");
    }
  };

  // Get display value for the input
  const getDisplayValue = () => {
    if (isEditing) {
      return newBudget;
    } else if (newBudget === "") {
      return "";
    } else {
      const value = parseFloat(newBudget);
      return !isNaN(value) ? formatCurrency(value) : "";
    }
  };

  return (
    <div className="budget-container">
      <Header />
      <h1 className="page-title">Set/Edit budget</h1>

      <div className="content">
        <div className="current-budget">
          <h2>Current Budget</h2>

          <div className="budget-overview-seteditbudget">
            <p>Budget Overview</p>
            <span>{formatCurrency(currentAmount)}</span>
          </div>

          <div className="budget-target">
            <p>Current Budget Target</p>
            <span>{formatCurrency(budgetTarget)}</span>
          </div>

          <div className="budget-input">
            <input
              type={isEditing ? "number" : "text"}
              placeholder="New Budget"
              value={getDisplayValue()}
              min="0"
              max="1000000"
              step="0.01"
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              onChange={(e) => {
                const val = e.target.value;
                if (!val || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                  setNewBudget(val);
                }
              }}
            />
            <button className="save-button" onClick={handleSaveBudget}>
              Save New Budget Target
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetEditBudget;