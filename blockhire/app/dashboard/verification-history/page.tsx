"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { getVerificationHistory, detectTampering, hashDocument } from "@/lib/contracts"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Search,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react"

interface VerificationRecord {
  record_id: string
  document_hash: string
  candidate: string
  verifier: string
  verification_status: boolean
  notes: string
  timestamp: string
}

export default function VerificationHistoryPage() {
  const { publicKey, isConnected } = useWallet()
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "rejected">("all")

  useEffect(() => {
    if (publicKey) {
      loadHistory()
    }
  }, [publicKey])

  const loadHistory = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      // Get verification history for this user (as verifier or candidate)
      const history = await getVerificationHistory(publicKey, publicKey)
      setRecords(history)
    } catch (err) {
      console.error("Failed to load verification history:", err)
      setRecords([]) // Set empty array if failed
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    // Filter by status
    if (filterStatus === "verified" && !record.verification_status) return false
    if (filterStatus === "rejected" && record.verification_status) return false

    // Filter by search address
    if (searchAddress && !record.candidate.includes(searchAddress) && !record.verifier.includes(searchAddress)) {
      return false
    }

    return true
  })

  const formatDate = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Verification History</h1>
        <p className="text-muted-foreground">
          Immutable audit trail of all document verifications on Stellar blockchain
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="searchAddress">Search by Address</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="searchAddress"
                  placeholder="G..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            <div>
              <Label>Filter by Status</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className="flex-1"
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "verified" ? "default" : "outline"}
                  onClick={() => setFilterStatus("verified")}
                  className="flex-1"
                  size="sm"
                >
                  Verified
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  onClick={() => setFilterStatus("rejected")}
                  className="flex-1"
                  size="sm"
                >
                  Rejected
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={loadHistory} disabled={loading} className="w-full">
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{records.length}</div>
            <p className="text-xs text-muted-foreground mt-1">On Blockchain</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.verification_status).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Documents Approved</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {records.filter(r => !r.verification_status).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Documents Rejected</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono text-foreground break-all">
              {formatAddress(publicKey || "")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Verification Records ({filteredRecords.length})
        </h2>

        {loading ? (
          <Card className="border-border bg-card/50">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">Loading verification records...</div>
            </CardContent>
          </Card>
        ) : filteredRecords.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No verification records found. Start by verifying documents!
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.record_id} className="border-border bg-card/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Record ID: {record.record_id}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      record.verification_status
                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                        : "bg-red-500/10 text-red-700 border-red-500/20"
                    }
                  >
                    {record.verification_status ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Candidate Address</p>
                    <p className="font-mono text-xs mt-1 break-all">{record.candidate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Verifier Address</p>
                    <p className="font-mono text-xs mt-1 break-all">{record.verifier}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Document Hash (SHA-256)</p>
                    <p className="font-mono text-xs mt-1 break-all bg-muted p-2 rounded">
                      {record.document_hash}
                    </p>
                  </div>
                  {record.notes && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Notes</p>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://stellar.expert/explorer/testnet/account/${record.verifier}`,
                        "_blank"
                      )
                    }
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Verifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://stellar.expert/explorer/testnet/account/${record.candidate}`,
                        "_blank"
                      )
                    }
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Candidate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Immutable Audit Trail
              </p>
              <p className="text-sm text-blue-700 mt-1">
                All verification records are permanently stored on Stellar blockchain. Document
                hashes are computed with SHA-256, making any tampering immediately detectable. This
                creates a trustless verification system where employers and candidates can verify
                document authenticity without relying on third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
