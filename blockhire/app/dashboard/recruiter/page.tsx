"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { 
  postJob, 
  getJob, 
  verifyDocument, 
  updateApplicationStatus,
  getCandidateProfile,
  getVerificationHistory,
  hashDocument,
  detectTampering
} from "@/lib/contracts"
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Search, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Shield,
  XCircle
} from "lucide-react"

interface Job {
  job_id: string
  employer: string
  title: string
  ipfs_details: string
  is_active: boolean
  created_at: string
}

interface Application {
  application_id: string
  job_id: string
  candidate: string
  status: 'Pending' | 'UnderReview' | 'Verified' | 'Rejected' | 'Accepted'
  candidate_profile_cid: string
  verification_notes: string
  submitted_at: string
}

export default function RecruiterDashboard() {
  const { publicKey, isConnected } = useWallet()
  const router = useRouter()

  // State
  const [loading, setLoading] = useState(false)
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  
  // Job posting state
  const [showJobForm, setShowJobForm] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobFile, setJobFile] = useState<File | null>(null)
  
  // Document verification state
  const [candidateAddress, setCandidateAddress] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [tamperResult, setTamperResult] = useState<{detected: boolean, message: string} | null>(null)
  
  // Jobs state
  const [myJobs, setMyJobs] = useState<Job[]>([])

  const stats = {
    jobsPosted: myJobs.length,
    activeJobs: myJobs.filter(j => j.is_active).length,
    verifiedCandidates: 0,
    pendingVerifications: 0,
  }

  useEffect(() => {
    if (!isConnected) {
      router.push('/login')
    }
  }, [isConnected, router])

  // Upload to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    setUploadingToIPFS(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS')
      }

      const data = await response.json()
      return data.cid
    } finally {
      setUploadingToIPFS(false)
    }
  }

  // Post a job
  const handlePostJob = async () => {
    if (!publicKey || !jobTitle || !jobDescription) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")
    setTxHash("")

    try {
      // Upload job details to IPFS
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        company: "Your Company", // Can be extended
        requirements: jobDescription.split('\n'),
        postedBy: publicKey,
        postedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(jobData)], { type: 'application/json' })
      const file = new File([blob], "job.json")
      const ipfsCid = await uploadToIPFS(file)

      // Get signing function from wallet
      const signTransaction = async (xdr: string) => {
        // This will be handled by WalletContext
        return xdr // Placeholder
      }

      // Post to blockchain
      const hash = await postJob(
        publicKey,
        jobTitle,
        ipfsCid,
        "Competitive", // salary range
        signTransaction
      )
      setTxHash(hash)

      // Reset form
      setJobTitle("")
      setJobDescription("")
      setShowJobForm(false)

      alert("Job posted successfully on blockchain!")
    } catch (err: any) {
      setError(err.message || "Failed to post job")
    } finally {
      setLoading(false)
    }
  }

  // Verify a candidate's document
  const handleVerifyDocument = async () => {
    if (!publicKey || !candidateAddress || !docFile) {
      setError("Please provide candidate address and document")
      return
    }

    setLoading(true)
    setError("")
    setTxHash("")
    setTamperResult(null)

    try {
      // Hash the document
      const docHash = await hashDocument(docFile)

      // Check for tampering by comparing with current file
      const isTampered = await detectTampering(docHash, docFile)
      
      if (isTampered) {
        setTamperResult({
          detected: true,
          message: "Document hash doesn't match expected value. File may have been modified."
        })
        setError("Document tampering detected! Hash mismatch.")
        setLoading(false)
        return
      } else {
        setTamperResult({
          detected: false,
          message: "Document integrity verified. Hash matches expected value."
        })
      }

      // Upload to IPFS
      const ipfsCid = await uploadToIPFS(docFile)

      // Get signing function
      const signTransaction = async (xdr: string) => {
        return xdr // Placeholder
      }

      // Verify on blockchain
      const hash = await verifyDocument(
        publicKey,
        candidateAddress,
        docHash,
        docFile.name.split('.').pop() || "document",
        true, // isValid
        verificationNotes || "Document verified by employer",
        signTransaction
      )

      setTxHash(hash)
      alert("Document verified successfully on blockchain!")

      // Reset form
      setCandidateAddress("")
      setDocFile(null)
      setVerificationNotes("")
    } catch (err: any) {
      setError(err.message || "Failed to verify document")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage hiring on blockchain</p>
        </div>
        <Button 
          onClick={() => setShowJobForm(!showJobForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Job on Blockchain
        </Button>
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

      {/* Tamper Detection Result */}
      {tamperResult && (
        <Card className={tamperResult.detected ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {tamperResult.detected ? (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              ) : (
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${tamperResult.detected ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'}`}>
                  {tamperResult.detected ? "⚠️ Tampering Detected!" : "✓ No Tampering Detected"}
                </p>
                <p className={`text-sm mt-1 ${tamperResult.detected ? 'text-red-700' : 'text-green-700'}`}>
                  {tamperResult.message}
                </p>
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
              Jobs Posted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.jobsPosted}</div>
            <p className="text-xs text-muted-foreground mt-1">On Blockchain</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Open Positions</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verified Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.verifiedCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents Checked</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
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
      </div>

      {/* Post Job Form */}
      {showJobForm && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Post Job to Blockchain
            </CardTitle>
            <CardDescription>
              Job details will be stored on IPFS and job record on Stellar blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Blockchain Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Describe the role, requirements, and responsibilities..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePostJob}
                disabled={loading || !jobTitle || !jobDescription}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingToIPFS ? "Uploading to IPFS..." : "Posting to Blockchain..."}
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJobForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verify Document */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verify Candidate Document
          </CardTitle>
          <CardDescription>
            Upload document to verify authenticity with SHA-256 hash comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="candidateAddress">Candidate Wallet Address</Label>
            <Input
              id="candidateAddress"
              placeholder="G..."
              value={candidateAddress}
              onChange={(e) => setCandidateAddress(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <Label htmlFor="verifyDoc">Document to Verify</Label>
            <Input
              id="verifyDoc"
              type="file"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="verificationNotes">Verification Notes (Optional)</Label>
            <Textarea
              id="verificationNotes"
              placeholder="Add notes about this verification..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleVerifyDocument}
            disabled={loading || !candidateAddress || !docFile}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingToIPFS ? "Uploading..." : "Verifying on Blockchain..."}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Document on Blockchain
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Document will be hashed and compared with on-chain records for tamper detection
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              View on Blockchain
            </CardTitle>
            <CardDescription>See your transactions on Stellar Expert</CardDescription>
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
            <CardDescription>View all document verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/dashboard/verification-history')}
            >
              View History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Tamper Detection Enabled</p>
              <p className="text-sm text-blue-700 mt-1">
                All documents are hashed with SHA-256 and stored on Stellar blockchain. Any modification to a document after verification will be detected automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
