import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { documentId, ipfsCid } = body

  // In production, this would verify the document hash on the blockchain
  const isVerified = ipfsCid && ipfsCid.startsWith("Qm")

  return NextResponse.json({
    documentId,
    verified: isVerified,
    verifiedAt: new Date().toISOString(),
    blockchainHash: isVerified ? `0x${Math.random().toString(16).slice(2)}` : null,
  })
}
