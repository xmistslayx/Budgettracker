import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import "./homepage.css";
import { FaHistory, FaEdit, FaExchangeAlt } from "react-icons/fa";

// Currency formatter function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchBudget = async () => {
      if (!user) return;

      const docRef = doc(db, "budgets", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.target !== undefined) {
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

    // Get user's display name if available
    if (user) {
      // If user has a display name, use it; otherwise keep the default "User"
      if (user.displayName) {
        setUserName(user.displayName);
      }
      
      // Alternatively, we could try to fetch the name from Firestore if you're storing it there
      // This is optional and depends on your app's architecture
      /*
      const fetchUserName = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().name) {
          setUserName(userDocSnap.data().name);
        }
      };
      fetchUserName();
      */
    }

    fetchBudget();
    fetchCurrentAmount();
  }, [user]);

  useEffect(() => {
    if (budgetTarget > 0) {
      const percent = Math.min((currentAmount / budgetTarget) * 100, 100);
      setPercentage(percent);
    } else {
      setPercentage(0);
    }
  }, [currentAmount, budgetTarget]);

  return (
    <>
      <Header />
      <div className="home-container">
        <h1 className="welcome-text">Welcome, {userName}</h1>

        <div className="budget-overview">
          <p className="overview-title">Budget Overview</p>

          <div className="budget-details">
            <div className="budget-block">
              <span>Current Amount</span>
              <span className="budget-value current-amount">{formatCurrency(currentAmount)}</span>
            </div>

            <div className="percentage-bar-container">
              <div className="percentage-bar" style={{ width: `${percentage}%` }}></div>
              <div className="percentage-label">{percentage.toFixed(1)}%</div>
            </div>

            <div className="budget-block">
              <span>Target</span>
              <span className="budget-value budget-amount">{formatCurrency(budgetTarget)}</span>
            </div>
          </div>
        </div>

        <div className="actions-container">
          <div className="action-item" onClick={() => navigate("/transactionhistory")}>
            <FaHistory className="action-icon" />
            <p>View Transaction History</p>
          </div>

          <div className="action-item" onClick={() => navigate("/managetransactions")}>
            <FaExchangeAlt className="action-icon" />
            <p>Manage Transactions</p>
          </div>

          <div className="action-item" onClick={() => navigate("/seteditbudget")}>
            <FaEdit className="action-icon" />
            <p>Set/Edit Budget</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;