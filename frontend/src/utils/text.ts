export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  const finalText = lastSpaceIndex > maxLength * 0.8 
    ? truncated.substring(0, lastSpaceIndex) 
    : truncated;
    
  return finalText + '...';
};
