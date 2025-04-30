import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authcontext";
import Header from "../components/header";
import "./transactionhistory.css";

// Currency formatter function - same as in other components
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const TransactionHistory = () => {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || loading) return;

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setTransactions(data);
      setFiltered(data);
    };

    fetchTransactions();
  }, [user, loading]);

  const handleSearch = () => {
    const filteredData = transactions.filter((tx) => {
      const nameMatch = tx.name.toLowerCase().includes(searchName.toLowerCase());
      const categoryMatch = category === "" || tx.category === category;

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const txDate = new Date(tx.date.split("/").reverse().join("-"));

      const inDateRange =
        (!start || txDate >= start) &&
        (!end || txDate <= end);

      return nameMatch && categoryMatch && inDateRange;
    });

    setFiltered(filteredData);
  };

  return (
    <div className="transaction-container">
      <Header />

      <h1 className="page-title">Transaction History</h1>

      <div className="content">
        <div className="transaction-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name Of Transaction</th>
                <th>Price</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.date}</td>
                    <td>{tx.name}</td>
                    <td>{formatCurrency(Number(tx.cost))}</td>
                    <td className={tx.type}>
                      {tx.type === "income" ? "Income" : "Expense"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="filter-section">
          <h2 className="filter-title">Filter</h2>

          <label className="filter-label">
            Start Date
            <input
              type="date"
              value={startDate}
              className="filter-input"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="filter-label">
            End Date
            <input
              type="date"
              value={endDate}
              className="filter-input"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <label className="filter-label">
            Search by Name
            <input
              type="text"
              placeholder="Transaction name"
              value={searchName}
              className="filter-input"
              onChange={(e) => setSearchName(e.target.value)}
            />
          </label>

          <label className="filter-label">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-input"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="bills">Bills</option>
              <option value="entertainment">Entertainment</option>
              <option value="income">Income</option>
            </select>
          </label>

          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;