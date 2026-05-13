import roadmapResponse from "@/lib/mock-journey-roadmap.json"

export type JourneyStageId =
  | "sop"
  | "responses-fee-pending-documents"
  | "documents-briefcase"
  | "compliance-briefcase"
  | "drawings-briefcase"
  | "submit-briefcase"

export type JourneyStageStatus =
  | "completed"
  | "active"
  | "locked"

export type JourneyStageIconKey =
  | "file-text"
  | "clipboard-list"
  | "file-search"
  | "file-check"
  | "ruler"
  | "flag"

export type JourneyStageScreen =
  | "sop"
  | "responses-fee-pending-documents"
  | "documents-briefcase"
  | "compliance-briefcase"
  | "drawings-briefcase"
  | "submit-briefcase"

export type JourneyStageApiItem = {
  id: JourneyStageId
  label: string
  iconKey: JourneyStageIconKey
  screen: JourneyStageScreen
  status: JourneyStageStatus
  canOpen: boolean
  title: string
  description: string
  nextStageId?: JourneyStageId
}

export type JourneyRoadmapApiResponse = {
  journeyName: string
  currentStageId: JourneyStageId
  stages: JourneyStageApiItem[]
}

const baseRoadmap =
  roadmapResponse as JourneyRoadmapApiResponse

export const getMockJourneyRoadmap =
  (): JourneyRoadmapApiResponse => ({
    ...baseRoadmap,
    stages: baseRoadmap.stages.map((stage) => ({ ...stage })),
  })

export const advanceMockJourneyStage = (
  roadmap: JourneyRoadmapApiResponse,
  nextStageId: JourneyStageId
): JourneyRoadmapApiResponse => {
  const nextStageIndex = roadmap.stages.findIndex(
    (stage) => stage.id === nextStageId
  )

  if (nextStageIndex === -1) {
    return roadmap
  }

  return {
    ...roadmap,
    currentStageId: nextStageId,
    stages: roadmap.stages.map((stage, index) => ({
      ...stage,
      status:
        index < nextStageIndex
          ? "completed"
          : index === nextStageIndex
          ? "active"
          : "locked",
      canOpen: index <= nextStageIndex,
    })),
  }
}
