/**
 * Truncate text while preserving HTML tags
 */
export const truncateHtmlText = (html: string, maxLength: number = 150): string => {
  // First, create a temporary element to extract plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // If the plain text is shorter than maxLength, return original HTML
  if (plainText.length <= maxLength) {
    return html;
  }
  
  // For table content, try to preserve table structure if possible
  if (html.includes('<table>') || html.includes('<tr>') || html.includes('<td>')) {
    // If it's a table and too long, show a preview with a note
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/);
    if (tableMatch) {
      return html.substring(0, maxLength) + '... <em>(table content continues)</em>';
    }
  }
  
  // Otherwise, truncate the plain text and add ellipsis
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  const finalText = lastSpaceIndex > maxLength * 0.8 
    ? truncated.substring(0, lastSpaceIndex) 
    : truncated;
    
  return finalText + '...';
};

/**
 * Truncate plain text with ellipsis
 */
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
