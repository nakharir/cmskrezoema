import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    
    // Pengecualian untuk path login dan auth
    if (path.startsWith('/auth/')) {
        return NextResponse.next()
    }
    
    // Ambil data user dari cookies
    const userInfo = request.cookies.get('user-info')?.value
    
    if (!userInfo) {
        // Jika tidak ada user info, redirect ke login
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
        const user = JSON.parse(userInfo)
        
        // Cek role/akses berdasarkan path
        if (path === '/') {
            if (user.status === 2 || user.status === 3) {
                return NextResponse.next()
            } else if (user.status === 1) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        }

        if (path.startsWith('/admin')) {
            if (user.status === 1) {
                return NextResponse.next()
            }
        }

        // Jika role tidak sesuai dengan path yang diakses
        return NextResponse.redirect(new URL('/auth/access', request.url))
        
    } catch (error) {
        // Jika terjadi error parsing JSON
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}

export const config = {
    matcher: [
        '/',
        '/admin/:path*', 
        '/auth/:path*'
    ]
}

