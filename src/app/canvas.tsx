import React, { useCallback } from 'react';
import { calculatePath } from '../app/components/utils/geometry';
import { useGraph } from '../app/graphcontext';

export const GraphCanvas = () => {
    const { 
        states, setStates, 
        transitions, 
        startState, 
        dragInfo, setDragInfo, 
        panelState, setPanelState, 
        animStep, trace, testString
    } = useGraph();

    const handlePointerDown = useCallback((e: any, id: string) => {
        e.stopPropagation(); 
        e.target.setPointerCapture(e.pointerId);
        setDragInfo({ id, startX: e.clientX, startY: e.clientY, moved: false });
    }, [setDragInfo]);

    const handlePointerMove = useCallback((e: any) => {
        if (!dragInfo.id) return;
        if (Math.abs(e.clientX - dragInfo.startX) > 2 || Math.abs(e.clientY - dragInfo.startY) > 2 || dragInfo.moved) {
            setDragInfo((prev: any) => ({ ...prev, startX: e.clientX, startY: e.clientY, moved: true }));
            setStates((prev: any[]) => prev.map(s => 
                s.id === dragInfo.id 
                ? { ...s, x: s.x + (e.clientX - dragInfo.startX), y: s.y + (e.clientY - dragInfo.startY) } 
                : s
            ));
        }
    }, [dragInfo, setDragInfo, setStates]);

    const handlePointerUp = useCallback((e: any) => {
        if (!dragInfo.id) return;
        e.target.releasePointerCapture(e.pointerId);
        
        if (!dragInfo.moved) {
            setPanelState({ 
                isOpen: true, 
                type: 'node', 
                targetId: dragInfo.id, 
                x: Math.min(window.innerWidth - 300, Math.max(20, e.clientX + 20)), 
                y: Math.min(window.innerHeight - 300, Math.max(20, e.clientY - 60)) 
            });
        }
        setDragInfo({ id: null, startX: 0, startY: 0, moved: false });
    }, [dragInfo, setPanelState, setDragInfo]);

    const activeAnimTransitionId = animStep >= 0 && animStep % 2 === 1 
        ? transitions.find((t: any) => 
            t.from === trace[Math.floor(animStep / 2)] && 
            t.to === trace[Math.floor(animStep / 2) + 1] && 
            t.symbol.includes(testString[Math.floor(animStep / 2)])
          )?.id 
        : null;

    return (
        <div 
            className="relative h-[650px] w-full bg-[#0a0a0a] overflow-hidden select-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
            onPointerMove={handlePointerMove} 
            onPointerUp={handlePointerUp} 
            onPointerLeave={handlePointerUp} 
            onClick={() => setPanelState((prev: any) => ({ ...prev, isOpen: false }))}
        >
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#737373" /></marker>
                    <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" /></marker>
                </defs>
                
                {transitions.map((t: any) => {
                    if (dragInfo.moved && (dragInfo.id === t.from || dragInfo.id === t.to)) return null; 
                    
                    const fromNode = states.find((s: any) => s.id === t.from);
                    const toNode = states.find((s: any) => s.id === t.to);
                    if (!fromNode || !toNode) return null;

                    const hasReverse = transitions.some((other: any) => other.from === t.to && other.to === t.from && t.from !== t.to);
                    const { d, textX, textY } = calculatePath(fromNode, toNode, hasReverse);
                    
                    if (!d) return null;
                    
                    const isActive = panelState.isOpen && panelState.targetId === t.id;
                    const isAnim = activeAnimTransitionId === t.id;
                    const color = isAnim ? "#3b82f6" : isActive ? "#f5f5f5" : "#737373";

                    return (
                        <g key={t.id} onClick={(e) => { e.stopPropagation(); setPanelState({ isOpen: true, type: 'transition', targetId: t.id, x: e.clientX - 128, y: e.clientY - 100 }); }} className="cursor-pointer group">
                            <path d={d} stroke="transparent" strokeWidth="25" fill="none" />
                            <path d={d} stroke={color} strokeWidth="2" fill="none" markerEnd={`url(#${isAnim ? 'arrow-active' : 'arrow'})`} className="group-hover:stroke-neutral-400 transition-colors" />
                            <rect x={textX - 12} y={textY - 14} width="24" height="20" rx="4" fill="#0a0a0a" opacity="0.8" />
                            <text x={textX} y={textY} fill={color} fontSize="13" textAnchor="middle" className="font-mono">{t.symbol || '?'}</text>
                        </g>
                    );
                })}
            </svg>

            {states.map((s: any) => (
                <div key={s.id} onPointerDown={(e) => handlePointerDown(e, s.id)} className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing group" style={{ left: s.x - 40, top: s.y - 40 }}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all 
                        ${s.isAccept ? 'border-neutral-300' : 'border-neutral-600'} 
                        ${panelState.isOpen && panelState.targetId === s.id ? 'bg-neutral-800 border-white' : 'bg-neutral-900 group-hover:bg-neutral-800'}
                        ${animStep >= 0 && animStep % 2 === 0 && trace[Math.floor(animStep / 2)] === s.id ? 'border-blue-500 bg-blue-950 scale-110 z-10' : ''}`}>
                        
                        {s.isAccept && <div className="absolute inset-1.5 rounded-full border-2 border-neutral-300"></div>}
                        <span className="text-lg font-bold">{s.id}</span>
                    </div>
                    {startState === s.id && <div className="absolute -bottom-6 px-2 py-0.5 bg-neutral-800 rounded text-[10px] font-bold text-neutral-400">START</div>}
                </div>
            ))}
        </div>
    );
};