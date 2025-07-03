export function getApiUrl(path: string): string {
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise fall back to window.location.origin for client-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                 (typeof window !== 'undefined' ? window.location.origin : '');

  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}