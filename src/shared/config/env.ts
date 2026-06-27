export const env = {
  apiUrl:
    import.meta.env.VITE_API_URL ?? 'https://uiren-backend.onrender.com/api',
} as const;
