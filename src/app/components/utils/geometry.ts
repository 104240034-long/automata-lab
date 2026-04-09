export const calculatePath = (fromNode: any, toNode: any, hasReverse: boolean) => {
  let d, textX, textY;
  
  if (fromNode.id === toNode.id) {

    d = `M ${fromNode.x - 15} ${fromNode.y - 35} C ${fromNode.x - 30} ${fromNode.y - 100}, ${fromNode.x + 30} ${fromNode.y - 100}, ${fromNode.x + 15} ${fromNode.y - 35}`;
    textX = fromNode.x; 
    textY = fromNode.y - 85; 
  } 
  
  else if (hasReverse) {
    const dx = toNode.x - fromNode.x; 
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return { d: "", textX: 0, textY: 0 };
    
    const cx = (fromNode.x + toNode.x) / 2 + (dy / dist) * 40;
    const cy = (fromNode.y + toNode.y) / 2 - (dx / dist) * 40;
    
    d = `M ${fromNode.x + ((cx - fromNode.x) / Math.hypot(cx - fromNode.x, cy - fromNode.y)) * 40} ${fromNode.y + ((cy - fromNode.y) / Math.hypot(cx - fromNode.x, cy - fromNode.y)) * 40} Q ${cx} ${cy} ${toNode.x - ((toNode.x - cx) / Math.hypot(toNode.x - cx, toNode.y - cy)) * 40} ${toNode.y - ((toNode.y - cy) / Math.hypot(toNode.x - cx, toNode.y - cy)) * 40}`;
    
    textX = cx + (dy / dist) * 15; 
    textY = cy - (dx / dist) * 15 + 5; 
  } 
  
  else {
    const dx = toNode.x - fromNode.x; 
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return { d: "", textX: 0, textY: 0 };

    const startX = fromNode.x + (dx / dist) * 40; 
    const startY = fromNode.y + (dy / dist) * 40;
    const endX = toNode.x - (dx / dist) * 40; 
    const endY = toNode.y - (dy / dist) * 40;
    
    d = `M ${startX} ${startY} L ${endX} ${endY}`;
    
    textX = (startX + endX) / 2 - (dy / dist) * 15; 
    textY = (startY + endY) / 2 + (dx / dist) * 15 + 5;
  }
  
  return { d, textX, textY };
};