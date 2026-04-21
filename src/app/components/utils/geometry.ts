export const calculatePath = (fromNode: any, toNode: any, hasReverse: boolean) => {
  let d, textX, textY;
  
  // Dynamically calculate distance from the center to the edge of the smaller oval
  const getEllipseRadius = (node: any, dx: number, dy: number) => {
    const charCount = node.id ? String(node.id).length : 1;
    const width = Math.max(48, charCount * 8 + 24); 
    const rx = width / 2;
    const ry = 24; // Fixed height is now 48px (ry = 24)
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return 24;
    
    const dirX = dx / dist;
    const dirY = dy / dist;
    
    return 1 / Math.sqrt(Math.pow(dirX / rx, 2) + Math.pow(dirY / ry, 2));
  };

  if (fromNode.id === toNode.id) {
    // Self loop (brought closer to the smaller node)
    d = `M ${fromNode.x - 12} ${fromNode.y - 22} C ${fromNode.x - 30} ${fromNode.y - 80}, ${fromNode.x + 30} ${fromNode.y - 80}, ${fromNode.x + 12} ${fromNode.y - 22}`;
    textX = fromNode.x; 
    textY = fromNode.y - 65; 
  } 
  
  else if (hasReverse) {
    // Curved edge for two-way transitions
    const dx = toNode.x - fromNode.x; 
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return { d: "", textX: 0, textY: 0 };
    
    const cx = (fromNode.x + toNode.x) / 2 + (dy / dist) * 30;
    const cy = (fromNode.y + toNode.y) / 2 - (dx / dist) * 30;
    
    const rFrom = getEllipseRadius(fromNode, cx - fromNode.x, cy - fromNode.y);
    const rTo = getEllipseRadius(toNode, toNode.x - cx, toNode.y - cy);
    
    const startX = fromNode.x + ((cx - fromNode.x) / Math.hypot(cx - fromNode.x, cy - fromNode.y)) * rFrom;
    const startY = fromNode.y + ((cy - fromNode.y) / Math.hypot(cx - fromNode.x, cy - fromNode.y)) * rFrom;
    
    const endX = toNode.x - ((toNode.x - cx) / Math.hypot(toNode.x - cx, toNode.y - cy)) * rTo;
    const endY = toNode.y - ((toNode.y - cy) / Math.hypot(toNode.x - cx, toNode.y - cy)) * rTo;
    
    d = `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;
    
    textX = cx + (dy / dist) * 12; 
    textY = cy - (dx / dist) * 12 + 4; 
  } 
  
  else {
    // Standard straight edge
    const dx = toNode.x - fromNode.x; 
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return { d: "", textX: 0, textY: 0 };

    const rFrom = getEllipseRadius(fromNode, dx, dy);
    const rTo = getEllipseRadius(toNode, dx, dy);

    const startX = fromNode.x + (dx / dist) * rFrom; 
    const startY = fromNode.y + (dy / dist) * rFrom;
    const endX = toNode.x - (dx / dist) * rTo; 
    const endY = toNode.y - (dy / dist) * rTo;
    
    d = `M ${startX} ${startY} L ${endX} ${endY}`;
    
    textX = (startX + endX) / 2 - (dy / dist) * 12; 
    textY = (startY + endY) / 2 + (dx / dist) * 12 + 4;
  }
  
  return { d, textX, textY };
};