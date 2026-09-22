import React, { useState } from 'react';
import { Utensils, AlertTriangle, CheckCircle2, Info, Thermometer, Clock, Upload, ShieldAlert } from 'lucide-react';

export default function FoodSafetyScan() {
  const [foodType, setFoodType] = useState('Cooked Chicken Relief Packets');
  const [storageHours, setStorageHours] = useState(6.0);
  const [tempC, setTempC] = useState(30.0);
  const [visualIndicators, setVisualIndicators] = useState('Slight surface moisture & elevated surface heat');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=60');
  
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    try {
      const res = await fetch('/api/food-safety/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_type: foodType,
          storage_hours: parseFloat(storageHours),
          temperature_c: parseFloat(tempC),
          visual_indicators: visualIndicators
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error running food safety scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              FOOD SAFETY SCAN MODULE
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                RELIEF CAMP SCREENING
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Rapid risk-screening workflow for cooked food and supplies received at disaster relief camps before distribution to displaced survivors.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-base font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            1. Food Screening Input Parameters
          </h3>

          <form onSubmit={handleScan} className="space-y-5">
            {/* Image Upload Simulator */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Food Sample Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 overflow-hidden relative group">
                  <img src={imagePreview} alt="Food sample" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-mono">Sample Loaded</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setImagePreview('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                  >
                    Simulate Fresh Meal Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagePreview('https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=60')}
                    className="block px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 rounded-lg text-xs font-medium border border-amber-800/60 transition-all"
                  >
                    Simulate Suspicious Meal Image
                  </button>
                </div>
              </div>
            </div>

            {/* Food Type Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Food Supplies Category</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Cooked Chicken Relief Packets">Cooked Chicken Relief Packets</option>
                <option value="Prepared Vegetable & Meat Stew">Prepared Vegetable & Meat Stew</option>
                <option value="Steamed Rice Packets">Steamed Rice Packets</option>
                <option value="Seafood Curry Relief Ration">Seafood Curry Relief Ration</option>
                <option value="Boiled Milk & Dairy Packets">Boiled Milk & Dairy Packets</option>
                <option value="Dry Biscuit & Grain Packs">Dry Biscuit & Grain Packs</option>
              </select>
            </div>

            {/* Outdoor Storage Duration */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Outside Storage Time</span>
                <span className="font-mono text-amber-400 font-bold">{storageHours} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={storageHours}
                onChange={(e) => setStorageHours(e.target.value)}
                className="w-full accent-amber-500 bg-slate-950 cursor-pointer h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5h (Fresh)</span>
                <span>4.0h (Threshold)</span>
                <span>12.0h (Expired)</span>
              </div>
            </div>

            {/* Temperature Input */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-red-400" /> Ambient Temperature</span>
                <span className="font-mono text-red-400 font-bold">{tempC}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={tempC}
                onChange={(e) => setTempC(e.target.value)}
                className="w-full accent-red-500 bg-slate-950 cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Visual Indicators Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Visual Inspection Note</label>
              <select
                value={visualIndicators}
                onChange={(e) => setVisualIndicators(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Normal appearance & clean packaging">Normal appearance & clean packaging</option>
                <option value="Slight surface moisture & elevated surface heat">Slight surface moisture & elevated surface heat</option>
                <option value="Suspicious discoloration or off odor">Suspicious discoloration or off odor</option>
                <option value="Damaged seal / open container exposure">Damaged seal / open container exposure</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all"
            >
              {isScanning ? <span className="animate-spin font-mono">Running Risk Screening...</span> : <>
                <ShieldAlert className="w-4 h-4" />
                Run Rapid Food Safety Screening
              </>}
            </button>
          </form>
        </div>

        {/* Results & Safety Disclaimer Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-base font-semibold text-slate-200 uppercase tracking-wider font-mono">
              2. Screening Result & Advice
            </h3>

            {result ? (
              <div className="space-y-4">
                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border text-center ${
                  result.risk_level.includes('HIGH')
                    ? 'bg-red-950/60 border-red-800/80 text-red-300'
                    : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                }`}>
                  <div className="text-xs font-mono font-bold uppercase tracking-widest opacity-80">Risk Screening Result</div>
                  <div className="text-lg font-black tracking-wide mt-1 flex items-center justify-center gap-2">
                    {result.risk_level.includes('HIGH') ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {result.risk_level}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Distribution Recommendation</div>
                  <div className="text-sm font-extrabold text-amber-400 mt-1">
                    {result.recommendation}
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Evaluation Reasons:</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.reasons?.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                Select parameters on the left and click "Run Rapid Food Safety Screening".
              </div>
            )}
          </div>

          {/* Mandatory Safety Limits Statement */}
          <div className="bg-amber-950/40 border border-amber-800/40 p-4 rounded-xl text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
              <Info className="w-4 h-4" />
              IMPORTANT SAFETY LIMIT DISCLAIMER
            </div>
            <p className="leading-relaxed">
              Do not claim that an image alone can prove food is safe or unsafe. This is a screening decision-support prototype, not a laboratory test or medical device. Real-world food-safety decisions require applicable food-safety guidance and appropriate professional inspection/testing before relief camp distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
