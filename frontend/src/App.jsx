import React, { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { API_BASE, request } from './api';

function loadUser() {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('user');
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RequireRole({ user, role, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function Shell({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">PF</span>
          <div>
            <div className="brand-title">PharmaFlow</div>
            <div className="brand-subtitle">React frontend</div>
          </div>
        </div>

        {user ? (
          <nav className="nav-links">
            {user.role === 'admin' ? (
              <>
                <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>Admin</NavLink>
                <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>Analytics</NavLink>
                <NavLink to="/billing" className={({ isActive }) => (isActive ? 'active' : '')}>Billing</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
                <NavLink to="/scanner" className={({ isActive }) => (isActive ? 'active' : '')}>Scanner</NavLink>
                <NavLink to="/billing" className={({ isActive }) => (isActive ? 'active' : '')}>Billing</NavLink>
              </>
            )}
            <button className="nav-button" onClick={onLogout}>Logout</button>
          </nav>
        ) : (
          <nav className="nav-links">
            <Link to="/">Login</Link>
          </nav>
        )}
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');

    if (!username || !password) {
      setMessage('Enter username and password');
      return;
    }

    try {
      setLoading(true);
      const data = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (!data || !data.role) {
        setMessage(data?.message || 'Invalid credentials');
        return;
      }

      saveUser(data);
      onLogin(data);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-page">
      <section className="hero-copy">
        <p className="eyebrow">Smart medical store</p>
        <h1>React frontend with the same backend API.</h1>
        <p>
          The frontend now uses React Router, a shared API helper, and environment-based backend URLs.
          CORS is controlled from the backend with `FRONTEND_ORIGINS`.
        </p>
        <div className="status-card">
          <span>API base</span>
          <strong>{API_BASE}</strong>
        </div>
      </section>

      <section className="card auth-card">
        <h2>Sign in</h2>
        <form onSubmit={handleLogin} className="stack">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" autoComplete="current-password" />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        {message ? <p className="message error">{message}</p> : <p className="message">Use the existing backend users.</p>}
      </section>
    </div>
  );
}

function DashboardPage() {
  const [summary, setSummary] = useState({ totalMedicines: 0, totalStock: 0 });
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/medicines/summary')
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!query.trim()) {
      setError('Enter a medicine name');
      return;
    }

    try {
      const medicines = await request(`/search/${encodeURIComponent(query.trim())}`);
      setResult(medicines?.[0] || null);
      if (!medicines?.length) setError('Medicine not found');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Staff dashboard</p>
          <h1>Medicine locator</h1>
        </div>
      </header>

      <div className="stats-row">
        <div className="card stat-card"><span>Total Medicines</span><strong>{summary.totalMedicines}</strong></div>
        <div className="card stat-card"><span>Total Stock</span><strong>{summary.totalStock}</strong></div>
      </div>

      <section className="card">
        <form className="search-row" onSubmit={handleSearch}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine name" />
          <button type="submit">Locate</button>
        </form>
        {error ? <p className="message error">{error}</p> : null}
        {result ? (
          <div className="result-card">
            <div>
              <strong>{result.name}</strong>
              <p>Company: {result.company || '-'}</p>
            </div>
            <div className="result-meta">
              <span>₹{result.price}</span>
              <span>Stock: {result.quantity}</span>
              <span>Rack: {result.rack || '-'}</span>
              <span>Shelf: {result.shelf || '-'}</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AdminPage() {
  const [analytics, setAnalytics] = useState({ totalMedicines: 0, totalStock: 0, totalStaff: 0 });
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request('/analytics'),
      request('/staff')
    ])
      .then(([analyticsData, staffData]) => {
        setAnalytics(analyticsData);
        setStaff(staffData || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Operations overview</h1>
        </div>
      </header>

      {error ? <p className="message error">{error}</p> : null}

      <div className="stats-row">
        <div className="card stat-card"><span>Total Medicines</span><strong>{analytics.totalMedicines}</strong></div>
        <div className="card stat-card"><span>Total Stock</span><strong>{analytics.totalStock}</strong></div>
        <div className="card stat-card"><span>Total Staff</span><strong>{analytics.totalStaff}</strong></div>
      </div>

      <section className="card">
        <h2>Staff</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((item) => (
                <tr key={item._id}>
                  <td>{item.name || '-'}</td>
                  <td>{item.username}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function BillingPage() {
  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Ready for future billing UI</h1>
        </div>
      </header>
      <section className="card">
        <p>This route is now React-based. We can add the full cart UI next without touching the backend.</p>
      </section>
    </div>
  );
}

function ScannerPage() {
  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Scanner</p>
          <h1>Barcode lookup</h1>
        </div>
      </header>
      <section className="card">
        <p>This route is ready for a scanner component if you want to add one later.</p>
      </section>
    </div>
  );
}

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/analytics')
      .then(setAnalytics)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Sales and inventory snapshot</h1>
        </div>
      </header>
      {error ? <p className="message error">{error}</p> : null}
      <section className="card">
        <pre className="json-box">{JSON.stringify(analytics || {}, null, 2)}</pre>
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(loadUser);

  function handleLogout() {
    logout();
    setUser(null);
  }

  return (
    <Shell user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage onLogin={setUser} />} />
        <Route path="/dashboard" element={<RequireAuth user={user}><RequireRole user={user} role="staff"><DashboardPage /></RequireRole></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth user={user}><RequireRole user={user} role="admin"><AdminPage /></RequireRole></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth user={user}><BillingPage /></RequireAuth>} />
        <Route path="/scanner" element={<RequireAuth user={user}><ScannerPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth user={user}><RequireRole user={user} role="admin"><AnalyticsPage /></RequireRole></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;