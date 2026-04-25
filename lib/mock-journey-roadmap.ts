import roadmapResponse from "@/lib/mock-journey-roadmap.json"

export type JourneyStageId =
  | "initiation"
  | "current-processing"
  | "validation"
  | "final-output"

export type JourneyStageStatus =
  | "completed"
  | "active"
  | "locked"

export type JourneyStageIconKey =
  | "file-search"
  | "cpu"
  | "shield-check"
  | "flag"

export type JourneyStageScreen =
  | "eligibility-check"
  | "current-processing"
  | "validation"
  | "final-output"

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
