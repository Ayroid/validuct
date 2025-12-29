export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/home',
    '/idea/new',
    '/:username',
    '/settings/:path*',
  ],
};