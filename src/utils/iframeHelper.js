/**
 * Parses an iframe string or URL and returns a clean URL and attributes
 */
export function extractIframeSrc(iframeHtmlOrUrl) {
  if (!iframeHtmlOrUrl) return '';
  const trimmed = iframeHtmlOrUrl.trim();
  
  // If it's already a simple URL or path
  if (!trimmed.startsWith('<iframe') && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/'))) {
    return trimmed;
  }

  // Extract src from <iframe src="...">
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}

/**
 * Ensures an iframe string has full permissions for gaming
 */
export function buildIframeSnippet(src, title) {
  return `<iframe src="${src}" title="${title}" allow="fullscreen; autoplay; gamepad; keyboard-map" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`;
}
