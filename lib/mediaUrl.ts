/**
 * Résout une URL de média backend.
 * Si l'URL est déjà absolue (http/https), elle est retournée telle quelle.
 * Si elle est relative (/uploads/...), elle est préfixée avec NEXT_PUBLIC_API_URL.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  return `${base}${url}`;
}