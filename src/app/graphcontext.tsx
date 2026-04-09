import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const GraphContext = createContext<any>(null);

export const useGraph = () => useContext(GraphContext);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [states, setStates] = useState<any[]>([]);
  const [transitions, setTransitions] = useState<any[]>([]);
  const [startState, setStartState] = useState('');
  const [testString, setTestString] = useState("");
  
  const [playbackStatus, setPlaybackStatus] = useState<"Idle" | "Animating" | "Pass" | "Fail" | "Error">("Idle");
  const [trace, setTrace] = useState<string[]>([]);
  const [simMessage, setSimMessage] = useState("");
  const [animStep, setAnimStep] = useState(-1);
  
  const [dragInfo, setDragInfo] = useState({ id: null as string | null, startX: 0, startY: 0, moved: false });
  const [panelState, setPanelState] = useState({ isOpen: false, type: 'node', targetId: '', x: 0, y: 0 });
  const [panelDrag, setPanelDrag] = useState({ isDragging: false, offsetX: 0, offsetY: 0 });
  const [draftEdge, setDraftEdge] = useState({ from: '', to: '', symbol: '' });
  const value = {
    states, setStates,
    transitions, setTransitions,
    startState, setStartState,
    testString, setTestString,
    playbackStatus, setPlaybackStatus,
    trace, setTrace,
    simMessage, setSimMessage,
    animStep, setAnimStep,
    dragInfo, setDragInfo,
    panelState, setPanelState,
    panelDrag, setPanelDrag,
    draftEdge, setDraftEdge
  };

  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  );
};