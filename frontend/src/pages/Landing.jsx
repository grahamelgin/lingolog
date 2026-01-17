import './Landing.css';

function Landing({ onGetStarted, isDarkMode, toggleDarkMode }) {
  return (
    <div className="landing" style={{ position: 'relative' }}>
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', zIndex: 10 }} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        {isDarkMode ? '◑' : '◐'}
      </button>
      <div className="landing-content">
        <h1>Language Learning Tracker</h1>
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
          <p className="footer-note">Built with React, Node.js, and SQLite</p>
        </footer>
      </div>
    </div>
  );
}

export default Landing;