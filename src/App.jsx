import React, { useState } from "react";
import "./App.css";



function App() {
  const [formType, setFormType] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");


  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showUserInfo, setShowUserInfo] = useState(false);

  const showForm = (type) => {
    setFormType(type);
   
    setCodeSent(false);
    setCodeVerified(false);
    setVerificationCode("");
    setSignupFullName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setLoginEmail("");
    setLoginPassword("");
  };


  const sendVerificationCode = async () => {
    if (!signupEmail) {
      alert("Please enter your email");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail }),
      });
      if (res.ok) {
        alert("Verification code sent to your email");
        setCodeSent(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send code");
      }
    } catch {
      alert("Error sending verification code");
    }
  };

  
  const verifyCode = async () => {
    if (!verificationCode) {
      alert("Please enter verification code");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, code: verificationCode }),
      });
      if (res.ok) {
        alert("Email verified successfully");
        setCodeVerified(true);
      } else {
        const data = await res.json();
        alert(data.message || "Verification failed");
      }
    } catch {
      alert("Error verifying code");
    }
  };

  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/signup-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });
      if (res.ok) {
        alert("Signup complete! Please login.");
        setCodeSent(false);
        setCodeVerified(false);
        setVerificationCode("");
        setSignupFullName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setFormType("login");
      } else {
        const data = await res.json();
        alert(data.message || "Signup failed");
      }
    } catch {
      alert("Error during signup");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (res.ok) {
        alert("Login successful!");
        setShowUserInfo(true);
  
      } else {
        const data = await res.json();
        alert(data.message || "Login failed");
      }
    } catch {
      alert("Error during login");
    }
  };

  return (
    <>
    
      <div className="main">
        <div className="navbar">
          <div className="icon">
            <h2 className="logo">e-Yatayat</h2>
          </div>

          <div className="menu">
            <ul>
              <li><a href="#about">ABOUT</a></li>
              <li><a href="#service">SERVICE</a></li>
              <li><a href="#feedback">FEEDBACK</a></li>
              <li><a href="#contact">CONTACT US</a></li>
            </ul>
          </div>

          <div className="search">
            <input className="srch" type="search" placeholder="Type To text" />
            <button className="btn">Find</button>
          </div>
        </div>

        <div className="content">
          <h1>
            Web Helper & <br />
            Finder
          </h1>
          <p className="par">
            We are here for making digital society
            <br />
            Get connected and make the most out of your experience!
          </p>

          <div>
            <button className="cn" onClick={() => showForm("signup")}>
              Be Family
            </button>
          </div>

          <div className="form-container">
            {/* Login Form */}
            {formType === "login" && (
              <form className="form" onSubmit={handleLoginSubmit}>
                <h2>Login Here</h2>
                <input
                  type="email"
                  placeholder="Enter Email Here"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Enter Password Here"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button className="btnn" type="submit">Login</button>
                <p className="link">
                  Don't have an account?<br />
                  <a href="#signup" onClick={() => showForm("signup")}>Sign up</a> here
                </p>
              </form>
            )}

            {/* Signup Form */}
            {formType === "signup" && (
              <form className="form" onSubmit={handleSignupSubmit}>
                <h2>Sign Up Here</h2>

                <input
                  type="text"
                  placeholder="Enter Full Name"
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Enter Email Here"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />

                {/* Send verification code */}
                {!codeSent && (
                  <button
                    type="button"
                    className="btnn"
                    onClick={sendVerificationCode}
                  >
                    Send Verification Code
                  </button>
                )}

                {/* Verify code section */}
                {codeSent && !codeVerified && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Verification Code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btnn"
                      onClick={verifyCode}
                    >
                      Verify Code
                    </button>
                  </>
                )}

                {/* Password fields (only after verification) */}
                {codeVerified && (
                  <>
                    <input
                      type="password"
                      placeholder="Enter Password Here"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                    <button className="btnn" type="submit">Sign Up</button>
                  </>
                )}

                <p className="link">
                  Already have an account?<br />
                  <a href="#login" onClick={() => showForm("login")}>Login</a> here
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div id="feedback" className="feedback-section">
        <h2 className="feedback-title">What Our Users Say</h2>
        <div className="feedback-container">
          <div className="feedback-card">
            <div className="user-info">
              <img src="/src/assets/images/img1.png" alt="User" />
              <span className="username">Aayush Bista</span>
            </div>
            <p>🌟 “Nice work” 📱</p>
          </div>

          <div className="feedback-card">
            <div className="user-info">
              <img src="/src/assets/images/img2.png" alt="User" />
              <span className="username">Prerana Thapa</span>
            </div>
            <p>💬 “niceeeeeee isssssssssws” 🤗📚</p>
          </div>

          <div className="feedback-card">
            <div className="user-info">
              <img src="/src/assets/images/img3.png" alt="User" />
              <span className="username">Anish K.C.</span>
            </div>
            <p>🚀 “ok handling” 👍</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="contact-section">
        <h2 className="contact-title">Contact Us</h2>
        <div className="contact-container">
          <div className="contact-card">
            <h3>📍 Address</h3>
            <p>Dhulikhel, Nepal</p>
          </div>
          <div className="contact-card">
            <h3>📞 Phone</h3>
            <p>+977-9812345678</p>
          </div>
          <div className="contact-card">
            <h3>📧 Email</h3>
            <p>support@e-yatayat.com</p>
          </div>
        </div>
      </div>

      {showUserInfo && (
        <UserInfoForm onClose={() => setShowUserInfo(false)} />
      )}
    </>
  );
}

export default App;
