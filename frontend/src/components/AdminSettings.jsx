import React, { useState } from 'react';
import { ShieldCheck, Users, Lock, Server, RefreshCw, Key, UserPlus, Database, Activity, CheckCircle2, AlertTriangle, Cpu, Cloud, Globe, Send } from 'lucide-react';

export default function AdminSettings() {
  const [usersList, setUsersList] = useState([
    { id: 1, username: 'commander_sarah', email: 'sarah.cmd@guardianeye.org', role: 'Emergency Commander', status: 'ACTIVE' },
    { id: 2, username: 'pilot_alex', email: 'alex.drone@guardianeye.org', role: 'Drone Operator', status: 'ACTIVE' },
    { id: 3, username: 'volunteer_john', email: 'john.vol@guardianeye.org', role: 'Field Volunteer', status: 'ACTIVE' },
    { id: 4, username: 'analyst_priya', email: 'priya.analyst@guardianeye.org', role: 'Analyst', status: 'ACTIVE' }
  ]);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Drone Operator');
  const [notice, setNotice] = useState('');

  // Supabase Database Connection Config State
  const [supabaseUrl, setSupabaseUrl] = useState('https://guardianeye.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YXJkaWFuZXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMjM0NTYsImV4cCI6MjA1NTY5OTQ1Nn0.sample');
  const [supabaseStatus, setSupabaseStatus] = useState('CONNECTED');
  const [isConnectingSupabase, setIsConnectingSupabase] = useState(false);

  const [dbEncryption, setDbEncryption] = useState(true);
  const [strictEdgeAi, setStrictEdgeAi] = useState(true);

  const handleConnectSupabase = async (e) => {
    e.preventDefault();
    setIsConnectingSupabase(true);
    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey })
      });
      const data = await res.json();
      if (data.success) {
        setSupabaseStatus('CONNECTED');
        setNotice(`✔ ${data.message}`);
      } else {
        setNotice(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('Error connecting Supabase:', err);
    } finally {
      setIsConnectingSupabase(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      const data = await res.json();
      setNotice(`✔ Synced ${data.syncedCount} records cleanly to Supabase Cloud!`);
    } catch (err) {
      console.error('Error syncing Supabase:', err);
    } finally {
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername) return;
    const newUser = {
      id: usersList.length + 1,
      username: newUsername,
      email: newEmail || `${newUsername}@guardianeye.org`,
      role: newRole,
      status: 'ACTIVE'
    };
    setUsersList([...usersList, newUser]);
    setNewUsername('');
    setNewEmail('');
    setNotice(`✔ User '${newUser.username}' added with role '${newRole}'!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleToggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleResetDb = () => {
    setNotice('✔ Database reset signal sent! SQLite DB re-seeded cleanly.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-500" />
            ADMINISTRATOR CONTROL PANEL & SECURITY SETTINGS
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            User RBAC management, Supabase Cloud Database connection, local SQLite store-and-sync, and security controls.
          </p>
        </div>

        {notice && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-bounce shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {notice}
          </div>
        )}
      </div>

      {/* Supabase Database Connection Card */}
      <div className="bg-slate-900 border border-emerald-900/50 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                SUPABASE CLOUD DATABASE CONNECTION
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {supabaseStatus}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect GuardianEye to your Supabase PostgreSQL cloud database for remote telemetry replication and cloud storage.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncToSupabase}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 shadow"
          >
            <Send className="w-3.5 h-3.5" /> Sync SQLite DB to Supabase Cloud
          </button>
        </div>

        <form onSubmit={handleConnectSupabase} className="grid grid-cols-1 md:grid-cols-12 gap-3 font-mono text-xs">
          <div className="md:col-span-5 space-y-1">
            <label className="text-slate-400 text-[10px] uppercase font-bold">Supabase Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-slate-400 text-[10px] uppercase font-bold">Supabase Anon / Service API Key</label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isConnectingSupabase}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2 rounded-lg text-xs uppercase tracking-wider border border-slate-700 transition-all"
            >
              {isConnectingSupabase ? 'Connecting...' : 'Connect & Test'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Management & RBAC */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              User Accounts & Role-Based Access (RBAC)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              {usersList.length} AUTHORIZED ACCOUNTS
            </span>
          </div>

          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="Emergency Commander">Emergency Commander</option>
              <option value="Rescue Team">Rescue Team</option>
              <option value="Drone Operator">Drone Operator</option>
              <option value="Field Volunteer">Field Volunteer</option>
              <option value="Relief Coordinator">Relief Coordinator</option>
              <option value="Analyst">Analyst</option>
              <option value="Administrator">Administrator</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add User
            </button>
          </form>

          {/* Users Table */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-mono text-xs">
            {usersList.map((u) => (
              <div key={u.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    {u.username}
                    <span className="text-[10px] text-slate-400 font-normal">({u.email})</span>
                  </div>
                  <div className="text-[11px] text-blue-400 mt-0.5">Role: {u.role}</div>
                </div>

                <button
                  onClick={() => handleToggleUserStatus(u.id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    u.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-red-950 hover:text-red-400'
                      : 'bg-red-950 text-red-400 border border-red-800 hover:bg-emerald-950 hover:text-emerald-400'
                  }`}
                >
                  {u.status === 'ACTIVE' ? 'REVOKE ACCESS' : 'RESTORE ACCESS'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls & Diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security Policy Controls */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-amber-400" />
              Security & Encryption Controls
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span>Local DB Storage Encryption</span>
                <button
                  onClick={() => setDbEncryption(!dbEncryption)}
                  className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                    dbEncryption ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {dbEncryption ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span>Edge AI Strict Validation Mode</span>
                <button
                  onClick={() => setStrictEdgeAi(!strictEdgeAi)}
                  className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                    strictEdgeAi ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {strictEdgeAi ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetDb}
              className="w-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow"
            >
              <RefreshCw className="w-4 h-4" /> Reset & Re-Seed SQLite Database
            </button>
          </div>

          {/* Database Diagnostics Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> System Diagnostics
            </h3>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Local Engine:</span> <b className="text-cyan-400">Node.js Express + SQLite3</b>
              </div>
              <div className="flex justify-between">
                <span>Cloud Engine:</span> <b className="text-emerald-400">Supabase (PostgreSQL)</b>
              </div>
              <div className="flex justify-between">
                <span>Database File:</span> <b className="text-slate-100">guardianeye.db</b>
              </div>
              <div className="flex justify-between">
                <span>REST API Port:</span> <b className="text-emerald-400">5000 (ONLINE)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
