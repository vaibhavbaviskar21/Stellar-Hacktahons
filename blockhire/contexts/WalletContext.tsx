"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { connectFreighter, getFreighterPublicKey } from '@/lib/wallet'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet was previously connected
  useEffect(() => {
    const savedKey = localStorage.getItem('walletPublicKey')
    if (savedKey) {
      setPublicKey(savedKey)
    }
  }, [])

  const connect = async () => {
    setConnecting(true)
    setError(null)
    try {
      const pk = await connectFreighter()
      setPublicKey(pk)
      localStorage.setItem('walletPublicKey', pk)
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet')
      throw e
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setPublicKey(null)
    localStorage.removeItem('walletPublicKey')
    localStorage.removeItem('selectedWalletId')
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!publicKey,
        publicKey,
        connecting,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
