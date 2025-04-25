import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./pages/homepage.css";

import Home from "./pages/homepage";
import Login from "./pages/login";
import TransactionHistory from "./pages/transactionhistory";
import ManageTransactions from "./pages/manageTransactions";
import SetEditBudget from "./pages/seteditbudget";

import { AuthProvider, ProtectedRoute } from "./context/authcontext"; // ✅ right here

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactionhistory"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managetransactions"
            element={
              <ProtectedRoute>
                <ManageTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seteditbudget"
            element={
              <ProtectedRoute>
                <SetEditBudget />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
