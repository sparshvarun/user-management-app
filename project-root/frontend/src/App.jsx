import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';

export default function App() {
  return (
    <div className="container">
      <h1>User Management Dashboard</h1>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link to="/">🏠 Home</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <Dashboard />
              <CreateUser />
            </div>
          }
        />
        <Route path="/edit/:id" element={<EditUser />} />
      </Routes>
    </div>
  );
}

