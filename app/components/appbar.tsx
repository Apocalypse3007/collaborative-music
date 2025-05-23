"use client"

import { signIn, useSession, signOut } from "next-auth/react"
export default function AppBar() {
    const session = useSession()
    return (
        <div>
            <div className="flex justify-between items-center text-amber-50 bg-gray-800 p-4">
                <div>
                Music App
                </div>
                <div>
                    {session.data?.user && (
                        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded">
                            Sign Out
                        </button>
                    )}
                    <button onClick={() => signIn()} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )
}