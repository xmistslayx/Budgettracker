import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa"; // 👈 import the home icon
import "./header.css";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="header-left" onClick={() => navigate("/home")}>
        <FaHome className="home-icon" /> {/* 👈 render home icon */}
      </div>
      <div className="header-right">
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          navigate("/");
        }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
