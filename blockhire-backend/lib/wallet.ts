import { TransactionBuilder, Networks, Operation, Server, Asset } from 'stellar-sdk'

const HORIZON = 'https://horizon-testnet.stellar.org'
const NETWORK = Networks.TESTNET

function getFreighter(): any {
  if (typeof window === 'undefined') return null
  const w = window as any
  const candidates = ['freighterApi', 'freighter', 'Freighter', '__freighter', 'stellarFreighter']
  for (const c of candidates) {
    if (w[c]) return w[c]
  }
  for (const k of Object.keys(w)) {
    try {
      const v = w[k]
      if (v && (typeof v.getPublicKey === 'function' || typeof v.connect === 'function' || typeof v.request === 'function')) return v
    } catch (_) {}
  }
  return null
}

export function debugFreighterGlobals(): string[] {
  if (typeof window === 'undefined') return []
  const w = window as any
  return Object.keys(w).filter(k => /freighter/i.test(k) || /freighter/i.test(String(k)))
}

export function isFreighterAvailable(): boolean {
  return !!getFreighter()
}

export async function connectFreighter(): Promise<string> {
  const freighter = getFreighter()
  if (!freighter) throw new Error('Freighter not available')
  try {
    if (freighter.connect) await freighter.connect()
    if (freighter.getPublicKey) return await freighter.getPublicKey()
    if (freighter.request) return await freighter.request({ method: 'getPublicKey' })
    throw new Error('Freighter API missing expected methods')
  } catch (e: any) {
    throw new Error('Failed to connect to Freighter: ' + e?.message)
  }
}

export async function getFreighterPublicKey(): Promise<string> {
  const freighter = getFreighter()
  if (!freighter) throw new Error('Freighter not available')
  if (freighter.getPublicKey) return await freighter.getPublicKey()
  if (freighter.request) return await freighter.request({ method: 'getPublicKey' })
  throw new Error('Freighter getPublicKey not available')
}

export async function signAndSubmitPayment(amount: string, destination: string): Promise<{ hash: string }> {
  const freighter = getFreighter()
  if (!freighter) throw new Error('Freighter not available')

  const pk = await getFreighterPublicKey()
  const server = new Server(HORIZON)
  const account = await server.loadAccount(pk)

  const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: NETWORK })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount }))
    .setTimeout(30)
    .build()

  let signedXdr: any = null
  try {
    if (freighter.signTransaction) {
      signedXdr = await freighter.signTransaction(tx.toXDR(), NETWORK)
      if (signedXdr && signedXdr.signedTransaction) signedXdr = signedXdr.signedTransaction
    } else if (freighter.request) {
      const resp = await freighter.request({ method: 'signTransaction', params: { transactionXDR: tx.toXDR(), networkPassphrase: NETWORK } })
      signedXdr = resp?.signedTransaction || resp
    }
  } catch (e) {}

  if (!signedXdr) throw new Error('Unable to sign transaction with Freighter from this page — Freighter API variant not detected.')

  const txXdr = typeof signedXdr === 'string' ? signedXdr : signedXdr.tx

  const body = new URLSearchParams()
  body.append('tx', txXdr)
  const r = await fetch(HORIZON + '/transactions', { method: 'POST', body: body.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error('Horizon submit failed: ' + txt)
  }
  const data = await r.json()
  return { hash: data.hash }
}

export async function buildPaymentXDR(amount: string, destination: string): Promise<string> {
  const pk = await getFreighterPublicKey()
  const server = new Server(HORIZON)
  const account = await server.loadAccount(pk)
  const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: NETWORK })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount }))
    .setTimeout(30)
    .build()
  return tx.toXDR()
}
