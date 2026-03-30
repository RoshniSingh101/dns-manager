"use client";
import { useState, useEffect } from 'react';

export default function DNSDashboard() {
  const [domain, setDomain] = useState('');
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch both records and logs
  const fetchData = async () => {
    try {
      const [recRes, logRes] = await Promise.all([
        fetch('http://localhost:3000/api/records'),
        fetch('http://localhost:3000/api/logs')
      ]);
      const recData = await recRes.json();
      const logData = await logRes.json();
      console.log("Logs from server:", logData);
      
      if (Array.isArray(recData)) setRecords(recData);
      if (Array.isArray(logData)) setLogs(logData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 3000); // Auto-refresh logs every 3s
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, ip }),
    });
    if (res.ok) {
      setStatus('Record added');
      setDomain(''); setIp('');
      fetchData();
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const deleteRecord = async (id) => {
    const res = await fetch(`http://localhost:3000/api/records/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">DNS Manager</h1>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            Server Live
          </div>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
          <input 
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 outline-none focus:ring-2 ring-blue-500 transition-all" 
            placeholder="Domain (dev.local)" 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <input 
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 outline-none focus:ring-2 ring-blue-500 transition-all" 
            placeholder="IP Address" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <button className="bg-zinc-900 dark:bg-zinc-100 dark:text-black text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
            Add Record
          </button>
        </form>

        {/* Records Table */}
        <section className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Active Records</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {records.map((r) => (
                  <tr key={r.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="p-4 font-mono font-medium">{r.domain}</td>
                    <td className="p-4 font-mono text-zinc-500">{r.ip}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteRecord(r.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Logs - Discrete Feed */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Live Traffic</h2>
          <div className="space-y-2">
            {logs.slice(0, 5).map((l) => (
            //   <div key={l.id} className="flex justify-between items-center text-xs font-mono bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
            //     <span className="text-blue-500">QUERY: {l.domain}</span>
            //     <span className="text-zinc-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
            //   </div>
                <div key={l.id} className="flex justify-between items-center text-xs font-mono bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex gap-3 items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.source === 'PROXY' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {l.source || 'LOCAL'}
                        </span>
                        <span className="text-zinc-200">QUERY: {l.domain}</span>
                    </div>
                    <span className="text-zinc-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
                </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}