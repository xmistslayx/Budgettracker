import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // ✅ Password length check before Firebase request
    if (password.length < 6 || password.length > 12) {
      setError("Password must be between 6 and 12 characters.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        console.log("Registering:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update the user profile with the name if provided
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
          console.log("Name added to profile:", name);
        }
        
        // Show success message for new accounts
        setSuccessMessage(`Account created successfully! Welcome, ${name || email}!`);
        
        // Navigate to home page after 3 seconds
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      } else {
        console.log("Logging in:", email);
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/home");
      }
    } catch (err) {
      console.error("Auth error:", err.code, err.message);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      
      if (result.user && !result.user.metadata.creationTime) {
        // This is a new Google account signup
        setSuccessMessage(`Account created successfully! Welcome, ${result.user.displayName || result.user.email}!`);
        
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      } else {
        // This is a returning Google user
        navigate("/home");
      }
    } catch (err) {
      console.error("Google login error:", err.code, err.message);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // If showing success message, render that instead of the form
  if (successMessage) {
    return (
      <div className="login-container">
        <div className="success-message-container">
          <div className="success-message">
            <h2>Success!</h2>
            <p>{successMessage}</p>
            <div className="loading-spinner"></div>
            <p className="redirect-text">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Register" : "Log In"}</h2>

      <div className="login-box">
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-input"
            />
          )}
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
              minLength={6}
              maxLength={12}
              className="password-input"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="button-wrapper">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Please wait..." : isRegistering ? "Create Account" : "Log In"}
            </button>
          </div>
        </form>

        <div className="button-wrapper">
          <button onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? "Please wait..." : "Continue with Google"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link" style={{ pointerEvents: isLoading ? "none" : "auto" }}>
          {isRegistering
            ? "Already have an account? Log in"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
};

export default Login;