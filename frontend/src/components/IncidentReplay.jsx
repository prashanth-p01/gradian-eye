import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

export default function IncidentReplay({ timeline }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(40);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              INCIDENT REPLAY & TIMELINE SCRUBBER
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Replay disaster operations timeline with variable playback speed and detailed event logs.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() => setProgress(0)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 font-mono text-xs text-slate-300 px-2">
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900">1x Speed</option>
                <option value={2} className="bg-slate-900">2x Speed</option>
                <option value={4} className="bg-slate-900">4x Speed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrubber Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>T+00:00:00 (Disaster Init)</span>
            <span className="text-amber-400 font-bold">Scrubber Progress: {progress}%</span>
            <span>T+02:45:00 (Present)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500 border border-slate-800"
          />
        </div>

        {/* Timeline Log Stream */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Recorded Operations Log Stream
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {timeline?.map((evt, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-200">{evt.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{evt.details}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
