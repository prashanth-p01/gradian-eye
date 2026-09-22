import React, { useState } from 'react';
import { Wifi, WifiOff, Database, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export default function OfflineSync({ offlineQueue }) {
  const [networkOnline, setNetworkOnline] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              OFFLINE-FIRST & STORE-AND-SYNC QUEUE
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Guarantees full disaster operation capability without internet connectivity. Events are queued locally and synchronized upon network restoration.
            </p>
          </div>

          <button
            onClick={() => setNetworkOnline(!networkOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
              networkOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
            }`}
          >
            {networkOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{networkOnline ? 'Simulate Network Restored (Online)' : 'Simulate Network Loss (Offline)'}</span>
          </button>
        </div>

        {/* Offline Queue Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Store-and-Sync Pending Queue ({offlineQueue?.length || 0} Items)
          </h3>

          <div className="space-y-2">
            {offlineQueue?.map((item) => (
              <div key={item.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${
                    item.sync_status === 'SYNCED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {item.sync_status === 'SYNCED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-200">{item.event_id} — {item.type}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Device: {item.device_id} | Status: <span className="font-bold text-amber-400">{item.sync_status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
