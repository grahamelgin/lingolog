import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [sessionForm, setSessionForm] = useState({
    category: 'Reading',
    duration_minutes: '',
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API_URL}/languages`);
      setLanguages(response.data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchSessions = async (languageId) => {
    try {
      const response = await axios.get(`${API_URL}/sessions/language/${languageId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStats = async (languageId) => {
    try {
      const response = await axios.get(`${API_URL}/sessions/stats/${languageId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addLanguage = async (e) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;
    
    try {
      await axios.post(`${API_URL}/languages`, { name: newLanguage });
      setNewLanguage('');
      fetchLanguages();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add language');
    }
  };

  const deleteLanguage = async (id) => {
    if (!confirm('Delete this language and all its sessions?')) return;
    
    try {
      await axios.delete(`${API_URL}/languages/${id}`);
      setSelectedLanguage(null);
      fetchLanguages();
    } catch (error) {
      alert('Failed to delete language');
    }
  };

  const addSession = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_URL}/sessions`, {
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
      await axios.delete(`${API_URL}/sessions/${id}`);
      fetchSessions(selectedLanguage.id);
      fetchStats(selectedLanguage.id);
    } catch (error) {
      alert('Failed to delete session');
    }
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

  return (
    <div className="app">
      <header>
        <h1>Language Learning Tracker</h1>
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
              <h2>{selectedLanguage.name}</h2>
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
                  <input
                    type="text"
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                    placeholder="What did you study?"
                  />
                </div>

                <button type="submit">Add Session</button>
              </form>
            </div>

            <div className="sessions-list">
              <h3>Study Sessions</h3>
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
                    {sessions.map(session => (
                      <tr key={session.id}>
                        <td>{formatDate(session.date)}</td>
                        <td><span className="category-badge">{session.category}</span></td>
                        <td>{formatTime(session.duration_minutes)}</td>
                        <td>{session.notes || '-'}</td>
                        <td>
                        <button className="delete-session-btn" onClick={() => deleteSession(session.id)}>Delete</button>
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