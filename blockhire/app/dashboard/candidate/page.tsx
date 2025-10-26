"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Calendar, TrendingUp, Lock, Upload, Eye, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { registerCandidateProfile, addDocument, hashDocument, getCandidateProfile } from "@/lib/contracts"
import { useRouter } from "next/navigation"

export default function CandidateDashboard() {
  const { isConnected, publicKey } = useWallet()
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Profile registration form
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [skills, setSkills] = useState("")
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false)
  
  // Document upload
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docType, setDocType] = useState("resume")
  
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    interviewsScheduled: 0,
    reputationScore: 0,
    accessRequests: 0,
    isVerified: false,
  })

  // Load candidate profile from blockchain
  useEffect(() => {
    if (isConnected && publicKey) {
      loadProfile()
    }
  }, [isConnected, publicKey])

  async function loadProfile() {
    try {
      const profileData = await getCandidateProfile(publicKey!)
      if (profileData) {
        setProfile(profileData)
        setStats(prev => ({
          ...prev,
          isVerified: profileData.is_verified,
          documentsUploaded: profileData.verification_count || 0
        }))
      }
    } catch (err) {
      console.error("Error loading profile:", err)
    }
  }

  // Upload file to IPFS (backend proxy)
  async function uploadToIPFS(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('http://localhost:4000/upload-ipfs', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('IPFS upload failed')
    const data = await response.json()
    return data.cid
  }

  // Register profile on blockchain
  async function handleRegisterProfile() {
    if (!resumeFile || !publicKey) return
    
    setLoading(true)
    setError(null)
    setTxHash(null)
    
    try {
      // 1. Upload resume to IPFS
      setUploadingToIPFS(true)
      const ipfsCid = await uploadToIPFS(resumeFile)
      setUploadingToIPFS(false)
      
      // 2. Hash skills for integrity
      const skillsHash = await hashDocument(new Blob([skills]))
      
      // 3. Call smart contract
      const hash = await registerCandidateProfile(
        publicKey,
        ipfsCid,
        skillsHash,
        async (xdr: string) => {
          // Sign transaction with StellarWalletsKit
          const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit')
          const kit = new StellarWalletsKit({
            network: 'testnet' as any,
            selectedWalletId: localStorage.getItem('selectedWalletId') || 'freighter'
          } as any)
          const { signedTxXdr } = await kit.signTransaction(xdr)
          return signedTxXdr
        }
      )
      
      setTxHash(hash)
      await loadProfile()
      
    } catch (err: any) {
      setError(err.message || 'Profile registration failed')
    } finally {
      setLoading(false)
      setUploadingToIPFS(false)
    }
  }

  // Add document to blockchain
  async function handleAddDocument() {
    if (!docFile || !publicKey) return
    
    setLoading(true)
    setError(null)
    setTxHash(null)
    
    try {
      // 1. Upload to IPFS
      setUploadingToIPFS(true)
      const ipfsCid = await uploadToIPFS(docFile)
      setUploadingToIPFS(false)
      
      // 2. Hash document
      const docHash = await hashDocument(docFile)
      
      // 3. Add to blockchain
      const hash = await addDocument(
        publicKey,
        docHash,
        docType,
        ipfsCid,
        async (xdr: string) => {
          const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit')
          const kit = new StellarWalletsKit({
            network: 'testnet' as any,
            selectedWalletId: localStorage.getItem('selectedWalletId') || 'freighter'
          } as any)
          const { signedTxXdr } = await kit.signTransaction(xdr)
          return signedTxXdr
        }
      )
      
      setTxHash(hash)
      setDocFile(null)
      await loadProfile()
      
    } catch (err: any) {
      setError(err.message || 'Document upload failed')
    } finally {
      setLoading(false)
      setUploadingToIPFS(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Manage your blockchain-verified profile</p>
        </div>
        {stats.isVerified && (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            <CheckCircle className="w-4 h-4 mr-1" /> Verified Profile
          </Badge>
        )}
      </div>

      {/* Transaction Status */}
      {txHash && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Transaction Successful!</p>
                <a 
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:underline mt-1 inline-block"
                >
                  View on Stellar Expert →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents On-Chain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.documentsUploaded}</div>
            <p className="text-xs text-muted-foreground mt-1">Blockchain Verified</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.isVerified ? "✓" : "−"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.isVerified ? "Profile Verified" : "Not Verified"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Wallet Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono text-foreground break-all">
              {publicKey?.substring(0, 8)}...{publicKey?.substring(publicKey.length - 8)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your Identity</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {profile ? "Active" : "New"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile ? "On Blockchain" : "Not Registered"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Register Profile (if not registered) */}
      {!profile && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Register Your Profile on Blockchain
            </CardTitle>
            <CardDescription>
              Upload your resume and register your profile on Stellar blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resume">Resume (PDF/DOC)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="JavaScript, React, Solidity, etc."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleRegisterProfile}
              disabled={loading || !resumeFile || !skills}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingToIPFS ? "Uploading to IPFS..." : "Registering on Blockchain..."}
                </>
              ) : (
                "Register Profile on Blockchain"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Document (if registered) */}
      {profile && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Add Document to Blockchain
            </CardTitle>
            <CardDescription>
              Upload a document with cryptographic hash for tamper detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="docType">Document Type</Label>
              <select
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md"
              >
                <option value="resume">Resume</option>
                <option value="degree">Degree/Certificate</option>
                <option value="certificate">Professional Certificate</option>
                <option value="portfolio">Portfolio</option>
              </select>
            </div>

            <div>
              <Label htmlFor="document">Document File</Label>
              <Input
                id="document"
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleAddDocument}
              disabled={loading || !docFile}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingToIPFS ? "Uploading to IPFS..." : "Adding to Blockchain..."}
                </>
              ) : (
                "Add Document to Blockchain"
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Document will be hashed with SHA-256 and stored on Stellar blockchain for tamper detection
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Info */}
      {profile && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Blockchain Profile</CardTitle>
            <CardDescription>Your profile data stored on Stellar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">IPFS CID</p>
                <p className="font-mono text-xs mt-1">{profile.ipfs_cid || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verification Count</p>
                <p className="font-medium mt-1">{profile.verification_count || 0} documents</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium mt-1">
                  {profile.created_at ? new Date(Number(profile.created_at) * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium mt-1">
                  {profile.updated_at ? new Date(Number(profile.updated_at) * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              View on Blockchain
            </CardTitle>
            <CardDescription>See your data on Stellar Expert</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${publicKey}`, '_blank')}
            >
              Open Stellar Explorer
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Verification History
            </CardTitle>
            <CardDescription>See document verification records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/dashboard/candidate/documents')}
            >
              View History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
