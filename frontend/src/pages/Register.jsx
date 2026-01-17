import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
      const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' }}>
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        {isDarkMode ? '◑' : '◐'}
      </button>
      <div style={{ background: isDarkMode ? '#2d2d2d' : 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', color: isDarkMode ? '#e0e0e0' : '#333' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: isDarkMode ? '#e0e0e0' : '#333' }}>Create Account</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={onBackToHome}
            style={{ background: 'transparent', border: '1px solid #e0e0e0', color: '#666', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '6px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.color = '#667eea'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.color = '#666'; }}
          >
            ← Back
          </button>
        </div>
        
        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: isDarkMode ? '#e0e0e0' : '#666' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: isDarkMode ? '2px solid #666' : '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', background: isDarkMode ? '#3d3d3d' : 'white', color: isDarkMode ? '#e0e0e0' : '#333' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: isDarkMode ? '#e0e0e0' : '#666' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: isDarkMode ? '2px solid #666' : '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', background: isDarkMode ? '#3d3d3d' : 'white', color: isDarkMode ? '#e0e0e0' : '#333' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: isDarkMode ? '#e0e0e0' : '#666' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: isDarkMode ? '2px solid #666' : '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', background: isDarkMode ? '#3d3d3d' : 'white', color: isDarkMode ? '#e0e0e0' : '#333' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: isDarkMode ? '#e0e0e0' : '#666' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: isDarkMode ? '2px solid #666' : '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', background: isDarkMode ? '#3d3d3d' : 'white', color: isDarkMode ? '#e0e0e0' : '#333' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            onMouseEnter={(e) => !loading && (e.target.style.background = 'rgba(102, 126, 234, 0.1)')}
            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;