// // middleware.ts
// import { NextResponse } from 'next/server';
// import { NextRequest, NextFetchEvent } from 'next/server';

// const publicPaths = ['/', '/solutions', '/resources', '/what-we-do-support', '/sign-in', '/sign-up', '/auth/callback'];

// export function middleware(req: NextRequest, ev?: NextFetchEvent): NextResponse | undefined {
//     const { pathname } = req.nextUrl;
//     if (publicPaths.includes(pathname) || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
//         return NextResponse.next();
//     }

//     const authCookie = req.cookies.get('stack-auth')?.value;
//     if (!authCookie) {
//         return NextResponse.redirect(new URL('/sign-in', req.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };