import axiosInstance from "@/lib/axiosinstance"
import {
  normalizeProject,
  type Project,
  type ProjectStatus,
} from "@/lib/projects-data"

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type ApiProjectUser = {
  userId?: string
  fullName?: string
  email?: string
  phoneNumber?: string
  isActive?: boolean
}

type ApiProjectService = {
  serviceId?: string
  title?: string
  serviceName?: string
}

type ApiProjectSubService = {
  subServiceId?: string
  title?: string
  subServiceName?: string
}

type ApiProjectStage = {
  stageId?: string
  label?: string
  route?: string
}

export type ApiProject = {
  projectId: string
  userId?: string
  subServiceId?: string
  projectStageId?: string
  projectStatus?: string
  isDeleted?: boolean
  user?: ApiProjectUser
  service?: ApiProjectService
  subService?: ApiProjectSubService
  projectStage?: ApiProjectStage
  agents?: unknown[]
  createdAt?: string
  updatedAt?: string
}

type ApiEligibilityStep = {
  step?: number
  label?: string
  completed?: boolean
}

export type ApiEligibility = {
  eligibilityId?: string
  projectId?: string
  status?: string
  currentStep?: number
  updatedAt?: string
  applicantAndProperty?: {
    applicantDetails?: {
      firstName?: string
      middleName?: string
      lastName?: string
      emailAddress?: string
      phoneNumber?: string
    }
    propertyAndOwnership?: {
      nearConservationAreaOrListedBuilding?: string
      ownershipStatus?: string
      propertyType?: string
      purposeOfDevelopment?: string
    }
  }
  worksAndMaterials?: {
    descriptionOfWorks?: {
      propsedWorksDescription?: string
    }
    materials?: {
      wallMaterials?: string
      roofMaterials?: string
      materialsMatchExisting?: string
      colourOrFinishNotes?: string
    }
  }
  siteConstraints?: {
    accessAndParking?: {
      accessOrParkingChanges?: string
      newOrAlteredAccess?: string
    }
    floodAndEnvironmentalRisk?: {
      isSiteInFloodRiskArea?: string
    }
    heritageAndListing?: {
      isListedBuilding?: string
      isInConservationArea?: string
    }
    treesHedgesLandscaping?: {
      treesWithTPO?: string
    }
  }
  utilitiesAndConsents?: {
    additionalConsents?: string
    communityConsultation?: string
  }
  completionStatus?: {
    totalSteps?: number
    completedSteps?: number
    percentage?: number
    nextStep?: number
    steps?: ApiEligibilityStep[]
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data)
  ) {
    const apiMessage = error.response.data.message
    if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
      return apiMessage
    }
  }

  return fallback
}

const safeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

const joinNonEmpty = (
  values: Array<unknown>,
  separator = " "
) =>
  values
    .map((value) => safeString(value))
    .filter(Boolean)
    .join(separator)

