/**
 * Parses an iframe string or URL and returns a clean URL and attributes
 */
export function extractIframeSrc(iframeHtmlOrUrl) {
  if (!iframeHtmlOrUrl) return '';
  const trimmed = iframeHtmlOrUrl.trim();
  let src = trimmed;

  if (trimmed.startsWith('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      src = match[1];
    }
  }

  if (src.startsWith('/games/')) {
    src = `.${src}`;
  }

  return src;
}

/**
 * Ensures an iframe string has full permissions for gaming
 */
export function buildIframeSnippet(src, title) {
  return `<iframe src="${src}" title="${title}" allow="fullscreen; autoplay; gamepad; keyboard-map" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`;
}
