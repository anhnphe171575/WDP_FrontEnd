"use client"

import React from 'react'
import Messages from '@/components/chatbox/Messages'
import Header from '@/components/layout/Header'

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <Messages />
      </div>
    </div>
  )
}