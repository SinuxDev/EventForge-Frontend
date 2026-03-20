export function toPublicMediaUrl(input?: string): string {
  if (!input) {
    return '';
  }

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  if (input.startsWith('/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    const origin = apiBase.replace(/\/api(?:\/v\d+)?\/?$/, '');
    return `${origin}${input}`;
  }

  return input;
}
