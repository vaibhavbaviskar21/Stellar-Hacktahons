"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, FileText, Star } from "lucide-react"
import { mockRecruiterData } from "@/lib/mock-data"

export default function SearchPage() {
  const [candidates, setCandidates] = useState(mockRecruiterData.candidates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = !selectedSkill || c.skills.includes(selectedSkill)
    return matchesSearch && matchesSkill
  })

  const allSkills = Array.from(new Set(candidates.flatMap((c) => c.skills)))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Find Candidates</h1>
        <p className="text-muted-foreground mt-1">Search and filter verified talent</p>
      </div>

      {/* Search and Filters */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Filter by Skills</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSkill(null)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedSkill === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedSkill === skill
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="border-border bg-card/50 hover:bg-card/70 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.title}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Experience:</span> {candidate.experience} years
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Location:</span> {candidate.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-foreground">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} className="bg-primary/20 text-primary border-primary/30 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent" />
                      <span className="text-foreground">{candidate.reputation}</span>
                    </div>
                    <div className="text-muted-foreground">{candidate.documentsVerified} documents verified</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Request Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card className="border-border bg-card/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No candidates found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
