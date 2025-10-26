"use client"
import React, { useEffect, useState } from 'react'
import { connectFreighter, getFreighterPublicKey, isFreighterAvailable, signAndSubmitPayment, debugFreighterGlobals } from '@/lib/wallet'
import TxViewer from './TxViewer'

export default function WalletButton() {
  const [mounted, setMounted] = useState(false)
  const [available, setAvailable] = useState(false)
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [manualPk, setManualPk] = useState<string>('')
  const [debugList, setDebugList] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    setAvailable(isFreighterAvailable())
    try { setDebugList(debugFreighterGlobals()) } catch (_) { setDebugList([]) }
  }, [])

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return <div className="h-10 w-40 animate-pulse bg-gray-200 rounded" />
  }

  async function connect() {
    setErr(null)
    try {
      const pk = await connectFreighter()
      setPubkey(pk)
    } catch (e: any) {
      setErr(e?.message || String(e))
    }
  }

  async function loadPubkey() {
    setErr(null)
    try {
      const pk = await getFreighterPublicKey()
      setPubkey(pk)
    } catch (e: any) {
      setErr(e?.message || String(e))
    }
  }

  async function sendTestPayment() {
    setErr(null)
    setTxHash(null)
    setLoading(true)
    try {
      if (!pubkey) await loadPubkey()
      const dest = pubkey || manualPk || (await getFreighterPublicKey())
      const res = await signAndSubmitPayment('0.00001', dest)
      setTxHash(res.hash)
    } catch (e: any) {
      setErr(e?.message || String(e))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {!pubkey && (
        <button 
          onClick={connect} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Connect Wallet
        </button>
      )}
      {pubkey && (
        <div className="space-y-2">
          <div className="text-sm">
            Connected: <code className="text-xs bg-secondary px-2 py-1 rounded">{pubkey.substring(0, 8)}...{pubkey.substring(pubkey.length - 8)}</code>
          </div>
          <button 
            onClick={sendTestPayment} 
            disabled={loading} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Payment'}
          </button>
        </div>
      )}
      {err && <div className="text-red-500 text-sm">{err}</div>}
      {txHash && <TxViewer hash={txHash as string} />}
    </div>
  )
}
