import { useState } from 'react';
import api from '../api/axios';
import './Login.css';

function Login({ onLogin, onSwitchToRegister, onBackToHome, isDarkMode, toggleDarkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="login-header">
        <button onClick={toggleDarkMode} className="login-toggle" title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDarkMode ? '◑' : '◐'}
        </button>
        <h1>LingoLog</h1>
      </header>

      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back</h2>
          
          <div className="back-link">
            <button onClick={onBackToHome} className="back-btn-link">
              ← Back to Home
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username or Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="switch-link">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
