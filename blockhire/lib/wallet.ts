import * as StellarSdk from 'stellar-sdk'

const HORIZON = 'https://horizon-testnet.stellar.org'
const NETWORK = StellarSdk.Networks.TESTNET
const SELECTED_WALLET_ID = 'selectedWalletId'

// Lazy import to avoid SSR hydration issues
let StellarWalletsKit: any = null
let WalletNetwork: any = null
let allowAllModules: any = null
let FREIGHTER_ID: any = null

// Initialize StellarWalletsKit (client-side only)
let kit: any = null

async function loadWalletKit() {
  if (typeof window === 'undefined') {
    throw new Error('Wallet kit only available in browser')
  }
  if (!StellarWalletsKit) {
    const module = await import('@creit.tech/stellar-wallets-kit')
    StellarWalletsKit = module.StellarWalletsKit
    WalletNetwork = module.WalletNetwork
    allowAllModules = module.allowAllModules
    FREIGHTER_ID = module.FREIGHTER_ID
  }
}

async function getKit() {
  await loadWalletKit()
  if (!kit) {
    const selectedId = localStorage.getItem(SELECTED_WALLET_ID)
    kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: selectedId || FREIGHTER_ID,
      modules: allowAllModules(),
    })
  }
  return kit
}

export function debugFreighterGlobals(): string[] {
  if (typeof window === 'undefined') return []
  const w = window as any
  return Object.keys(w).filter(k => /freighter/i.test(k))
}

export function isFreighterAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    // StellarWalletsKit handles detection internally
    return true
  } catch {
    return false
  }
}

export async function connectFreighter(): Promise<string> {
  const k = await getKit()
  // Open modal to select wallet (Freighter or others)
  await k.openModal({
    onWalletSelected: async (option: any) => {
      localStorage.setItem(SELECTED_WALLET_ID, option.id)
      k.setWallet(option.id)
    }
  })
  const { address } = await k.getAddress()
  return address
}

export async function getFreighterPublicKey(): Promise<string> {
  const k = await getKit()
  const { address } = await k.getAddress()
  return address
}

export async function signAndSubmitPayment(amount: string, destination: string): Promise<{ hash: string }> {
  const k = await getKit()
  const pk = await getFreighterPublicKey()
  const server = new StellarSdk.Horizon.Server(HORIZON)
  const account = await server.loadAccount(pk)

  const tx = new StellarSdk.TransactionBuilder(account, { fee: '100', networkPassphrase: NETWORK })
    .addOperation(StellarSdk.Operation.payment({ destination, asset: StellarSdk.Asset.native(), amount }))
    .setTimeout(30)
    .build()

  // Sign with StellarWalletsKit
  const { signedTxXdr } = await k.signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK,
    address: pk,
  })

  // Submit to Horizon
  const body = new URLSearchParams()
  body.append('tx', signedTxXdr)
  const r = await fetch(HORIZON + '/transactions', {
    method: 'POST',
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error('Horizon submit failed: ' + txt)
  }
  const data = await r.json()
  return { hash: data.hash }
}

export async function buildPaymentXDR(amount: string, destination: string): Promise<string> {
  const pk = await getFreighterPublicKey()
  const server = new StellarSdk.Horizon.Server(HORIZON)
  const account = await server.loadAccount(pk)
  const tx = new StellarSdk.TransactionBuilder(account, { fee: '100', networkPassphrase: NETWORK })
    .addOperation(StellarSdk.Operation.payment({ destination, asset: StellarSdk.Asset.native(), amount }))
    .setTimeout(30)
    .build()
  return tx.toXDR()
}
