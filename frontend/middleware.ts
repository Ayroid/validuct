export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/new-idea',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
