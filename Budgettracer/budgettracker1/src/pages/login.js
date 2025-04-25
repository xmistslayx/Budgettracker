import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        console.log("Registering:", email);
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        console.log("Logging in:", email);
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/home");
    } catch (err) {
      console.error("Auth error:", err.code, err.message);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      console.error("Google login error:", err.code, err.message);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Register" : "Log In"}</h2>

      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="button-wrapper">
            <button type="submit">
              {isRegistering ? "Create Account" : "Log In"}
            </button>
          </div>
        </form>

        <div className="button-wrapper">
          <button onClick={handleGoogleLogin}>Continue with Google</button>
        </div>

        {error && <p className="error">{error}</p>}

        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
          {isRegistering
            ? "Already have an account? Log in"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
};

export default Login;
