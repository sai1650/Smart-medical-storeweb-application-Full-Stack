import React, { useEffect, useState } from 'react';
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
                <NavLink to="/admin-attendance" className={({ isActive }) => (isActive ? 'active' : '')}>Attendance</NavLink>
                <NavLink to="/billing" className={({ isActive }) => (isActive ? 'active' : '')}>Billing</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
                <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>Attendance</NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>Profile</NavLink>
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

function AttendancePage({ user }) {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAttendance() {
    if (!user?._id) return;
    const [todayData, historyData] = await Promise.all([
      request(`/attendance/${user._id}/today`),
      request(`/attendance/${user._id}`)
    ]);
    setToday(todayData);
    setHistory(historyData || []);
  }

  useEffect(() => {
    loadAttendance().catch((err) => setMessage(err.message));
  }, [user]);

  async function mark(type) {
    if (!user?._id) return;
    try {
      setLoading(true);
      setMessage('');
      if (type === 'checkin') {
        await request('/attendance/checkin', {
          method: 'POST',
          body: JSON.stringify({ user_id: user._id, username: user.username, status: 'present' })
        });
      } else {
        await request('/attendance/checkout', {
          method: 'POST',
          body: JSON.stringify({ user_id: user._id })
        });
      }
      await loadAttendance();
      setMessage(type === 'checkin' ? 'Check-in recorded' : 'Check-out recorded');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Attendance</p>
          <h1>Your attendance</h1>
        </div>
      </header>

      {message ? <p className="message error">{message}</p> : null}

      <div className="stats-row">
        <div className="card stat-card"><span>Today</span><strong>{today?.marked ? today.status : 'Not marked'}</strong></div>
        <div className="card stat-card"><span>Last update</span><strong>{today?.timestamp ? new Date(today.timestamp).toLocaleString() : '-'}</strong></div>
      </div>

      <section className="card">
        <div className="page-actions">
          <button onClick={() => mark('checkin')} disabled={loading}>Check In</button>
          <button onClick={() => mark('checkout')} disabled={loading}>Check Out</button>
          <button className="secondary-button" onClick={() => loadAttendance().catch((err) => setMessage(err.message))} disabled={loading}>Refresh</button>
        </div>
      </section>

      <section className="card">
        <h2>Recent history</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check in</th>
                <th>Check out</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                  <td>{item.status || '-'}</td>
                  <td>{item.check_in ? new Date(item.check_in).toLocaleString() : '-'}</td>
                  <td>{item.check_out ? new Date(item.check_out).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ProfilePage({ user, onUserChange }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  async function saveProfile(event) {
    event.preventDefault();
    if (!user?._id) return;

    try {
      setLoading(true);
      setMessage('');
      const updated = await request(`/staff/${user._id}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ name, email, phone })
      });
      const nextUser = { ...user, ...updated };
      saveUser(nextUser);
      onUserChange(nextUser);
      setMessage('Profile saved');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Your account</h1>
        </div>
      </header>

      {message ? <p className="message error">{message}</p> : null}

      <section className="card">
        <form className="stack" onSubmit={saveProfile}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button>
        </form>
      </section>
    </div>
  );
}

function AdminAttendancePage() {
  const [staff, setStaff] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([request('/staff'), request('/attendance-report/all')])
      .then(([staffData, recordsData]) => {
        setStaff(staffData || []);
        setRecords(recordsData || []);
      })
      .catch((err) => setMessage(err.message));
  }, []);

  async function markAttendance(status) {
    if (!selectedUser) {
      setMessage('Select a staff member first');
      return;
    }

    try {
      setMessage('');
      await request('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ user_id: selectedUser, status })
      });
      const nextRecords = await request('/attendance-report/all');
      setRecords(nextRecords || []);
      setMessage(`Marked ${status}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Attendance</p>
          <h1>Mark staff attendance</h1>
        </div>
      </header>

      {message ? <p className="message error">{message}</p> : null}

      <section className="card">
        <div className="stack">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Select staff member</option>
            {staff.map((item) => (
              <option key={item._id} value={item._id}>{item.name || item.username}</option>
            ))}
          </select>
          <div className="page-actions">
            <button onClick={() => markAttendance('present')}>Present</button>
            <button onClick={() => markAttendance('absent')}>Absent</button>
            <button onClick={() => markAttendance('leave')}>Leave</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Recent records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check in</th>
                <th>Check out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr key={item._id}>
                  <td>{item.username || '-'}</td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                  <td>{item.status || '-'}</td>
                  <td>{item.check_in ? new Date(item.check_in).toLocaleString() : '-'}</td>
                  <td>{item.check_out ? new Date(item.check_out).toLocaleString() : '-'}</td>
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
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [cart, setCart] = useState({});
  const [invoice, setInvoice] = useState(null);
  const [message, setMessage] = useState('');

  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function searchMedicine(event) {
    event.preventDefault();
    try {
      setMessage('');
      const medicines = await request(`/search/${encodeURIComponent(query.trim())}`);
      setSearchResult(medicines?.[0] || null);
      if (!medicines?.length) setMessage('Medicine not found');
    } catch (err) {
      setMessage(err.message);
    }
  }

  function addToCart() {
    if (!searchResult?._id) return;
    setCart((current) => ({
      ...current,
      [searchResult._id]: {
        id: searchResult._id,
        name: searchResult.name,
        price: Number(searchResult.price) || 0,
        quantity: (current[searchResult._id]?.quantity || 0) + 1
      }
    }));
  }

  function changeQuantity(id, nextQuantity) {
    setCart((current) => {
      const next = { ...current };
      if (nextQuantity <= 0) {
        delete next[id];
      } else {
        next[id] = { ...next[id], quantity: nextQuantity };
      }
      return next;
    });
  }

  async function checkout() {
    try {
      setMessage('');
      const response = await request('/billing', {
        method: 'POST',
        body: JSON.stringify({ items: cart })
      });
      setInvoice(response);
      setCart({});
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="content-grid">
      <header className="page-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Cart and invoice</h1>
        </div>
      </header>

      {message ? <p className="message error">{message}</p> : null}

      <section className="card">
        <form className="search-row" onSubmit={searchMedicine}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine" />
          <button type="submit">Search</button>
        </form>
        {searchResult ? (
          <div className="result-card" style={{ marginTop: '16px' }}>
            <div>
              <strong>{searchResult.name}</strong>
              <p>{searchResult.company || '-'}</p>
            </div>
            <button type="button" onClick={addToCart}>Add to cart</button>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Cart</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <div className="quantity-controls">
                      <button type="button" className="secondary-button" onClick={() => changeQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" className="secondary-button" onClick={() => changeQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="page-actions" style={{ justifyContent: 'space-between', marginTop: '16px' }}>
          <strong>Total: ₹{subtotal}</strong>
          <button type="button" onClick={checkout} disabled={!items.length}>Checkout</button>
        </div>
      </section>

      {invoice ? (
        <section className="card">
          <h2>Invoice</h2>
          <pre className="json-box">{JSON.stringify(invoice, null, 2)}</pre>
        </section>
      ) : null}
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
        <Route path="/attendance" element={<RequireAuth user={user}><RequireRole user={user} role="staff"><AttendancePage user={user} /></RequireRole></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth user={user}><RequireRole user={user} role="staff"><ProfilePage user={user} onUserChange={setUser} /></RequireRole></RequireAuth>} />
        <Route path="/admin-attendance" element={<RequireAuth user={user}><RequireRole user={user} role="admin"><AdminAttendancePage /></RequireRole></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth user={user}><BillingPage /></RequireAuth>} />
        <Route path="/scanner" element={<RequireAuth user={user}><ScannerPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth user={user}><RequireRole user={user} role="admin"><AnalyticsPage /></RequireRole></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;