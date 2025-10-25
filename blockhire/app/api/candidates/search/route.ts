import { type NextRequest, NextResponse } from "next/server"
import { mockRecruiterData } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""
  const skills = searchParams.get("skills")?.split(",") || []
  const location = searchParams.get("location")?.toLowerCase() || ""

  let results = mockRecruiterData.candidates

  // Filter by search query (name or title)
  if (query) {
    results = results.filter((c) => c.name.toLowerCase().includes(query) || c.title.toLowerCase().includes(query))
  }

  // Filter by skills
  if (skills.length > 0) {
    results = results.filter((c) => skills.some((skill) => c.skills.includes(skill)))
  }

  // Filter by location
  if (location) {
    results = results.filter((c) => c.location.toLowerCase().includes(location))
  }

  return NextResponse.json(results)
}
