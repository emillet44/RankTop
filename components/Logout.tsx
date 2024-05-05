'use client'

import { signOut } from "next-auth/react"

//This is a simple button that calls Next Auth's signOut API on click. It reduces the number of imports throughout the headers, and since its a client component,
//it was also necessary to keep it seperate from the headers(all server components), since they call server actions, and client components are not allowed to call
//server actions(Nextjs fetch waterfall error)
export function Logout() {
    return (
        <button onClick={() => signOut({ callbackUrl: "/" })} className="absolute right-3 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">Log Out</button>
    )
}
