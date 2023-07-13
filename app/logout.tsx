'use client'

import { signOut } from "next-auth/react"

export function Logout() {
    return (
        <button onClick={() => signOut()} className="absolute right-3 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Log Out</button>
    )
}