import React, { useState, useEffect } from 'react';
import { Play, Plus, MoveRight, Check, X } from 'lucide-react';
import { GraphCanvas } from './canvas';
import { Panel } from './panel';
import { useGraph } from './graphcontext';

const Button = ({ children, primary = false, className = "", ...props }: any) => {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4 py-2 active:scale-95 disabled:opacity-50 
      ${primary ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200" : "bg-neutral-900 border border-neutral-700 text-neutral-100 hover:bg-neutral-800"} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default function App() {
  const API_URL = 'https://automata-back.onrender.com';
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  
  const { 
      states, setStates, 
      transitions, 
      startState, setStartState, 
      testString, setTestString,
      playbackStatus, setPlaybackStatus,
      trace, setTrace,
      simMessage, setSimMessage,
      setAnimStep,
      setDraftEdge, setPanelState
  } = useGraph();

  useEffect(() => {
    fetch('https://automata-back.onrender.com/api/status')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus(null));
  }, []);

  useEffect(() => {
    const isValidStart = states.some((s: any) => s.id === startState);
    if (!isValidStart) {
      const fallback = states.length > 0 ? states[0] : null;
      setStartState(fallback ? fallback.id : '');
    }
  }, [states, startState, setStartState]);

  const runSimulation = async () => {
    if (playbackStatus === 'Animating') return;
    setPlaybackStatus("Idle");
    setAnimStep(-1);

    try {
      const response = await fetch('https://automata-back.onrender.com/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            states: states, 
            transitions: transitions, 
            start_state: startState, 
            test_string: testString 
        }),
      });
      const data = await response.json();
      
      setTrace(data.trace);
      setSimMessage(data.message || "");
      setPlaybackStatus(data.status === "Error" ? "Error" : "Animating");
      
      if (data.status !== "Error") {
        let step = 0;
        const interval = setInterval(() => {
          step++;
          if (step >= (data.trace.length - 1) * 2 + 1) {
            clearInterval(interval);
            setPlaybackStatus(data.status);
            setTimeout(() => setAnimStep(-1), 2000);
          } else {
            setAnimStep(step);
          }
        }, 700);
      }
    } catch (error) {
      setPlaybackStatus("Error");
      setSimMessage("Failed to connect to backend.");
    }
  };

  const handleAddEdge = () => {
    if (states.length === 0) return;
    const fromId = states[0].id;
    const toId = states.length > 1 ? states[1].id : states[0].id;
    
    setDraftEdge({ from: fromId, to: toId, symbol: '' });
    setPanelState({ 
      isOpen: true, 
      type: 'new-transition', 
      targetId: 'new', 
      x: Math.max(20, window.innerWidth / 2 - 128), 
      y: Math.max(20, window.innerHeight / 2 - 100) 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-8 text-neutral-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-neutral-300">εύρηκα!</h1>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${backendStatus ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {backendStatus ? `CONNECTED` : 'OFFLINE'}
        </div>
      </div>

      <div className="w-full max-w-6xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Controls */}
        <div className="flex flex-wrap gap-4 p-5 border-b border-neutral-800 bg-neutral-800/40">
          <div className="flex gap-3 items-end">
            <Button 
              onClick={() => {
                const maxIdNum = states.reduce((max: number, state: any) => {
                  const num = parseInt(state.id.replace('q', ''), 10);
                  return !isNaN(num) && num > max ? num : max;
                }, -1);
                
                setStates([...states, { id: `q${maxIdNum + 1}`, x: 300, y: 300, isAccept: false }]);
              }} 
              disabled={playbackStatus === 'Animating'}
            >
              <Plus className="mr-2 h-4 w-4" /> Node
            </Button>
            <Button onClick={handleAddEdge} disabled={states.length === 0 || playbackStatus === 'Animating'}>
              <MoveRight className="mr-2 h-4 w-4" /> Edge
            </Button>
          </div>
          
          <div className="h-8 w-px bg-neutral-700 mx-2 self-end hidden sm:block"></div>

          <div className="flex flex-1 gap-4 items-end">
            <div className="flex flex-col gap-1 w-32">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Start State</label>
              <select disabled={playbackStatus === 'Animating'} value={startState} onChange={(e) => setStartState(e.target.value)} className="h-9 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 text-sm focus:outline-none disabled:opacity-50">
                {states.map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1 max-w-md">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Input Sequence</label>
              <div className="flex gap-2">
                <input disabled={playbackStatus === 'Animating'} className="h-9 flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 text-sm focus:outline-none disabled:opacity-50" value={testString} onChange={(e) => setTestString(e.target.value)} placeholder="e.g. baab" />
                <Button primary onClick={runSimulation} disabled={playbackStatus === 'Animating' || !testString || !startState}>
                  <Play className="mr-2 h-4 w-4" fill="currentColor" /> Simulate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <GraphCanvas />

        {/* Footer Status */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className={`px-4 py-1.5 border rounded-md flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[11px] min-w-[100px] transition-colors
              ${playbackStatus === 'Pass' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 
                playbackStatus === 'Fail' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 
                playbackStatus === 'Error' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                playbackStatus === 'Animating' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                'border-neutral-800 text-neutral-500 bg-neutral-900/50'}
            `}>
              {playbackStatus === 'Pass' && <><Check className="w-3.5 h-3.5" /> PASS</>}
              {playbackStatus === 'Fail' && <><X className="w-3.5 h-3.5" /> FAIL</>}
              {playbackStatus === 'Error' && <><X className="w-3.5 h-3.5" /> ERROR</>}
              {playbackStatus === 'Animating' && 'COMPUTING...'}
              {playbackStatus === 'Idle' && 'READY'}
            </div>
            <span className="text-sm text-neutral-400">Execution Trace: <span className="font-bold text-neutral-200">{trace.length > 0 ? trace.join(' → ') : 'Awaiting input...'}</span></span>
          </div>
          {simMessage && playbackStatus !== 'Animating' && <span className="text-sm font-bold text-neutral-400">{simMessage}</span>}
        </div>
      </div>

      {/* Panel */}
      <Panel />
    </div>
  );
}