const toStatusLabel = (value: string) => {
  const cleaned = value.trim()
  if (!cleaned) return ""

  return cleaned
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const toProjectStatus = (
  status: string,
  isDeleted: boolean
): ProjectStatus => {
  if (isDeleted) return "Closed"

  switch (status.trim().toLowerCase()) {
    case "completed":
      return "Completed"
    case "closed":
    case "cancelled":
    case "canceled":
    case "archived":
      return "Closed"
    default:
      return "In Progress"
  }
}

const buildApplicantName = (
  project: ApiProject,
  eligibility?: ApiEligibility | null
) => {
  const applicantName = joinNonEmpty(
    [
      eligibility?.applicantAndProperty?.applicantDetails?.firstName,
      eligibility?.applicantAndProperty?.applicantDetails?.middleName,
      eligibility?.applicantAndProperty?.applicantDetails?.lastName,
    ],
    " "
  )

  return applicantName || safeString(project.user?.fullName)
}

const buildContactDetails = (eligibility?: ApiEligibility | null) => {
  const email = safeString(
    eligibility?.applicantAndProperty?.applicantDetails?.emailAddress
  )
  const phone = safeString(
    eligibility?.applicantAndProperty?.applicantDetails?.phoneNumber
  )

  return [email, phone].filter(Boolean).join(" / ")
}

const buildConservationOrListed = (
  eligibility?: ApiEligibility | null
) => {
  const propertyAnswer = safeString(
    eligibility?.applicantAndProperty?.propertyAndOwnership
      ?.nearConservationAreaOrListedBuilding
  )
  const conservationAnswer = safeString(
    eligibility?.siteConstraints?.heritageAndListing
      ?.isInConservationArea
  )
  const listedAnswer = safeString(
    eligibility?.siteConstraints?.heritageAndListing?.isListedBuilding
  )

  return (
    propertyAnswer ||
    joinNonEmpty(
      [
        conservationAnswer && `Conservation: ${conservationAnswer}`,
        listedAnswer && `Listed: ${listedAnswer}`,
      ],
      " | "
    )
  )
}

const buildMaterialsSummary = (eligibility?: ApiEligibility | null) =>
  joinNonEmpty(
    [
      eligibility?.worksAndMaterials?.materials?.wallMaterials,
      eligibility?.worksAndMaterials?.materials?.roofMaterials,
      eligibility?.worksAndMaterials?.materials?.materialsMatchExisting,
      eligibility?.worksAndMaterials?.materials?.colourOrFinishNotes,
    ],
    ", "
  )

const buildNextStepLabel = (eligibility?: ApiEligibility | null) => {
  if (!eligibility) return ""

  const nextStep = eligibility.completionStatus?.nextStep
  if (typeof nextStep !== "number") return ""

  return (
    eligibility.completionStatus?.steps?.find(
      (step) => step.step === nextStep
    )?.label ?? ""
  )
}

const mapEligibilityToQuestionnaire = (
  eligibility?: ApiEligibility | null
): Project["clientQuestionnaire"] | undefined => {
  if (!eligibility) return undefined

  return {
    propertyDetails: {
      applicantFullName: joinNonEmpty(
        [
          eligibility.applicantAndProperty?.applicantDetails?.firstName,
          eligibility.applicantAndProperty?.applicantDetails?.middleName,
          eligibility.applicantAndProperty?.applicantDetails?.lastName,
        ],
        " "
      ),
      contactEmailOrPhone: buildContactDetails(eligibility),
      propertyType: safeString(
        eligibility.applicantAndProperty?.propertyAndOwnership
          ?.propertyType
      ),
      ownershipStatus: safeString(
        eligibility.applicantAndProperty?.propertyAndOwnership
          ?.ownershipStatus
      ),
      conservationOrListed: buildConservationOrListed(eligibility),
      purposeOfDevelopment: safeString(
        eligibility.applicantAndProperty?.propertyAndOwnership
          ?.purposeOfDevelopment
      ),
    },
    dimensions: {
      externalMaterials: buildMaterialsSummary(eligibility),
      briefDescription: safeString(
        eligibility.worksAndMaterials?.descriptionOfWorks
          ?.propsedWorksDescription
      ),
    },
    constraints: {
      listedBuilding: safeString(
        eligibility.siteConstraints?.heritageAndListing
          ?.isListedBuilding
      ),
      tpo: safeString(
        eligibility.siteConstraints?.treesHedgesLandscaping?.treesWithTPO
      ),
      floodZone: safeString(
        eligibility.siteConstraints?.floodAndEnvironmentalRisk
          ?.isSiteInFloodRiskArea
      ),
      vehicleAccess:
        safeString(
          eligibility.siteConstraints?.accessAndParking
            ?.newOrAlteredAccess
        ) ||
        safeString(
          eligibility.siteConstraints?.accessAndParking
            ?.accessOrParkingChanges
        ),
      additionalConsentsRequired: safeString(
        eligibility.utilitiesAndConsents?.additionalConsents
      ),
      neighbourConsultationRequired: safeString(
        eligibility.utilitiesAndConsents?.communityConsultation
      ),
    },
  }
}

export const mapApiProjectToProject = (
  apiProject: ApiProject,
  eligibility?: ApiEligibility | null
): Project => {
  const applicantName = buildApplicantName(apiProject, eligibility)
  const nextStepLabel = buildNextStepLabel(eligibility)
  const percentage = eligibility?.completionStatus?.percentage ?? 0
  const completedSteps = eligibility?.completionStatus?.completedSteps ?? 0
  const totalSteps = eligibility?.completionStatus?.totalSteps ?? 0

  return normalizeProject({
    id: safeString(apiProject.projectId),
    serviceId: safeString(apiProject.service?.serviceId),
    serviceName:
      safeString(apiProject.service?.serviceName) ||
      safeString(apiProject.service?.title) ||
      safeString(apiProject.subService?.title) ||
      "Untitled service",
    serviceTitle: safeString(apiProject.service?.title),
    subServices: [
      safeString(apiProject.subService?.title) ||
        safeString(apiProject.subService?.subServiceName),
    ].filter(Boolean),
    subServiceTitle: safeString(apiProject.subService?.title),
    clientQuestionnaire: mapEligibilityToQuestionnaire(eligibility),
    clientName: applicantName || safeString(apiProject.user?.fullName),
    applicantName,
    location: "",
    postcode: "",
    documentSubServices: [],
    cadSubServices: [],
    drawings: [],
    documents: [],
    uploadedDocuments: [],
    deliverables: [],
    assignees: [],
    documentAssignee: "",
    drawingAssignee: "",
    accessUsers: [],
    documentStatuses: {},
    drawingStatuses: {},
    documentsSentToAgentX: false,
    documentsSentAt: "",
    uploadedDrawings: [],
    drawingsSentToAgentX: false,
    drawingsSentAt: "",
    messages: [],
    status: toProjectStatus(
      safeString(apiProject.projectStatus),
      Boolean(apiProject.isDeleted)
    ),
    acceptance: "Pending",
    projectStageId:
      safeString(apiProject.projectStageId) ||
      safeString(apiProject.projectStage?.stageId),
    projectStageLabel: safeString(apiProject.projectStage?.label),
    projectStageRoute: safeString(apiProject.projectStage?.route),
    projectStatusRaw: safeString(apiProject.projectStatus),
    isDeleted: Boolean(apiProject.isDeleted),
    eligibilityId: safeString(eligibility?.eligibilityId),
    eligibilityStatus: eligibility
      ? toStatusLabel(safeString(eligibility.status) || "in_progress")
      : "Not Started",
    eligibilityProgress: Math.max(0, Math.min(100, percentage)),
    eligibilityCompletedSteps: completedSteps,
    eligibilityTotalSteps: totalSteps,
    eligibilityNextStepLabel: nextStepLabel,
    eligibilityUpdatedAt: safeString(eligibility?.updatedAt),
    createdAt: safeString(apiProject.createdAt),
    origin: "Agent X",
    destination: "Agent Y (India)",
    startAt: safeString(apiProject.createdAt),
    endAt: "",
  })
}

export const fetchAdminProjects = async (): Promise<ApiProject[]> => {
  const response = await axiosInstance.get<ApiEnvelope<ApiProject[]>>(
    "/projects/all"
  )

  return Array.isArray(response.data?.data) ? response.data.data : []
}

export const fetchEligibilityByProjectId = async (
  projectId: string
): Promise<ApiEligibility | null> => {
  try {
    const response = await axiosInstance.get<ApiEnvelope<ApiEligibility>>(
      `/eligibility/${projectId}`
    )

    return isRecord(response.data?.data)
      ? (response.data.data as ApiEligibility)
      : null
  } catch {
    return null
  }
}

export const fetchAdminProjectsWithEligibility = async () => {
  try {
    const apiProjects = await fetchAdminProjects()

    const eligibilityEntries = await Promise.all(
      apiProjects.map(async (project) => [
        project.projectId,
        await fetchEligibilityByProjectId(project.projectId),
      ] as const)
    )

    const eligibilityByProjectId = new Map(eligibilityEntries)

    return apiProjects.map((project) =>
      mapApiProjectToProject(
        project,
        eligibilityByProjectId.get(project.projectId) ?? null
      )
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch projects from the API.")
    )
  }
}

export const fetchProjectWithEligibility = async (
  projectId: string
) => {
  try {
    const projects = await fetchAdminProjects()
    const matchedProject = projects.find(
      (project) => project.projectId === projectId
    )

    if (!matchedProject) {
      return null
    }

    const eligibility = await fetchEligibilityByProjectId(projectId)

    return mapApiProjectToProject(matchedProject, eligibility)
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch the requested project.")
    )
  }
}
