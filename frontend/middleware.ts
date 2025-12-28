export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/timeline',
    '/new-idea',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
