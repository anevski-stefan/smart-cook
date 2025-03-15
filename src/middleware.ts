import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Create a response early so we can modify headers
    const res = NextResponse.next();
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if expired - this will automatically refresh if expired
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      // Don't throw the error - let the request continue
      // The client-side auth state will handle redirects if needed
    }

    // If we have a session, add the user's role to the headers
    if (session) {
      res.headers.set('x-user-role', session.user.role || 'authenticated');
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return the response without blocking the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 