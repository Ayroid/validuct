export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/home',
    '/new-idea',
    '/:username',
    '/settings/:path*',
  ],
};