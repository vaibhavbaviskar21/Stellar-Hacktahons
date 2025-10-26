"use client"
import React, { useEffect, useState } from 'react'
import { connectFreighter, getFreighterPublicKey, isFreighterAvailable, signAndSubmitPayment, debugFreighterGlobals } from '../lib/wallet'
import TxViewer from './TxViewer'

export default function WalletButton() {
  const [available, setAvailable] = useState(false)
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [manualPk, setManualPk] = useState<string>('')
  const [debugList, setDebugList] = useState<string[]>([])

  useEffect(() => {
    setAvailable(isFreighterAvailable())
    try { setDebugList(debugFreighterGlobals()) } catch (_) { setDebugList([]) }
  }, [])

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
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {!available && <div>Freighter not detected. Please install the Freighter extension.</div>}
      {available && !pubkey && (
        <button onClick={connect} className="btn">Connect Freighter</button>
      )}
      {available && pubkey && (
        <div>
          <div>Connected: <code style={{ fontSize: 12 }}>{pubkey}</code></div>
          <div style={{ marginTop: 6 }}>
            <button onClick={sendTestPayment} disabled={loading} className="btn">{loading ? 'Sending' : 'Send Test Payment'}</button>
          </div>
        </div>
      )}
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <div style={{ marginLeft: 12 }}>
        <div style={{ fontSize: 12, color: '#666' }}>Debug globals matching "freighter": {debugList.length ? debugList.join(', ') : '<none>'}</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          Console check (paste in browser console):
          <span style={{ display: 'inline-block', marginLeft: 6 }}>
            <code>typeof window.freighter</code>, <code>typeof window.freighterApi</code>, <code>{'Object.keys(window).filter(k => /freighter/i.test(k))'}</code>
          </span>
        </div>
        <div style={{ marginTop: 6 }}>
          <input placeholder="Manual public key (dev)" value={manualPk} onChange={e => setManualPk(e.target.value)} style={{ fontSize: 12, padding: '6px 8px', width: 260 }} />
        </div>
      </div>
      {txHash && <TxViewer hash={txHash as string} />}
    </div>
  )
}
