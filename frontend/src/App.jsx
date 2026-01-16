import { useState, useEffect } from 'react';
import api from './api/axios';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingLanguageName, setEditingLanguageName] = useState(false);
  const [editedLanguageName, setEditedLanguageName] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingSession, setEditingSession] = useState(null);
  
  const [sessionForm, setSessionForm] = useState({
    category: 'Reading',
    duration_minutes: '',
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchLanguages();
    }
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/languages');
      setLanguages(response.data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchSessions = async (languageId) => {
    try {
      const response = await api.get(`/sessions/language/${languageId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStats = async (languageId) => {
    try {
      const response = await api.get(`/sessions/stats/${languageId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addLanguage = async (e) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;
    
    try {
      await api.post('/languages', { name: newLanguage });
      setNewLanguage('');
      fetchLanguages();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add language');
    }
  };

  const deleteLanguage = async (id) => {
    if (!confirm('Delete this language and all its sessions?')) return;
    
    try {
      await api.delete(`/languages/${id}`);
      setSelectedLanguage(null);
      fetchLanguages();
    } catch (error) {
      alert('Failed to delete language');
    }
  };

  const handleSaveLanguageName = async () => {
    if (!editedLanguageName.trim() || editedLanguageName === selectedLanguage.name) {
      setEditingLanguageName(false);
      return;
    }

    try {
      await api.put(`/languages/${selectedLanguage.id}`, { name: editedLanguageName });
      setSelectedLanguage({ ...selectedLanguage, name: editedLanguageName });
      setEditingLanguageName(false);
      fetchLanguages();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to rename language');
    }
  };

  const handleCancelEdit = () => {
    setEditingLanguageName(false);
    setEditedLanguageName('');
  };

  const addSession = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/sessions', {
        language_id: selectedLanguage.id,
        ...sessionForm
      });
      
      setSessionForm({
        category: 'Reading',
        duration_minutes: '',
        date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        notes: ''
      });
      
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    } catch (error) {
      alert('Failed to add session');
    }
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/sessions/${id}`);
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    } catch (error) {
      alert('Failed to delete session');
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
  };
  
  const handleSaveSession = async () => {
    try {
      await api.put(`/sessions/${editingSession.id}`, {
        category: editingSession.category,
        duration_minutes: editingSession.duration_minutes,
        date: editingSession.date,
        notes: editingSession.notes
      });
      setEditingSession(null);
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    } catch (error) {
      alert('Failed to update session');
    }
  };
  
  const handleCancelEditSession = () => {
    setEditingSession(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setLanguages([]);
    setSelectedLanguage(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchLanguages();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onLogin={handleLogin} onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="app">
      <header>
        <h1>Language Learning Tracker</h1>
        <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'white' }}>Welcome, {user.username}!</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        {!selectedLanguage ? (
          <div className="languages-view">
            <div className="add-language">
              <h2>Add Language</h2>
              <form onSubmit={addLanguage}>
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g., Spanish, Japanese"
                />
                <button type="submit">Add</button>
              </form>
            </div>

            <div className="languages-list">
              <h2>Your Languages</h2>
              {languages.length === 0 ? (
                <p>No languages yet. Add one above!</p>
              ) : (
                <div className="language-cards">
                  {languages.map(lang => (
                    <div key={lang.id} className="language-card" onClick={() => setSelectedLanguage(lang)}>
                      <h3>{lang.name}</h3>
                      <p className="date">Added {formatDate(lang.created_at.substring(0, 10))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="language-detail">
            <button className="back-btn" onClick={() => setSelectedLanguage(null)}>← Back</button>
            
            <div className="language-header">
              {editingLanguageName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    value={editedLanguageName}
                    onChange={(e) => setEditedLanguageName(e.target.value)}
                    autoFocus
                    style={{ fontSize: '2rem', padding: '0.5rem', border: '2px solid #667eea', borderRadius: '8px' }}
                  />
                  <button onClick={handleSaveLanguageName} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                  <button onClick={handleCancelEdit} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2>{selectedLanguage.name}</h2>
                  <button onClick={() => { setEditingLanguageName(true); setEditedLanguageName(selectedLanguage.name); }} style={{ background: '#f0f0f0', color: '#666', border: '1px solid #e0e0e0', padding: '0.25rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>Rename</button>
                </div>
              )}
              <button className="delete-btn" onClick={() => deleteLanguage(selectedLanguage.id)}>Delete Language</button>
            </div>

            {stats && (
              <div className="stats">
                <div className="stat-card">
                  <h3>Total Time</h3>
                  <p className="stat-value">{formatTime(stats.total_minutes)}</p>
                </div>
                <div className="stat-card">
                  <h3>Sessions</h3>
                  <p className="stat-value">{sessions.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Categories</h3>
                  <p className="stat-value">{stats.by_category.length}</p>
                </div>
              </div>
            )}

            {stats && stats.by_category.length > 0 && (
              <div className="category-breakdown">
                <h3>Time by Category</h3>
                {stats.by_category.map(cat => (
                  <div key={cat.category} className="category-item">
                    <span>{cat.category}</span>
                    <span>{formatTime(cat.total_minutes)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="add-session">
              <h3>Log Study Session</h3>
              <form onSubmit={addSession}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={sessionForm.category}
                      onChange={(e) => setSessionForm({...sessionForm, category: e.target.value})}
                    >
                      <option>Reading</option>
                      <option>Listening</option>
                      <option>Speaking</option>
                      <option>Writing</option>
                      <option>Grammar</option>
                      <option>Vocabulary</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={sessionForm.duration_minutes}
                      onChange={(e) => setSessionForm({...sessionForm, duration_minutes: e.target.value})}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                    placeholder="What did you study?"
                    rows="3"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit">Add Session</button>
              </form>
            </div>

            <div className="sessions-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Study Sessions</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#666' }}>Filter:</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
                  >
                    <option>All</option>
                    <option>Reading</option>
                    <option>Listening</option>
                    <option>Speaking</option>
                    <option>Writing</option>
                    <option>Grammar</option>
                    <option>Vocabulary</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              {sessions.length === 0 ? (
                <p>No sessions yet. Add one above!</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.filter(session => filterCategory === 'All' || session.category === filterCategory).map(session => (
                      <tr key={session.id}>
                        <td>
                          {editingSession?.id === session.id ? (
                            <input type="date" value={editingSession.date} onChange={(e) => setEditingSession({...editingSession, date: e.target.value})} style={{ padding: '0.5rem', fontSize: '0.875rem', border: '2px solid #e0e0e0', borderRadius: '6px' }} />
                          ) : (
                            formatDate(session.date)
                          )}
                        </td>
                        <td>
                          {editingSession?.id === session.id ? (
                            <select value={editingSession.category} onChange={(e) => setEditingSession({...editingSession, category: e.target.value})} style={{ padding: '0.5rem', fontSize: '0.875rem', border: '2px solid #e0e0e0', borderRadius: '6px' }}>
                              <option>Reading</option>
                              <option>Listening</option>
                              <option>Speaking</option>
                              <option>Writing</option>
                              <option>Grammar</option>
                              <option>Vocabulary</option>
                              <option>Other</option>
                            </select>
                          ) : (
                            <span className="category-badge">{session.category}</span>
                          )}
                        </td>
                        <td>
                          {editingSession?.id === session.id ? (
                            <input type="number" value={editingSession.duration_minutes} onChange={(e) => setEditingSession({...editingSession, duration_minutes: e.target.value})} style={{ padding: '0.5rem', fontSize: '0.875rem', width: '80px', border: '2px solid #e0e0e0', borderRadius: '6px' }} min="1" />
                          ) : (
                            formatTime(session.duration_minutes)
                          )}
                        </td>
                        <td>
                          {editingSession?.id === session.id ? (
                            <textarea value={editingSession.notes || ''} onChange={(e) => setEditingSession({...editingSession, notes: e.target.value})} rows="2" style={{ padding: '0.5rem', fontSize: '0.875rem', border: '2px solid #e0e0e0', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit', width: '100%' }} />
                          ) : (
                            session.notes || '-'
                          )}
                        </td>
                        <td>
                          {editingSession?.id === session.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={handleSaveSession} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Save</button>
                              <button onClick={handleCancelEditSession} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleEditSession(session)} style={{ background: '#667eea', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                              <button className="delete-session-btn" onClick={() => deleteSession(session.id)}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;