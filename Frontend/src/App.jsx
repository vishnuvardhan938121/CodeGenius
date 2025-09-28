import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Markdown from "react-markdown"; 
import axios from 'axios';


function App() {
  const navigate = useNavigate();


  const handleLogout = () => {
  
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    
   
    navigate("/");
  };


  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/"); 
    }
  }, [navigate]);

  // 🔹 Your Tool State
  const [isLoading, setIsLoading] = useState(false);

  const [code, setCode] = useState(`function calculateArea(r) {\n  // Check for non-negative radius\n  if (r < 0) return 0;\n  return Math.PI * r * r;\n}`);
  const [review, setReview] = useState(``);

 
  async function reviewCode() {
    setIsLoading(true);
    setReview(``);

    try {
      //backend endpoint
      const response = await axios.post('http://localhost:4000/ai/get-review', { code });
    
      setReview(response.data);
    } catch (error) {
      console.error("Code review failed:", error);
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? `Server Error: ${error.response.data.message}` 
        : "❌ A network or server error occurred. Ensure your server is running.";
      setReview(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  
  const rightPanelContent = isLoading 
    ? (
      <div style={styles.loadingMessage}>
        <p>🔄 Analyzing the code, wait for a few seconds...</p>
      </div>
    ) 
    : (
      <div style={styles.markdownContainer}>
        {}
        <Markdown>
          {review || "👉 The code review will appear here. The AI will analyze your code for bugs, style, and security."}
        </Markdown>
      </div>
    );
    
 
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#262626',
    color: '#fff',
    height: '60px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  };

  const logoutButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  };


  // 🔹 UI
  return (
    <div style={styles.appContainer}>  
      {}
      <header style={headerStyle}>
        <h1 style={{fontSize: '24px', margin: 0}}>🚀 REVIEW GENIUS</h1>
        <button 
          style={logoutButtonStyle}
          onClick={handleLogout}
         
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9363e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
        >
          Logout
        </button>
      </header>
      <main style={styles.mainContainer}>
        <div style={styles.leftPanel}>
          <textarea
            style={styles.codeEditor}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="// Paste your code here..."
          />
          <button
            onClick={!isLoading ? reviewCode : undefined}
            style={isLoading ? styles.reviewButtonDisabled : styles.reviewButton}
            disabled={isLoading}
          >
            {isLoading ? 'Reviewing...' : 'Review Code'}
          </button>
        </div>
        <div style={styles.rightPanel}>
          {rightPanelContent}
        </div>
      </main>
    </div>
  );
}

const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#f5f5f5',
    },
    mainContainer: {
        flex: 1,
        display: 'flex',
        padding: '20px',
        gap: '20px',
        overflow: 'hidden',
    },
    leftPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: '300px',
    },
    rightPanel: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '20px',
        overflowY: 'auto',
    },
    codeEditor: {
        flex: 1,
        minHeight: '200px',
        backgroundColor: '#1e1e1e', 
        color: '#d4d4d4',
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: '16px',
        padding: '10px',
        border: '1px solid #333',
        borderRadius: '6px',
        resize: 'none',
        marginBottom: '10px',
        boxSizing: 'border-box',
    },
    reviewButton: {
        padding: '12px 20px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '16px',
        transition: 'background-color 0.3s',
        boxShadow: '0 4px 8px rgba(24, 144, 255, 0.3)',
    },
    reviewButtonDisabled: {
        padding: '12px 20px',
        backgroundColor: '#91d5ff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '700',
        fontSize: '16px',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    loadingMessage: {
        textAlign: 'center',
        padding: '50px 20px',
        color: '#1890ff',
        fontWeight: 'bold',
        fontSize: '18px',
    },
    markdownContainer: {
        
        lineHeight: '1.6',
        color: '#333',
    }
};

export default App;
