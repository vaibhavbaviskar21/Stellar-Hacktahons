"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Upload, CheckCircle2 } from "lucide-react"
import { mockCandidateData } from "@/lib/mock-data"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockCandidateData.documents)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your uploaded credentials and files</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Card className="border-primary bg-primary/10">
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>Add a resume, certificate, or portfolio file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">Drag and drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Select File
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-border bg-card/50 hover:bg-card/70 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{doc.name}</h3>
                      {doc.verified && (
                        <Badge className="bg-accent/20 text-accent border-accent/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.uploadedDate}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>IPFS: {doc.ipfsCid.substring(0, 12)}...</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{documents.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{documents.filter((d) => d.verified).length}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12.4 MB</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
