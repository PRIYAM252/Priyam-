
import React from 'react';
import { UserProfile, ModerationLog, ModerationAction } from '../types';

interface DashboardProps {
  users: UserProfile[];
  logs: ModerationLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ users, logs }) => {
  const totalWarnings = logs.filter(l => l.action === ModerationAction.WARN).length;
  const totalMutes = logs.filter(l => l.action === ModerationAction.MUTE).length;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Warnings</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-500">{totalWarnings}</span>
            <span className="text-slate-500 text-xs pb-1">automated</span>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Mutes</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-red-500">{users.filter(u => u.isMuted).length}</span>
            <span className="text-slate-500 text-xs pb-1">current</span>
          </div>
        </div>
      </div>

      {/* User Status List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg flex-1 min-h-[300px] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Community Status
          </h2>
          <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">LIVE</span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
              <div className="relative">
                <img src={user.avatar} className="w-10 h-10 rounded-lg" alt={user.username} />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${user.isMuted ? 'bg-red-500' : 'bg-green-500'}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white leading-none mb-1">{user.username}</p>
                <div className="flex gap-2 text-[10px]">
                  <span className={`${user.warningCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>Warnings: {user.warningCount}</span>
                  <span className={`${user.muteCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>Strikes: {user.muteCount}</span>
                </div>
              </div>
              {user.isMuted && (
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-red-500 animate-pulse">MUTED</span>
                   <span className="text-[8px] text-slate-500">Auto-expires soon</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg flex-1 min-h-[350px] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            System Logs
          </h2>
          <span className="text-[10px] text-slate-400">{logs.length} entries</span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
              No recent activity.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/50 rounded-lg border-l-4 border-slate-700 text-xs">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400">{log.username}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm font-black text-[9px] ${
                      log.action === ModerationAction.MUTE ? 'bg-red-500/20 text-red-500' : 
                      log.action === ModerationAction.WARN ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                </div>
                <p className="text-slate-400 mb-2 italic">"{log.content}"</p>
                <div className="bg-slate-800 p-2 rounded border border-slate-700/50 text-slate-300">
                  <span className="font-bold text-slate-500">AI Reason:</span> {log.reason}
                  {log.duration && <span className="block mt-1 font-bold text-red-400">Duration: {log.duration}m</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
