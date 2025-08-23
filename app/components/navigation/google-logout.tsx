"use client"
import { Logout } from '@/lib/actions/authgoogle'
import { Session } from 'next-auth'
import React from 'react'

const userButton = ({ user }: Session) => {
  return (
    <div>
      <h1></h1>
      <button onClick={() => Logout()}>Sign out from google sir</button>
    </div>
  )
}
export default userButton