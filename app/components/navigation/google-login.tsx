"use client"
import { Login } from '@/lib/actions/authgoogle'
import { Session } from 'next-auth'


import React from 'react'

const userButton = ({user}:Session) => {
  return (
    <div>
        <h1></h1>
        <button onClick={() => Login()}>Sign in to google sir</button>
    </div>
  )
}

export default userButton