import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authcontext";
import Header from "../components/header"; // ✅ header included
import "./seteditbudget.css";

const SetEditBudget = () => {
  const { user, loading } = useAuth();
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [newBudget, setNewBudget] = useState("");

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
    if (!isNaN(amount)) {
      try {
        const docRef = doc(db, "budgets", user.uid);
        await setDoc(docRef, { target: amount });
        setBudgetTarget(amount);
        setNewBudget("");
      } catch (error) {
        console.error("Error saving budget:", error);
        alert("Failed to save budget.");
      }
    } else {
      alert("Please enter a valid number.");
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
            <span>£{currentAmount.toFixed(2)}</span>
          </div>

          <div className="budget-target">
            <p>Current Budget Target</p>
            <span>£{budgetTarget.toFixed(2)}</span>
          </div>

          <div className="budget-input">
            <input
              type="number"
              placeholder="New Budget"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
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
