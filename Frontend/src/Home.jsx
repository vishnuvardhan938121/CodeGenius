import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios'; // 1. Import axios

// 2. Define the base URL for the backend server running on port 4000
const API_BASE_URL = 'http://localhost:4000';

// Helper function for button styles
const getButtonStyle = (baseStyle, isCancel = false) => ({
  ...baseStyle,
  backgroundColor: isCancel ? "#ff4d4f" : "#1890ff",
  color: "white",
  // Simple hover simulation for inline styles
  ":hover": {
    opacity: 0.85,
  },
});

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null); 
  const [hoveredLang, setHoveredLang] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.elements[0].value;
    const password = e.target.elements[1].value;

    try {
      // --- BACKEND INTEGRATION START: LOGIN (Using Axios) ---
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
      });

      // Axios wraps the response body in the 'data' property
      const data = response.data; 

      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("authToken", data.token); // Store token
        localStorage.setItem("userId", data.userId); // Store user ID
        setIsLoggedIn(true);
        setShowLogin(false);
        // Display success message using custom modal if alert() wasn't restricted
        console.log(data.message);
        navigate("/review"); // Redirect to App.jsx route
      }
      // --- BACKEND INTEGRATION END: LOGIN ---
      
    } catch (error) {
      console.error("Login API Error:", error);
      
      // Handle server-side errors (401, 400, 500)
      const message = error.response 
        ? error.response.data.message // Message from the backend (e.g., 'Invalid credentials.')
        : "A network error occurred during login. Is the server running on port 4000?";
        
      // Use console.warn/log instead of alert
      console.warn(message); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;

    try {
      // --- BACKEND INTEGRATION START: REGISTER (Using Axios) ---
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        console.log("Registration successful! Please log in with your new credentials.");
        setShowRegister(false);
        setShowLogin(true); // Redirects user to the Login modal
      }
      // --- BACKEND INTEGRATION END: REGISTER ---

    } catch (error) {
      console.error("Registration API Error:", error);
      
      // Handle server-side errors (e.g., 409 Conflict)
      const message = error.response 
        ? error.response.data.message 
        : "A network error occurred during registration. Please try again.";

      // Use console.warn/log instead of alert
      console.warn(`Registration failed: ${message}`); 
    }
  };

  // --- Render Sections ---

  const renderNavButtons = () => {
    const navBtnStyle = getButtonStyle(styles.navBtn);
    const logoutBtnStyle = getButtonStyle(styles.navBtn, true);

    if (isLoggedIn) {
      return (
        <button
          style={logoutBtnStyle}
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            setIsLoggedIn(false);
            navigate("/"); // Navigate home on logout
          }}
        >
          Logout
        </button>
      );
    }
    return (
      <>
        <button style={navBtnStyle} onClick={() => setShowLogin(true)}>
          Login
        </button>
        <button style={navBtnStyle} onClick={() => setShowRegister(true)}>
          Register
        </button>
      </>
    );
  };

  const FeatureCard = ({ id, icon, title, description }) => {
    const cardStyle = {
      ...styles.card,
      ...(hoveredCard === id ? styles.cardHover : {}),
    };

    return (
      <div
        id={`card-${id}`}
        style={cardStyle}
        onMouseEnter={() => setHoveredCard(id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={styles.cardIcon}>{icon}</div>
        <h3 style={{marginTop: '10px'}}>{title}</h3>
        <p style={{fontSize: '14px', color: '#555'}}>{description}</p>
      </div>
    );
  };

  const AboutUsSection = () => (
    <section style={{ ...styles.section, background: "#fff" }}>
      <h2 style={styles.heading}>Our Mission: Code Excellence</h2>
      <div style={styles.separator} />
      <p style={{ ...styles.subHeading, maxWidth: "800px", margin: "0 auto" }}>
        CodeGenius was built by developers, for developers. Our goal is to make
        code review **fast, painless, and highly effective** using the latest in
        AI technology. We help teams and individual coders ship reliable,
        bug-free software faster than ever before.
      </p>
    </section>
  );

  const HowItWorksSection = () => (
    <section style={{ ...styles.section, background: "#f8f9fa" }}>
      <h2 style={styles.heading}>How CodeGenius Works</h2>
      <div style={styles.separator} />
      <p style={styles.subHeading}>
        Get your code reviewed in three simple steps.
      </p>
      <div style={{...styles.cardGrid, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"}}>
        <div style={styles.processStep}>
          <div style={{...styles.stepNumber, backgroundColor: '#2196F3'}}>1</div>
          <h3 style={{color: '#2196F3'}}>Upload Code</h3>
          <p>Paste your snippet or upload a file. We support **20+ languages**.</p>
        </div>
        <div style={styles.processStep}>
          <div style={{...styles.stepNumber, backgroundColor: '#FF9800'}}>2</div>
          <h3 style={{color: '#FF9800'}}>AI Analysis</h3>
          <p>Our model scans for bugs, security issues, and style guide violations.</p>
        </div>
        <div style={styles.processStep}>
          <div style={{...styles.stepNumber, backgroundColor: '#4CAF50'}}>3</div>
          <h3 style={{color: '#4CAF50'}}>Fix & Ship</h3>
          <p>Receive an instant report with explanations and **suggested fixes**.</p>
        </div>
      </div>
      <button 
        style={{...getButtonStyle(styles.submitBtn, false), marginTop: '40px', width: '250px'}} 
        // FIX: The button now correctly shows the Register modal if not logged in.
        onClick={() => isLoggedIn ? navigate("/review") : setShowRegister(true)}
      >
        {isLoggedIn ? "Start Your Review Now" : "Sign Up to Get Started"}
      </button>
    </section>
  );

  const SupportedTechSection = () => {
    const languages = [
      { name: 'JavaScript', icon: 'JS' },
      { name: 'Python', icon: 'Py' },
      { name: 'Java', icon: 'Jv' },
      { name: 'C++', icon: 'C++' },
      { name: 'Go', icon: 'Go' },
      { name: 'Swift', icon: 'Sw' },
      { name: 'PHP', icon: 'PHP' },
      { name: 'TypeScript', icon: 'TS' },
      { name: 'C#', icon: 'C#' },
      { name: 'Ruby', icon: 'Rb' },
      { name: 'Kotlin', icon: 'Kt' },
      { name: 'Rust', icon: 'Rs' },
      { name: 'Dart', icon: 'Dt' },
      { name: 'SQL', icon: 'DB' },
      { name: 'Shell', icon: 'Sh' },
      { name: 'HTML/CSS', icon: 'Web' },
    ];

    return (
      <section style={{ ...styles.section, background: "#fff" }}>
        <h2 style={styles.heading}>Supported Languages & Tech Stack</h2>
        <div style={styles.separator} />
        <p style={styles.subHeading}>
          Powered by Google's Gemini Flash, we cover **over 16 major languages** for comprehensive analysis.
        </p>
        <div style={styles.langGrid}>
          {languages.map((lang) => (
            <div
              key={lang.name}
              style={{
                ...styles.langItem,
                ...(hoveredLang === lang.name ? styles.langItemHover : {})
              }}
              onMouseEnter={() => setHoveredLang(lang.name)}
              onMouseLeave={() => setHoveredLang(null)}
            >
              <span style={styles.langIcon}>{lang.icon}</span>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{lang.name}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };


  // --- Main Render ---

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>⚡ CodeGenius</h1>
        <div>{renderNavButtons()}</div>
      </nav>

      {/* Hero Section */}
      <section style={{...styles.hero, background: '#e6f7ff', borderBottom: '5px solid #1890ff'}}>
        <h2 style={{...styles.heading, fontSize: '42px', color: '#1890ff'}}>Code Smarter, Not Harder.</h2>
        <p style={{...styles.subHeading, fontSize: '24px', color: '#444', marginBottom: '40px'}}>
          The future of code review is here. **Instant, AI-powered insights** for clean, secure code.
        </p>

        {/* Feature Cards */}
        <div style={styles.cardGrid}>
          <FeatureCard id="upload" icon="📂" title="Secure Upload" description="Your code is encrypted and processed on secure servers." />
          <FeatureCard id="review" icon="🧠" title="Deep Analysis" description="Go beyond linters: discover logic flaws and security vulnerabilities." />
          <FeatureCard id="fix" icon="💡" title="AI Suggestions" description="Get precise, executable recommendations for fixing every issue." />
          <FeatureCard id="bugfree" icon="🏆" title="Quality Guarantee" description="Ship faster and reduce technical debt with confidence." />
        </div>
      </section>

      {/* About Us Section */}
      <AboutUsSection />
      
      {/* Supported Tech Section */}
      <SupportedTechSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeGenius. All rights reserved. | <a href="#" style={{color: '#aaa', textDecoration: 'none'}}>Privacy Policy</a>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Log In</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Username" style={styles.input} required />
              <input type="password" placeholder="Password" style={styles.input} required />
              <button type="submit" style={getButtonStyle(styles.submitBtn)}>Log In</button>
              <button
                type="button"
                style={getButtonStyle(styles.cancelBtn, true)}
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Create Account</h2>
            <form onSubmit={handleRegister}>
              <input type="text" placeholder="Username" style={styles.input} required />
              <input type="email" placeholder="Email" style={styles.input} required />
              <input type="password" placeholder="Password" style={styles.input} required />
              <button type="submit" style={getButtonStyle(styles.submitBtn)}>Sign Up</button>
              <button
                type="button"
                style={getButtonStyle(styles.cancelBtn, true)}
                onClick={() => setShowRegister(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#262626",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    backgroundColor: "#262626",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logo: { margin: 0, fontSize: "24px" },
  navBtn: {
    marginLeft: "15px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  hero: {
    flex: 0, 
    padding: "80px 40px 60px",
    textAlign: "center",
  },
  section: {
    padding: "80px 40px",
    textAlign: "center",
  },
  heading: { fontSize: "36px", marginBottom: "15px", color: '#262626' },
  subHeading: { fontSize: "18px", marginBottom: "40px", color: "#595959" },
  separator: {
    width: '60px',
    height: '4px',
    backgroundColor: '#1890ff',
    margin: '0 auto 40px',
    borderRadius: '2px',
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "30px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    minHeight: '180px', 
    textAlign: 'center',
    border: '1px solid #f0f0f0',
  },
  cardIcon: {
    fontSize: '36px',
    lineHeight: 1,
  },
  cardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 12px 25px rgba(0,0,0,0.25)",
    borderColor: '#1890ff',
  },
  processStep: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  langGrid: {
    display: 'grid',
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  langItem: {
    padding: '20px 10px',
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'default',
    background: '#fcfcfc',
  },
  langItemHover: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 8px rgba(24, 144, 255, 0.2)',
  },
  langIcon: {
    fontSize: '24px',
    lineHeight: 1,
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700',
    color: '#1890ff',
  },
  footer: {
    background: "#262626",
    color: "#aaa",
    textAlign: "center",
    padding: "20px 0",
    fontSize: "14px",
    marginTop: 'auto', 
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
    width: "350px",
    textAlign: "center",
    zIndex: 1001,
  },
  input: {
    display: "block",
    width: "100%",
    margin: "12px 0",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #d9d9d9",
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  cancelBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};

export default Home;
