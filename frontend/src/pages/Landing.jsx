import './Landing.css';

function Landing({ onGetStarted, isDarkMode, toggleDarkMode }) {
  return (
    <div className={`landing ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="landing-header">
        <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleDarkMode} 
            className="landing-toggle" 
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '◑' : '◐'}
          </button>
          <button 
            onClick={onGetStarted}
            style={{
              background: isDarkMode ? 'rgba(26,26,26,0.5)' : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: isDarkMode ? '2px solid #1a1a1a' : '1px solid rgba(255,255,255,0.5)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.2s',
              lineHeight: '1',
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: 'inherit',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDarkMode ? 'rgba(26,26,26,0.7)' : 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isDarkMode ? 'rgba(26,26,26,0.5)' : 'rgba(255,255,255,0.2)';
            }}
          >
            Login
          </button>
        </div>
        <h1>LingoLog</h1>
      </header>

      <div className="landing-content">
        <p className="subtitle">Track your language learning journey with ease</p>
        
        <div className="features">
          <div className="feature">
            <h3>📚 Multiple Languages</h3>
            <p>Track progress across all the languages you're learning</p>
          </div>
          <div className="feature">
            <h3>⏱️ Study Sessions</h3>
            <p>Log time spent on reading, listening, grammar, speaking, and writing</p>
          </div>
          <div className="feature">
            <h3>📊 Progress Tracking</h3>
            <p>View detailed statistics and breakdowns by category</p>
          </div>
        </div>

        <button className="cta-button" onClick={onGetStarted}>
          Get Started
        </button>

        <footer className="landing-footer">
          <p>Created by Graham Elgin</p>
          <p className="footer-note">Built with React, Node.js, and PostgreSQL</p>
        </footer>
      </div>
    </div>
  );
}

export default Landing;