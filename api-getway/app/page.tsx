"use client";

import React, { useEffect, useState } from 'react';
import { LogEntry } from '@/src/gateway/domain/types';
import { TerminalLog } from '@/src/gateway/infrastructure/TerminalLogger';

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [termLogs, setTermLogs] = useState<TerminalLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
      const trmRes = await fetch('/api/terminal-logs');
      const trmData = await trmRes.json();
      if (trmData.success) {
        setTermLogs(trmData.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (status >= 400) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (status >= 300) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-emerald-400';
      case 'POST': return 'text-blue-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTermTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warn': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Gateway Overseer
            </h1>
            <p className="text-sm text-gray-400">Real-time metrics and routing logs mapping</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-500">Live</span>
            </div>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all shadow-lg active:scale-95"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Total Requests</p>
            <p className="text-3xl font-medium">{logs.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Success Rate</p>
            <p className="text-3xl font-medium text-emerald-400">
              {logs.length > 0 ? Math.round((logs.filter(l => l.status < 400).length / logs.length) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Avg Latency</p>
            <p className="text-3xl font-medium text-orange-400">
              {logs.length > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.durationMs, 0) / logs.length) : 0}ms
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Errors</p>
            <p className="text-3xl font-medium text-red-500">
              {logs.filter(l => l.status >= 500).length}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-medium">Recent Traffic</h2>
            <span className="text-xs text-gray-500 font-mono">Last 100 requests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium first:pl-8">Status</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Path</th>
                  <th className="px-6 py-4 font-medium">Latency</th>
                  <th className="px-6 py-4 font-medium">Client IP</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading traffic data...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No traffic recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 first:pl-8">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-semibold ${getMethodColor(log.method)}`}>
                        {log.method}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-300 group-hover:text-white transition-colors">
                        {log.path}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{log.durationMs}</span>
                        <span className="text-gray-500 text-xs ml-0.5">ms</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {log.clientIp}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-red-400 text-xs truncate max-w-xs">
                        {log.error || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terminal Logs Table Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-medium">Terminal Logs</h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">Real-time STDOUT capture</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#111] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium first:pl-8">Type</th>
                  <th className="px-6 py-4 font-medium min-w-[300px]">Message</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {termLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      No terminal output recorded yet.
                    </td>
                  </tr>
                ) : (
                  termLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 first:pl-8 align-top">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTermTypeColor(log.type)}`}>
                          {log.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-300 group-hover:text-white transition-colors whitespace-pre-wrap max-w-4xl break-all line-clamp-3">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs align-top">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
