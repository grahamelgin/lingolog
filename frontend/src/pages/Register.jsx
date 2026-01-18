import { useState } from 'react';
import api from '../api/axios';
import './Login.css';

function Register({ onLogin, onSwitchToLogin, onBackToHome, isDarkMode, toggleDarkMode }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h2>Create Account</h2>
          
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
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
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

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="switch-link">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
