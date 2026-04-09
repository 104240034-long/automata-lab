import React from 'react';
import { MoveRight, Trash2, Save, X, GripHorizontal } from 'lucide-react';
import { useGraph } from '../app/graphcontext';

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

export const Panel = () => {
    const { 
        states, setStates, 
        transitions, setTransitions, 
        panelState, setPanelState, 
        draftEdge, setDraftEdge,
        panelDrag, setPanelDrag 
    } = useGraph();

    if (!panelState.isOpen) return null;

    const handlePanelDragMove = (e: any) => {
        if (!panelDrag.isDragging) return;
        const newX = Math.max(0, Math.min(window.innerWidth - 256, e.clientX - panelDrag.offsetX));
        const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - panelDrag.offsetY));
        setPanelState((prev: any) => ({ ...prev, x: newX, y: newY }));
    };

    return (
        <div className="fixed z-50 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden" style={{ left: panelState.x, top: panelState.y }}>
            
            {/* Draggable Header */}
            <div 
                className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700 cursor-move hover:bg-neutral-700/80 transition-colors"
                onPointerDown={(e: any) => { 
                    e.stopPropagation(); 
                    e.target.setPointerCapture(e.pointerId); 
                    setPanelDrag({ isDragging: true, offsetX: e.clientX - panelState.x, offsetY: e.clientY - panelState.y }); 
                }}
                onPointerMove={handlePanelDragMove}
                onPointerUp={(e: any) => { 
                    e.target.releasePointerCapture(e.pointerId); 
                    setPanelDrag({ isDragging: false, offsetX: 0, offsetY: 0 }); 
                }}
            >
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider pointer-events-none">
                    <GripHorizontal className="inline w-3 h-3 mr-2 text-neutral-500"/> 
                    {panelState.type === 'node' ? 'Edit Node' : panelState.type === 'new-transition' ? 'Create Edge' : 'Edit Edge'}
                </span>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setPanelState((prev: any) => ({ ...prev, isOpen: false }))} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="p-4 space-y-4">
                {panelState.type === 'node' ? (
                    <>
                        <div>
                            <label className="text-xs text-neutral-500">ID</label>
                            <input disabled value={panelState.targetId} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm text-neutral-500" />
                        </div>
                        <label className="flex justify-between text-sm items-center">
                            Accept State
                            <input type="checkbox" checked={states.find((s: any) => s.id === panelState.targetId)?.isAccept || false} onChange={(e) => {
                                setStates(states.map((s: any) => s.id === panelState.targetId ? { ...s, isAccept: e.target.checked } : s));
                            }} />
                        </label>
                        <Button className="w-full text-red-400" onClick={() => { 
                            setStates(states.filter((s: any) => s.id !== panelState.targetId)); 
                            setTransitions(transitions.filter((t: any) => t.from !== panelState.targetId && t.to !== panelState.targetId)); 
                            setPanelState((prev: any) => ({ ...prev, isOpen: false })); 
                        }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Node
                        </Button>
                    </>
                ) : panelState.type === 'new-transition' ? (
                    <>
                        <div className="flex gap-2 items-center">
                            <select value={draftEdge.from} onChange={(e) => setDraftEdge({...draftEdge, from: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm">
                                {states.map((s: any) => <option key={`f-${s.id}`}>{s.id}</option>)}
                            </select>
                            <MoveRight className="w-4 h-4 text-neutral-500" />
                            <select value={draftEdge.to} onChange={(e) => setDraftEdge({...draftEdge, to: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm">
                                {states.map((s: any) => <option key={`t-${s.id}`}>{s.id}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500">Symbols (comma separated)</label>
                            <input autoFocus value={draftEdge.symbol} onChange={(e) => setDraftEdge({...draftEdge, symbol: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm text-white" placeholder="e.g. a, b" />
                        </div>
                        <Button primary className="w-full bg-blue-400 text-black font-bold hover:bg-blue-500 border-transparent" onClick={() => { 
                            setTransitions([...transitions, { id: `t${Date.now()}`, from: draftEdge.from, to: draftEdge.to, symbol: draftEdge.symbol }]);
                            setPanelState((prev: any) => ({ ...prev, isOpen: false })); 
                        }}>
                            <Save className="w-4 h-4 mr-2" /> Save Edge
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex gap-2 items-center">
                            <select value={transitions.find((t: any) => t.id === panelState.targetId)?.from} onChange={(e) => setTransitions(transitions.map((t: any) => t.id === panelState.targetId ? { ...t, from: e.target.value } : t))} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm">
                                {states.map((s: any) => <option key={`f-${s.id}`}>{s.id}</option>)}
                            </select>
                            <MoveRight className="w-4 h-4 text-neutral-500" />
                            <select value={transitions.find((t: any) => t.id === panelState.targetId)?.to} onChange={(e) => setTransitions(transitions.map((t: any) => t.id === panelState.targetId ? { ...t, to: e.target.value } : t))} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm">
                                {states.map((s: any) => <option key={`t-${s.id}`}>{s.id}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500">Symbols (comma separated)</label>
                            <input value={transitions.find((t: any) => t.id === panelState.targetId)?.symbol || ''} onChange={(e) => setTransitions(transitions.map((t: any) => t.id === panelState.targetId ? { ...t, symbol: e.target.value } : t))} className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-sm text-white" placeholder="e.g. a, b" />
                        </div>
                        <Button className="w-full text-red-400" onClick={() => { 
                            setTransitions(transitions.filter((t: any) => t.id !== panelState.targetId)); 
                            setPanelState((prev: any) => ({ ...prev, isOpen: false })); 
                        }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Edge
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};