"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react"
import {
  AlertCircle,
  Bot,
  Building2,
  Flag,
  FileSearch,
  FileText,
  FileCheck,
  Lock,
  Ruler,
  CheckCircle,
  Shield,
  Sparkles,
} from "lucide-react"
import ConstructionLoadingDock from "@/components/ConstructionLoadingDock"
import {
  advanceMockJourneyStage,
  getMockJourneyRoadmap,
  type JourneyRoadmapApiResponse,
  type JourneyStageApiItem,
  type JourneyStageIconKey,
  type JourneyStageId,
  type JourneyStageStatus,
} from "@/lib/mock-journey-roadmap"
import {
  PROJECTS_STORAGE_KEY,
  Project,
  initialProjects,
  normalizeProjects,
} from "@/lib/projects-data"
import { fetchProjectWithEligibility } from "@/lib/project-api"

type JourneyStep = JourneyStageApiItem & {
  icon: ElementType
}

type BriefcaseStageContentId = Extract<
  JourneyStageId,
  | "documents-briefcase"
  | "compliance-briefcase"
  | "drawings-briefcase"
>

type BriefcaseCardTone = "blue" | "emerald" | "amber"

type BriefcaseCard = {
  category: string
  title: string
  summary: string
  details: readonly string[]
  tone: BriefcaseCardTone
}

type BriefcaseStageContent = {
  eyebrow: string
  heading: string
  description: string
  notesTitle: string
  notes: readonly string[]
  cards: readonly BriefcaseCard[]
}

const JOURNEY_STAGE_ICON_MAP: Record<
  JourneyStageIconKey,
  ElementType
> = {
  "file-text": FileText,
  "file-search": FileSearch,
  "file-check": FileCheck,
  ruler: Ruler,
  flag: Flag,
}

type EligibilityQuestionItem = {
  question: string
  answer: string
}

type EligibilityQuestionSection = {
  title: string
  items: EligibilityQuestionItem[]
}

type ClientQuestionnaire = {
  propertyDetails?: {
    applicantFullName?: string
    contactEmailOrPhone?: string
    siteAddress?: string
    postcode?: string
    propertyType?: string
    ownershipStatus?: string
    conservationOrListed?: string
    purposeOfDevelopment?: string
  }
  dimensions?: {
    existingPropertyWidthM?: string
    existingPropertyDepthM?: string
    proposedExtensionDepthM?: string
    proposedExtensionHeightM?: string
    externalMaterials?: string
    briefDescription?: string
  }
  constraints?: {
    listedBuilding?: string
    tpo?: string
    floodZone?: string
    vehicleAccess?: string
    preApplicationAdvice?: string
    additionalConsentsRequired?: string
    heritageImpactAssessment?: string
    parkingImpact?: string
    neighbourConsultationRequired?: string
  }
}

type EligibilityProject = Project & {
  clientQuestionnaire?: ClientQuestionnaire
  clientName?: string
  location?: string
  postcode?: string
}

const ELIGIBILITY_STEP_ID: JourneyStageId = "sop"
const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"
const MISSING_VALUE = "Missing"
const NOTIFICATION_STORAGE_KEY =
  "ai4planning_workspace_notification"
const NOTIFICATION_EVENT = "ai4planning-notification"
const MISSING_TOKENS = new Set([
  MISSING_VALUE,
  "Not provided",
  "Don't know",
  "Not sure",
])

const SOP_AGENT_Y_CHECKLIST_SECTIONS = [
  {
    title: "1. Input Pack Review",
    tone: "blue" as const,
    items: [
      "Confirm the packet is redacted and contains no personal data.",
      "Review documentation status: received / missing.",
      "Review compliance status: pass / fail / pending.",
      "Review required drawings list and planning requirements.",
      "Review site visit outputs and risk flags, if provided.",
      "Route all follow-up communication through Agent X only.",
    ],
  },
  {
    title: "2. Documentation Verification",
    tone: "emerald" as const,
    items: [
      "Gas Safety Certificate (CP12): check date validity.",
      "Electrical Report (EICR): confirm satisfactory / unsatisfactory.",
      "EPC: confirm rating E or above.",
      "Fire Risk Assessment: check completeness.",
      "Existing planning permissions: confirm relevance.",
      "Management plan: review adequacy.",
      "Fit & Proper declaration: confirm presence only.",
      "Mark each item as Valid / Invalid / Missing / Requires Clarification.",
    ],
  },
  {
    title: "3. Compliance Analysis",
    tone: "amber" as const,
    items: [
      "Fire safety: alarms, fire doors, escape routes, and emergency lighting.",
      "Amenities: kitchen size, bathroom ratios, appliance adequacy, ventilation, and heating.",
      "Environmental: water supply, sewage and drainage, surface water, and waste storage.",
      "Space standards: bedroom sizes, communal space sizes, and overcrowding risk.",
      "Record status as Pass / Fail / Partial / Unknown.",
      "Add notes for missing evidence, non-compliant areas, upgrades, and extra surveys.",
    ],
  },
  {
    title: "4. Drawings Production",
    tone: "blue" as const,
    items: [
      "Prepare existing floor plans and proposed floor plans to scale.",
      "Prepare fire safety plan, elevations, location plan, and block/site plan.",
      "Include sections if structural changes are proposed.",
      "Use 1:50 or 1:100 for plans and 1:1250 for location plan.",
      "Show dimensions, fire symbols, north arrow, scale bar, and title block.",
      "Include red and blue planning boundaries.",
      "Output the full drawing set, drawing index, and any missing measurement notes.",
    ],
  },
  {
    title: "5. Planning Preparation",
    tone: "emerald" as const,
    items: [
      "Check whether use class change is required: C3 to C4 or Sui Generis.",
      "Check structural changes, external alterations, roof changes, and noise impact.",
      "Check waste and parking considerations.",
      "Prepare planning statement and design & access statement if required.",
      "Prepare HMO justification, amenity impact assessment, and noise assessment if applicable.",
      "Output a planning pack ready for Agent X review with any missing items listed.",
    ],
  },
  {
    title: "6. Risk and Issue Flagging",
    tone: "amber" as const,
    items: [
      "High risk: fire safety failures, substandard room sizes, missing planning permissions, EPC below Band E, drainage issues, structural concerns, overcrowding.",
      "Medium risk: missing documents, incomplete drawings, unverified compliance items.",
      "Low risk: minor layout inconsistencies and missing photos.",
      "Send the risk summary to Agent X only.",
    ],
  },
  {
    title: "7. Final Pack and Handover",
    tone: "blue" as const,
    items: [
      "Assemble verified documentation list, compliance summary, drawing set, planning documents, and risk assessment.",
      "Include notes for Agent X only and exclude personal data.",
      "Return the technical pack to Agent X for customer communication, final checks, and Newham Council submission.",
      "Do not contact the customer directly.",
    ],
  },
] as const

const BRIEFCASE_STAGE_CONTENT: Record<
  BriefcaseStageContentId,
  BriefcaseStageContent
> = {
  "documents-briefcase": {
    eyebrow: "Documentation (Redacted)",
    heading: "Technical Documentation Review",
    description:
      "Each document field is represented as a card for Agent Y to review technical validity only.",
    notesTitle: "Notes for Agent Y",
    notes: [
      "Review technical validity only: dates, ratings, and compliance.",
      "Flag any invalid or expired documents.",
      "Identify missing items requiring follow-up via Agent X.",
    ],
    cards: [
      {
        category: "Status Summary",
        title: "Gas Safety Certificate (CP12)",
        summary: "Received / Missing / Pending Verification",
        details: [
          "Status options: Received / Missing / Pending Verification.",
          "Review the certificate date validity only.",
          "Flag expired or invalid evidence through Agent X.",
        ],
        tone: "blue",
      },
      {
        category: "Status Summary",
        title: "Electrical Report (EICR)",
        summary: "Received / Missing / Pending Verification",
        details: [
          "Status options: Received / Missing / Pending Verification.",
          "Review the report for technical validity and current status.",
          "Flag any missing or invalid document for Agent X follow-up.",
        ],
        tone: "blue",
      },
      {
        category: "Status Summary",
        title: "Energy Performance Certificate (EPC)",
        summary: "Received / Missing / Pending Verification",
        details: [
          "Status options: Received / Missing / Pending Verification.",
          "Check the EPC rating and confirm compliance expectations.",
          "Flag expired, invalid, or missing evidence via Agent X.",
        ],
        tone: "blue",
      },
      {
        category: "Status Summary",
        title: "Fire Risk Assessment",
        summary: "Received / Missing / Not Applicable",
        details: [
          "Status options: Received / Missing / Not Applicable.",
          "Review completeness and relevance of the assessment only.",
          "Escalate missing or incomplete evidence to Agent X.",
        ],
        tone: "emerald",
      },
      {
        category: "Status Summary",
        title: "Existing Planning Permissions",
        summary: "Provided / None / Unknown",
        details: [
          "Status options: Provided / None / Unknown.",
          "Check whether any planning history supplied is technically relevant.",
          "Flag unclear or missing planning evidence for Agent X.",
        ],
        tone: "emerald",
      },
      {
        category: "Status Summary",
        title: "Fit & Proper Declaration",
        summary: "Provided / Missing",
        details: [
          "Status options: Provided / Missing.",
          "Confirm presence only. No personal-data review is required.",
          "Flag missing declarations via Agent X.",
        ],
        tone: "emerald",
      },
      {
        category: "Status Summary",
        title: "Ownership / Lease / Mortgage Consents",
        summary: "Provided / Missing / Not Required",
        details: [
          "Status options: Provided / Missing / Not Required.",
          "Review supporting consent evidence only where applicable.",
          "Flag missing consents or unclear evidence via Agent X.",
        ],
        tone: "amber",
      },
    ],
  },
  "compliance-briefcase": {
    eyebrow: "Compliance (Redacted)",
    heading: "Technical Compliance Review",
    description:
      "Each compliance field is mapped into its own review card for fire safety, amenities, environment, and space standards.",
    notesTitle: "Compliance Notes for Agent Y",
    notes: [
      "Highlight any non-compliant areas.",
      "Identify missing evidence such as photos, measurements, or certificates.",
      "Flag high-risk issues including fire safety, drainage, and overcrowding.",
      "Provide technical recommendations for Agent X to relay.",
    ],
    cards: [
      {
        category: "Fire Safety",
        title: "Smoke / Heat Alarm Layout",
        summary: "Provided / Missing / Requires Clarification",
        details: [
          "Status options: Provided / Missing / Requires Clarification.",
          "Review alarm layout evidence and identify unclear locations.",
        ],
        tone: "amber",
      },
      {
        category: "Fire Safety",
        title: "Fire Doors (FD30)",
        summary: "Confirmed / Unconfirmed",
        details: [
          "Status options: Confirmed / Unconfirmed.",
          "Check whether FD30 fire door evidence is present and clear.",
        ],
        tone: "amber",
      },
      {
        category: "Fire Safety",
        title: "Escape Routes",
        summary: "Compliant / Non-compliant / Unknown",
        details: [
          "Status options: Compliant / Non-compliant / Unknown.",
          "Highlight any escape route concerns or unknown evidence gaps.",
        ],
        tone: "amber",
      },
      {
        category: "Fire Safety",
        title: "Emergency Lighting",
        summary: "Required / Not Required / Evidence Missing",
        details: [
          "Status options: Required / Not Required / Evidence Missing.",
          "Check whether emergency lighting evidence is needed and supplied.",
        ],
        tone: "amber",
      },
      {
        category: "Amenities",
        title: "Kitchen Adequacy",
        summary: "Pass / Fail / Pending Evidence",
        details: [
          "Status options: Pass / Fail / Pending Evidence.",
          "Review kitchen size, layout, and appliance adequacy.",
        ],
        tone: "emerald",
      },
      {
        category: "Amenities",
        title: "Bathroom Ratio",
        summary: "Pass / Fail / Pending Evidence",
        details: [
          "Status options: Pass / Fail / Pending Evidence.",
          "Review the bathroom-to-occupant ratio using supplied evidence.",
        ],
        tone: "emerald",
      },
      {
        category: "Amenities",
        title: "Ventilation / Heating",
        summary: "Pass / Fail / Unknown",
        details: [
          "Status options: Pass / Fail / Unknown.",
          "Check whether ventilation and heating evidence is adequate.",
        ],
        tone: "emerald",
      },
      {
        category: "Environmental",
        title: "Water Supply",
        summary: "Verified / Unverified / Issues Reported",
        details: [
          "Status options: Verified / Unverified / Issues Reported.",
          "Review whether the water supply evidence is technically sufficient.",
        ],
        tone: "blue",
      },
      {
        category: "Environmental",
        title: "Sewage / Drainage",
        summary: "Verified / Unverified / Issues Reported",
        details: [
          "Status options: Verified / Unverified / Issues Reported.",
          "Flag drainage concerns or unverified evidence for Agent X.",
        ],
        tone: "blue",
      },
      {
        category: "Environmental",
        title: "Surface Water Drainage",
        summary: "Verified / Unverified / Issues Reported",
        details: [
          "Status options: Verified / Unverified / Issues Reported.",
          "Highlight any missing or problematic surface water evidence.",
        ],
        tone: "blue",
      },
      {
        category: "Environmental",
        title: "Waste Arrangements",
        summary: "Compliant / Non-compliant / Unknown",
        details: [
          "Status options: Compliant / Non-compliant / Unknown.",
          "Review waste storage and arrangements for compliance concerns.",
        ],
        tone: "blue",
      },
      {
        category: "Space Standards",
        title: "Bedroom Sizes",
        summary: "Pass / Fail / Pending Measurements",
        details: [
          "Status options: Pass / Fail / Pending Measurements.",
          "Review room sizes and flag overcrowding or missing measurements.",
        ],
        tone: "emerald",
      },
      {
        category: "Space Standards",
        title: "Communal Space",
        summary: "Pass / Fail / Pending Measurements",
        details: [
          "Status options: Pass / Fail / Pending Measurements.",
          "Review communal space provision and missing measurement evidence.",
        ],
        tone: "emerald",
      },
    ],
  },
  "drawings-briefcase": {
    eyebrow: "Drawings (Redacted)",
    heading: "Drawing Pack Review and Production",
    description:
      "Each drawing requirement, input, and Agent Y task is presented as a separate review card with a view action.",
    notesTitle: "Agent Y Drawing Tasks",
    notes: [
      "Produce the full technical drawing set to Newham standards.",
      "Ensure all plans include scale bar, north arrow, dimensions, title block, and fire safety symbols.",
      "Include red and blue boundary lines for planning.",
      "Flag missing measurements to Agent X and prepare the drawing index for submission.",
    ],
    cards: [
      {
        category: "Required Drawing Set",
        title: "Existing Floor Plans",
        summary: "To scale",
        details: [
          "Required drawing set item: Existing floor plans.",
          "Present at the correct scale and align with the technical pack.",
        ],
        tone: "blue",
      },
      {
        category: "Required Drawing Set",
        title: "Location Plan",
        summary: "1:1250",
        details: [
          "Required drawing set item: Location plan at 1:1250.",
          "Include north arrow and planning boundary information.",
        ],
        tone: "blue",
      },
      {
        category: "Required Drawing Set",
        title: "Block / Site Plan",
        summary: "Required",
        details: [
          "Required drawing set item: Block or site plan.",
          "Show site context and planning boundary lines clearly.",
        ],
        tone: "blue",
      },
      {
        category: "Inputs Provided",
        title: "Measurements",
        summary: "Complete / Partial / Missing",
        details: [
          "Status options: Complete / Partial / Missing.",
          "Flag missing measurements to Agent X before finalizing drawings.",
        ],
        tone: "emerald",
      },
      {
        category: "Inputs Provided",
        title: "Site Visit Data",
        summary: "Available / Not Available",
        details: [
          "Status options: Available / Not Available.",
          "Use the site visit data to support drawing accuracy where provided.",
        ],
        tone: "emerald",
      },
      {
        category: "Inputs Provided",
        title: "Photos",
        summary: "Provided / Missing",
        details: [
          "Status options: Provided / Missing.",
          "Flag missing photos that limit technical drawing confidence.",
        ],
        tone: "emerald",
      },
      {
        category: "Agent Y Task",
        title: "Technical Drawing Set",
        summary: "Produce to Newham standards",
        details: [
          "Produce the full technical drawing set to Newham standards.",
          "Keep the output consistent with the redacted planning pack.",
        ],
        tone: "amber",
      },
      {
        category: "Agent Y Task",
        title: "Mandatory Plan Elements",
        summary: "Scale Bar / North Arrow / Dimensions / Title Block / Fire Symbols / Boundaries",
        details: [
          "Ensure every required plan element is present.",
          "Include scale bar, north arrow, dimensions, title block, fire safety symbols, and red/blue boundaries.",
        ],
        tone: "amber",
      },
      {
        category: "Agent Y Task",
        title: "Drawing Index",
        summary: "Prepare for submission pack",
        details: [
          "Prepare the drawing index for the submission pack.",
          "List any missing measurements or unresolved input dependencies for Agent X.",
        ],
        tone: "amber",
      },
    ],
  },
}

const SUBMIT_BRIEFCASE_ITEM_DELAY_MS = 3000

const isMissingAnswer = (value: string) => {
  const trimmed = value.trim()
  return trimmed === "" || MISSING_TOKENS.has(trimmed)
}

const notifyAgentXRequiredDocs = (href: string) => {
  if (typeof window === "undefined") return
  const payload = {
    id: `agentx-required-${Date.now()}`,
    from: "Agent X",
    message: "Required documents are ready for your review.",
    timestamp: new Date().toISOString(),
    unread: true,
    href,
    targetId: "agent-x-followup",
  }
  try {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(payload)
    )
    window.dispatchEvent(new Event(NOTIFICATION_EVENT))
  } catch {
    // Ignore storage failures for static UI.
  }
}

const buildEligibilitySections = (
  project: EligibilityProject
): EligibilityQuestionSection[] => {
  const questionnaire = project.clientQuestionnaire

  return [
    {
      title: "Step 1: Property Details",
      items: [
        {
          question: "Property Type",
          answer:
            questionnaire?.propertyDetails?.propertyType ||
            MISSING_VALUE,
        },
        {
          question: "Ownership Status",
          answer:
            questionnaire?.propertyDetails?.ownershipStatus ||
            MISSING_VALUE,
        },
        {
          question: "Conservation Area or Listed Building?",
          answer:
            questionnaire?.propertyDetails
              ?.conservationOrListed || MISSING_VALUE,
        },
        {
          question: "Purpose of Development",
          answer:
            questionnaire?.propertyDetails
              ?.purposeOfDevelopment || MISSING_VALUE,
        },
      ],
    },
    {
      title: "Step 2: Dimensions",
      items: [
        {
          question: "Existing Property Width (m)",
          answer:
            questionnaire?.dimensions
              ?.existingPropertyWidthM || MISSING_VALUE,
        },
        {
          question: "Existing Property Depth (m)",
          answer:
            questionnaire?.dimensions
              ?.existingPropertyDepthM || MISSING_VALUE,
        },
        {
          question: "Proposed Extension Depth (m)",
          answer:
            questionnaire?.dimensions
              ?.proposedExtensionDepthM || MISSING_VALUE,
        },
        {
          question: "Proposed Extension Height (m)",
          answer:
            questionnaire?.dimensions
              ?.proposedExtensionHeightM || MISSING_VALUE,
        },
        {
          question: "External Materials",
          answer:
            questionnaire?.dimensions?.externalMaterials ||
            MISSING_VALUE,
        },
        {
          question: "Brief Description of Proposed Works",
          answer:
            questionnaire?.dimensions?.briefDescription ||
            MISSING_VALUE,
        },
      ],
    },
    {
      title: "Step 3: Constraints",
      items: [
        {
          question: "Listed Building?",
          answer:
            questionnaire?.constraints?.listedBuilding ||
            MISSING_VALUE,
        },
        {
          question: "TPO? (Tree Preservation Order)",
          answer:
            questionnaire?.constraints?.tpo || MISSING_VALUE,
        },
        {
          question: "Flood Zone?",
          answer:
            questionnaire?.constraints?.floodZone || MISSING_VALUE,
        },
        {
          question: "Vehicle access?",
          answer:
            questionnaire?.constraints?.vehicleAccess ||
            MISSING_VALUE,
        },
        {
          question: "Pre-application advice?",
          answer:
            questionnaire?.constraints?.preApplicationAdvice ||
            MISSING_VALUE,
        },
        {
          question: "Additional Consents Required",
          answer:
            questionnaire?.constraints
              ?.additionalConsentsRequired ||
            MISSING_VALUE,
        },
        {
          question: "Heritage Impact Assessment?",
          answer:
            questionnaire?.constraints
              ?.heritageImpactAssessment ||
            MISSING_VALUE,
        },
        {
          question: "Parking Impact?",
          answer:
            questionnaire?.constraints?.parkingImpact ||
            MISSING_VALUE,
        },
        {
          question: "Neighbour Consultation Required?",
          answer:
            questionnaire?.constraints
              ?.neighbourConsultationRequired ||
            MISSING_VALUE,
        },
      ],
    },
  ]
}

const decorateJourneyStage = (
  stage: JourneyStageApiItem
): JourneyStep => ({
  ...stage,
  icon: JOURNEY_STAGE_ICON_MAP[stage.iconKey],
})

const findJourneyStageIndex = (
  stages: JourneyStep[],
  stageId: JourneyStageId | null
) => stages.findIndex((stage) => stage.id === stageId)

export default function ProjectDetailsPage() {
  const params = useParams()
  const rawProjectId = (params?.projectId as string) ?? ""
  const decodedProjectId = decodeProjectId(rawProjectId)
  const resolvedProjectId =
    decodedProjectId === "PRJ-1001" ? "Z7@qL2" : decodedProjectId

  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [projectLoading, setProjectLoading] = useState(true)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [automationLoading, setAutomationLoading] = useState(false)
  const [automationStatus, setAutomationStatus] = useState<
    "idle" | "running" | "failed"
  >("idle")
  const [automationStep, setAutomationStep] = useState(0)
  const [journeyRoadmap, setJourneyRoadmap] =
    useState<JourneyRoadmapApiResponse | null>(null)
  const [journeyLoading, setJourneyLoading] = useState(true)
  const [openedJourneyStageId, setOpenedJourneyStageId] =
    useState<JourneyStageId | null>(null)
  const [awaitingAgentX, setAwaitingAgentX] = useState(false)
  const [showAgentXFollowUp, setShowAgentXFollowUp] =
    useState(false)
  const [showAgentXModal, setShowAgentXModal] =
    useState(false)

  const loadProjectData = useCallback(async () => {
    let storedProjects: Project[] = []

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
        if (stored) {
          storedProjects = normalizeProjects(JSON.parse(stored))
          setProjects(storedProjects)
        }
      } catch {
        // Keep defaults if storage is unavailable.
      } finally {
        setProjectsLoaded(true)
      }
    } else {
      setProjectsLoaded(true)
    }

    if (storedProjects.some((item) => item.id === resolvedProjectId)) {
      setProjectLoading(false)
      setProjectError(null)
      return
    }

    setProjectLoading(true)
    setProjectError(null)

    try {
      const liveProject = await fetchProjectWithEligibility(
        resolvedProjectId
      )

      if (!liveProject) {
        setProjectError("The project you requested does not exist.")
        return
      }

      const nextProjects = [liveProject]
      setProjects(nextProjects)

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(nextProjects)
          )
        } catch {
          // Ignore storage failures for live project data.
        }
      }
    } catch {
      setProjectError("Failed to load the requested project.")
    } finally {
      setProjectLoading(false)
    }
  }, [resolvedProjectId])

  useEffect(() => {
    void loadProjectData()
  }, [loadProjectData])

  useEffect(() => {
    if (!projectsLoaded || typeof window === "undefined") return
    try {
      localStorage.setItem(
        PROJECTS_STORAGE_KEY,
        JSON.stringify(projects)
      )
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [projects, projectsLoaded])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const roadmap = getMockJourneyRoadmap()
      setJourneyRoadmap(roadmap)
      setOpenedJourneyStageId(roadmap.currentStageId)
      setJourneyLoading(false)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [])

  const project = useMemo(
    () => projects.find((item) => item.id === resolvedProjectId),
    [projects, resolvedProjectId]
  )

  const journeySteps = useMemo(
    () =>
      (journeyRoadmap?.stages ?? []).map(decorateJourneyStage),
    [journeyRoadmap]
  )

  const currentJourneyStepIndex = useMemo(
    () =>
      findJourneyStageIndex(
        journeySteps,
        journeyRoadmap?.currentStageId ?? null
      ),
    [journeyRoadmap, journeySteps]
  )

  const currentJourneyStage =
    currentJourneyStepIndex >= 0
      ? journeySteps[currentJourneyStepIndex]
      : null

  const openedJourneyStageIndex = useMemo(() => {
    const selectedIndex = findJourneyStageIndex(
      journeySteps,
      openedJourneyStageId
    )

    return selectedIndex >= 0
      ? selectedIndex
      : currentJourneyStepIndex
  }, [
    currentJourneyStepIndex,
    journeySteps,
    openedJourneyStageId,
  ])

  const openedJourneyStage =
    openedJourneyStageIndex >= 0
      ? journeySteps[openedJourneyStageIndex]
      : null

  const nextJourneyStage = useMemo(
    () =>
      openedJourneyStage?.nextStageId
        ? journeySteps.find(
            (step) => step.id === openedJourneyStage.nextStageId
          ) ?? null
        : null,
    [journeySteps, openedJourneyStage?.nextStageId]
  )

  useEffect(() => {
    if (!project || typeof window === "undefined") return
    try {
      localStorage.setItem(PROJECT_LAST_ID_KEY, project.id)
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [project])

  useEffect(() => {
    if (!awaitingAgentX) {
      setShowAgentXFollowUp(false)
      setShowAgentXModal(false)
      return
    }
    setShowAgentXFollowUp(false)
    setShowAgentXModal(false)
    const timer = window.setTimeout(() => {
      setShowAgentXFollowUp(true)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [awaitingAgentX])

  useEffect(() => {
    if (!showAgentXFollowUp || !project) return
    const href = `/Projects/${encodeURIComponent(project.id)}`
    notifyAgentXRequiredDocs(href)
  }, [showAgentXFollowUp, project])

  const handleJourneyStepOpen = (stageId: JourneyStageId) => {
    const selectedStage = journeyRoadmap?.stages.find(
      (stage) => stage.id === stageId
    )

    if (!selectedStage) {
      return
    }

    setOpenedJourneyStageId(stageId)
  }

  const moveJourneyToStage = (nextStageId: JourneyStageId) => {
    setJourneyRoadmap((current) => {
      if (!current) {
        return current
      }

      return advanceMockJourneyStage(current, nextStageId)
    })
    setOpenedJourneyStageId(nextStageId)
  }

  const runAutomation = async () => {
    if (!project) return
    setAutomationLoading(true)
    setAutomationStatus("running")
    setAutomationStep(0)

    await new Promise((r) => setTimeout(r, 800))
    setAutomationStep(1)

    await new Promise((r) => setTimeout(r, 800))
    setAutomationStep(2)

    await new Promise((r) => setTimeout(r, 800))
    setAutomationStep(3)

    await new Promise((r) => setTimeout(r, 800))

    setAutomationStatus("idle")
    setAutomationLoading(false)
  }

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Loading Project
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fetching project details and eligibility data.
          </p>
        </section>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Project Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {projectError || "The project you requested does not exist."}
          </p>
          <Link
            href="/Projects"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm"
          >
            Back to Projects
          </Link>
        </section>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Project Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {project.id} - {project.serviceName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/Projects"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {journeyRoadmap?.journeyName ??
                      "Shared Journey Progress"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {openedJourneyStage?.title ??
                      "Loading roadmap..."}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {openedJourneyStage?.description ??
                      "Fetching roadmap stages from mock API data."}
                  </p>
                  {openedJourneyStage &&
                    currentJourneyStage &&
                    openedJourneyStage.id !==
                      currentJourneyStage.id && (
                      <p className="mt-2 text-xs font-medium text-slate-600">
                        Viewing stage:{" "}
                        {openedJourneyStage.label}
                      </p>
                    )}
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Phase:{" "}
                  {currentJourneyStage?.label ?? "Loading"}
                </span>
              </div>

              {journeyLoading ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Loading roadmap from mock backend JSON...
                </div>
              ) : (
                <JourneyRoadmap
                  steps={journeySteps}
                  currentStepIndex={currentJourneyStepIndex}
                  openedStageId={openedJourneyStage?.id ?? null}
                  onStepClick={handleJourneyStepOpen}
                />
              )}
            </div>

            <div>
              <EligibilityCheckDetails
                project={project as EligibilityProject}
                isActive={
                  openedJourneyStage?.screen === "sop"
                }
                onRunBriefcase={runAutomation}
                onSubmitSuccess={() => {
                  setAwaitingAgentX(true)
                }}
                automationLoading={automationLoading}
                automationStatus={automationStatus}
                activeAutomationStep={automationStep}
              />
              {awaitingAgentX &&
                openedJourneyStage?.id ===
                  ELIGIBILITY_STEP_ID && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-emerald-800 shadow-sm">
                      <h3 className="text-base font-semibold text-emerald-900">
                        Awaiting Agent X Follow-up
                      </h3>
                      <p className="mt-1 text-xs text-emerald-700">
                        You have submitted the required details
                        to Agent X. A follow-up notification
                        will appear shortly with required
                        documents.
                      </p>
                    </div>

                    {showAgentXFollowUp && (
                      <div
                        id="agent-x-followup"
                        className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                Agent X Follow-up: Required
                                Documents
                              </h4>
                              <p className="mt-1 text-xs text-slate-500">
                                A new document request is ready
                                for your review.
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                            NEW
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setShowAgentXModal(true)}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
                          >
                            Review Requirements
                          </button>
                        </div>
                      </div>
                    )}

                    {showAgentXModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                          onClick={() => setShowAgentXModal(false)}
                        />
                        <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                          <button
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowAgentXModal(false)}
                          >
                            ×
                          </button>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">
                                Required Documents
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                Agent X requires the following
                                items before moving forward.
                              </p>
                            </div>
                          </div>

                          <ul className="mt-4 space-y-2 text-sm text-slate-700">
                            {project?.documents
                              ?.slice(0, 3)
                              .map((doc) => (
                                <li
                                  key={doc}
                                  className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            {!project?.documents?.length && (
                              <>
                                <li className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span>Site Location Plan</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span>Block Plan</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span>CIL Form</span>
                                </li>
                              </>
                            )}
                          </ul>

                          <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setShowAgentXModal(false)}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAwaitingAgentX(false)
                                setShowAgentXFollowUp(false)
                                setShowAgentXModal(false)
                                if (openedJourneyStage?.nextStageId) {
                                  moveJourneyToStage(
                                    openedJourneyStage.nextStageId
                                  )
                                }
                              }}
                              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
                            >
                              {`Proceed to ${
                                nextJourneyStage?.label ??
                                "Next Stage"
                              }`}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              <BriefcaseStageDetails
                stage={openedJourneyStage}
                isActive={
                  openedJourneyStage?.screen ===
                    "documents-briefcase" ||
                  openedJourneyStage?.screen ===
                    "compliance-briefcase" ||
                  openedJourneyStage?.screen ===
                    "drawings-briefcase"
                }
                nextStageLabel={nextJourneyStage?.label}
                onNextStage={() => {
                  if (openedJourneyStage?.nextStageId) {
                    moveJourneyToStage(
                      openedJourneyStage.nextStageId
                    )
                  }
                }}
              />
              <SubmitBriefcaseDetails
                stage={openedJourneyStage}
                isActive={
                  openedJourneyStage?.screen ===
                  "submit-briefcase"
                }
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

const decodeProjectId = (value: string) => {
  let decoded = value
  for (let i = 0; i < 5; i += 1) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      break
    }
  }
  return decoded
}

function RoadmapStep({
  label,
  status,
  icon: Icon,
  canOpen,
  isSelected,
  onClick,
}: {
  label: string
  status: JourneyStageStatus
  icon: ElementType
  canOpen: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const isCompleted = status === "completed"
  const isActive = status === "active"
  const isLocked = status === "locked"
  const StepIcon = isCompleted ? CheckCircle : isLocked ? Lock : Icon

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[120px] flex-col items-center gap-2 cursor-pointer"
    >
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center border
          ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
              : isActive
              ? "border-2 border-emerald-500 text-emerald-600 bg-white shadow-[0_8px_20px_rgba(16,185,129,0.15)]"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }
          ${isSelected ? "ring-4 ring-emerald-100" : ""}
        `}
      >
        <StepIcon className="w-5 h-5" />
      </div>

      <span
        className={`text-xs text-center ${
          isSelected || isActive
            ? "text-emerald-600 font-semibold"
            : isCompleted
            ? "text-emerald-700"
            : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </button>
  )
}

function EligibilityCheckDetails({
  project,
  isActive,
  onRunBriefcase,
  onSubmitSuccess,
  automationLoading,
  automationStatus,
  activeAutomationStep,
}: {
  project: EligibilityProject
  isActive: boolean
  onRunBriefcase: () => Promise<void>
  onSubmitSuccess?: () => void
  automationLoading: boolean
  automationStatus: "idle" | "running" | "failed"
  activeAutomationStep: number
}) {
  const [briefcaseCompleted, setBriefcaseCompleted] = useState(false)
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  if (!isActive) {
    return null
  }

  const sections = buildEligibilitySections(project)
  if (sections.length === 0) {
    return null
  }

  const missingItems = [
    ...sections.flatMap((section) =>
      section.items
        .filter((item) => isMissingAnswer(item.answer))
        .map((item) => ({
          section: section.title,
          question: item.question,
          answer: item.answer,
        }))
    ),
    {
      section: "Documents",
      question: "CIL Form",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Location Plan",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Missing site plan",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Wrong or incomplete application form",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Incorrect ownership certificate",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Missing or incorrect fee",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "No heritage assessment",
      answer: MISSING_VALUE,
    },
    {
      section: "Documents",
      question: "Missing biodiversity report",
      answer: MISSING_VALUE,
    },
  ]

  const hasMissingDetails =
    sections.some((section) =>
      section.items.some((item) => isMissingAnswer(item.answer))
    )
  const primaryLabel = briefcaseCompleted
    ? submitted
      ? "Submitted"
      : hasMissingDetails
        ? "Submit to Agent X"
        : "Checklist Complete"
    : "Run Checklist"

  const handlePrimaryAction = async () => {
    if (!briefcaseCompleted) {
      await onRunBriefcase()
      setBriefcaseCompleted(true)
      setSubmitted(false)
      setShowSubmitSuccess(false)
      return
    }
    if (hasMissingDetails && !submitted) {
      setShowSubmitSuccess(true)
      setSubmitted(true)
      onSubmitSuccess?.()
    }
  }

  const questionnaire = project.clientQuestionnaire
  const propertyType =
    questionnaire?.propertyDetails?.propertyType || MISSING_VALUE
  const siteAddress =
    questionnaire?.propertyDetails?.siteAddress ||
    project.location ||
    MISSING_VALUE
  const postcode =
    questionnaire?.propertyDetails?.postcode ||
    project.postcode ||
    MISSING_VALUE
  const developmentPurpose =
    questionnaire?.propertyDetails?.purposeOfDevelopment ||
    MISSING_VALUE

  const lengthValue =
    questionnaire?.dimensions?.existingPropertyDepthM || MISSING_VALUE
  const widthValue =
    questionnaire?.dimensions?.existingPropertyWidthM || MISSING_VALUE
  const heightValue =
    questionnaire?.dimensions?.proposedExtensionHeightM || MISSING_VALUE
  const dimensionUnits = "m"

  const constraintItems = [
    {
      label: "Listed Building",
      value: questionnaire?.constraints?.listedBuilding || MISSING_VALUE,
    },
    {
      label: "Tree Preservation Order",
      value: questionnaire?.constraints?.tpo || MISSING_VALUE,
    },
    {
      label: "Flood Zone",
      value: questionnaire?.constraints?.floodZone || MISSING_VALUE,
    },
    {
      label: "Vehicle Access",
      value: questionnaire?.constraints?.vehicleAccess || MISSING_VALUE,
    },
    {
      label: "Pre-application Advice",
      value:
        questionnaire?.constraints?.preApplicationAdvice || MISSING_VALUE,
    },
    {
      label: "Additional Consents",
      value:
        questionnaire?.constraints?.additionalConsentsRequired ||
        MISSING_VALUE,
    },
    {
      label: "Heritage Impact",
      value:
        questionnaire?.constraints?.heritageImpactAssessment ||
        MISSING_VALUE,
    },
    {
      label: "Parking Impact",
      value:
        questionnaire?.constraints?.parkingImpact || MISSING_VALUE,
    },
    {
      label: "Neighbour Consultation",
      value:
        questionnaire?.constraints?.neighbourConsultationRequired ||
        MISSING_VALUE,
    },
  ]

  const materials = [
    questionnaire?.dimensions?.externalMaterials || MISSING_VALUE,
  ]

  const displayValue = (value: string) => {
    const missing = isMissingAnswer(value)
    if (!briefcaseCompleted && missing) {
      return { value: "—", missing: false }
    }
    return { value, missing }
  }

  const displayedConstraints = constraintItems.filter((item) =>
    briefcaseCompleted ? true : !isMissingAnswer(item.value)
  )
  const displayedMaterials = materials.filter((material) =>
    briefcaseCompleted ? true : !isMissingAnswer(material)
  )

  const propertyTypeDisplay = displayValue(propertyType)
  const siteAddressDisplay = displayValue(siteAddress)
  const postcodeDisplay = displayValue(postcode)
  const purposeDisplay = displayValue(developmentPurpose)
  const lengthDisplay = displayValue(lengthValue)
  const widthDisplay = displayValue(widthValue)
  const heightDisplay = displayValue(heightValue)
  const ownershipDisplay = displayValue(
    questionnaire?.propertyDetails?.ownershipStatus || MISSING_VALUE
  )
  const contactDisplay = displayValue(
    questionnaire?.propertyDetails?.contactEmailOrPhone || MISSING_VALUE
  )
  const customerName =
    questionnaire?.propertyDetails?.applicantFullName ||
    project.clientName ||
    project.applicantName ||
    "Client"
  const serviceName =
    project.serviceTitle || project.serviceName || "Planning Service"
  const totalQuestionCount = sections.reduce(
    (total, section) => total + section.items.length,
    0
  )
  const answeredQuestionCount = sections.reduce(
    (total, section) =>
      total +
      section.items.filter(
        (item) => !isMissingAnswer(item.answer)
      ).length,
    0
  )
  const missingQuestionCount = totalQuestionCount - answeredQuestionCount
  const checklistItemCount = SOP_AGENT_Y_CHECKLIST_SECTIONS.reduce(
    (total, section) => total + section.items.length,
    0
  )
  const actionSummary = !briefcaseCompleted
    ? "Ready to run the SOP checklist review."
    : hasMissingDetails
    ? `${missingItems.length} items need follow-up before handoff.`
    : "Redacted checklist is complete and ready for Agent X handoff."

  return (
    <div className="mt-5 space-y-5">
      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 px-5 py-5 text-white">
          <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/30">
                <Bot className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Agent Y SOP
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Redacted SOP Checklist
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-100/90">
                  Mandatory HMO Licence + Planning Permission for Newham Council.
                  This stage is limited to Agent Y&apos;s redacted technical
                  checklist for project{" "}
                  <span className="font-semibold text-white">
                    {project.id}
                  </span>
                  . No personal details are shown here, and all follow-ups stay
                  routed through Agent X.
                </p>
              </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <SopMetricCard
              label="Project"
              value={project.id}
              hint="Redacted technical packet"
            />
            <SopMetricCard
              label="Scope"
              value="HMO + Planning"
              hint="Newham Council workflow"
            />
            <SopMetricCard
              label="Sections"
              value={`${SOP_AGENT_Y_CHECKLIST_SECTIONS.length}`}
              hint="Checklist groups in this SOP"
            />
            <SopMetricCard
              label="Checklist"
              value={`${checklistItemCount} items`}
              hint="Technical review points"
            />
            <SopMetricCard
              label="Planning"
              value={serviceName}
              hint="Current project service"
            />
            <SopMetricCard
              label="Status"
              value={
                briefcaseCompleted
                  ? hasMissingDetails
                    ? "Needs follow-up"
                    : "Ready for handoff"
                  : "Pending run"
              }
              hint="Agent X remains the handoff owner"
            />
          </div>
        </div>

        {automationLoading && (
          <div className="border-t border-slate-200 bg-white px-5 pt-4">
            <ConstructionLoadingDock
              activeStep={activeAutomationStep}
              status={
                automationStatus === "failed"
                  ? "failed"
                  : "loading"
              }
            />
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="rounded-[22px] border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
            Technical Team only. Validate documents, compliance, drawings,
            planning, and risk outputs without requesting personal details or
            contacting the customer directly.
          </div>
        </div>

        <div className="grid gap-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 md:grid-cols-2 xl:grid-cols-3">
          {SOP_AGENT_Y_CHECKLIST_SECTIONS.map((section) => (
            <SopChecklistPanel
              key={section.title}
              title={section.title}
              items={section.items}
              tone={section.tone}
            />
          ))}
        </div>
      </div>

      {showSubmitSuccess && (
        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Redacted technical checklist submitted to Agent X (mock).
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-5">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Summary
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sanitized project data (safe for Agent Y)
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={
                automationLoading ||
                submitted ||
                (briefcaseCompleted && !hasMissingDetails)
              }
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0"
            >
              {primaryLabel}
            </button>
          </div>
        </div>

        {automationLoading && (
          <div className="px-6 pt-4">
            <ConstructionLoadingDock
              activeStep={activeAutomationStep}
              status={automationStatus === "failed" ? "failed" : "loading"}
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Property Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Property Type
                </div>
                <div
                  className={`text-sm font-medium ${
                    propertyTypeDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {propertyTypeDisplay.value}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Site Address
                </div>
                <div
                  className={`text-sm font-medium ${
                    siteAddressDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {siteAddressDisplay.value}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Postcode
                </div>
                <div
                  className={`text-sm font-medium ${
                    postcodeDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {postcodeDisplay.value}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Development Purpose
                </div>
                <div
                  className={`text-sm font-medium ${
                    purposeDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {purposeDisplay.value}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-purple-600" />
              Dimensions
            </h3>
            <div className="grid grid-cols-4 gap-4 bg-purple-50 rounded-lg p-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Length</div>
                <div
                  className={`text-sm font-medium ${
                    lengthDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {lengthDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Width</div>
                <div
                  className={`text-sm font-medium ${
                    widthDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {widthDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Height</div>
                <div
                  className={`text-sm font-medium ${
                    heightDisplay.missing
                      ? "text-rose-600"
                      : "text-gray-900"
                  }`}
                >
                  {heightDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Units</div>
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {dimensionUnits}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Site Constraints
            </h3>
            <ul className="space-y-2">
              {displayedConstraints.length > 0 ? (
                displayedConstraints.map((constraint, idx) => {
                  const missing = isMissingAnswer(constraint.value)
                  return (
                    <li
                      key={`${constraint.label}-${idx}`}
                      className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 rounded-lg p-3"
                    >
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span
                        className={missing ? "text-rose-600" : ""}
                      >
                        {constraint.label}: {constraint.value}
                      </span>
                    </li>
                  )
                })
              ) : (
                <li className="text-sm text-gray-500">
                  No constraints available.
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-green-600" />
              Proposed Materials
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {displayedMaterials.length > 0 ? (
                displayedMaterials.map((material, idx) => {
                  const missing = isMissingAnswer(material)
                  return (
                    <div
                      key={`${material}-${idx}`}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className={missing ? "text-rose-600" : ""}>
                        {material}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-gray-500">
                  No materials provided.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Remaining Missing Details
            </h3>
            {briefcaseCompleted ? (
              missingItems.length > 0 ? (
                <ul className="space-y-2">
                  {missingItems.map((item, idx) => (
                    <li
                      key={`${item.section}-${item.question}-${idx}`}
                      className="flex flex-wrap items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    >
                      <span className="font-semibold">{item.section}:</span>
                      <span>{item.question}</span>
                      <span className="text-rose-700">
                        {item.answer}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  All initiation details are complete.
                </div>
              )
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                Run the checklist to reveal missing details.
              </div>
            )}
          </div>

          {showSubmitSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Missing details submitted to Agent X (mock).
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SopMetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 shadow-sm backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{hint}</p>
    </div>
  )
}

function SopChecklistPanel({
  title,
  items,
  tone,
}: {
  title: string
  items: readonly string[]
  tone: "blue" | "emerald" | "amber"
}) {
  const toneClasses =
    tone === "emerald"
      ? {
          card: "border-emerald-200 bg-emerald-50/70",
          badge: "bg-emerald-100 text-emerald-700",
          bullet: "bg-emerald-500",
        }
      : tone === "amber"
      ? {
          card: "border-amber-200 bg-amber-50/70",
          badge: "bg-amber-100 text-amber-700",
          bullet: "bg-amber-500",
        }
      : {
          card: "border-blue-200 bg-blue-50/70",
          badge: "bg-blue-100 text-blue-700",
          bullet: "bg-blue-500",
        }

  return (
    <div className={`rounded-[22px] border p-4 ${toneClasses.card}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">
          {title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${toneClasses.badge}`}
        >
          {items.length} items
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((item) => (
          <div
            key={`${title}-${item}`}
            className="flex items-start gap-2.5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5"
          >
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneClasses.bullet}`}
            />
            <p className="text-sm leading-6 text-slate-700">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SopSnapshotItem({
  label,
  value,
  missing,
}: {
  label: string
  value: string
  missing: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          missing ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function BriefcaseStageDetails({
  stage,
  isActive,
  nextStageLabel,
  onNextStage,
}: {
  stage: JourneyStep | null
  isActive: boolean
  nextStageLabel?: string
  onNextStage: () => void
}) {
  const [selectedCard, setSelectedCard] =
    useState<BriefcaseCard | null>(null)
  const [cardReviewStatus, setCardReviewStatus] = useState<
    Record<string, "pending" | "completed">
  >({})

  if (!isActive || !stage) {
    return null
  }

  const content = BRIEFCASE_STAGE_CONTENT[
    stage.id as BriefcaseStageContentId
  ]
  const StageIcon = stage.icon

  return (
    <>
      <div className="mt-6">
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white">
            <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <StageIcon className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  {content.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {content.heading}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-100/90">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {content.notesTitle}
              </p>
              <div className="mt-3 grid gap-2">
                {content.notes.map((note) => (
                  <div
                    key={note}
                    className="flex items-start gap-2 rounded-2xl border border-white bg-white px-3 py-2.5"
                  >
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
                    <p className="text-sm leading-6 text-slate-700">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
            {content.cards.map((card) => {
              const cardKey = `${stage.id}:${card.category}:${card.title}`
              const reviewStatus =
                cardReviewStatus[cardKey] ?? "pending"

              return (
                <BriefcaseInfoCard
                  key={cardKey}
                  card={card}
                  reviewStatus={reviewStatus}
                  onMarkPending={() =>
                    setCardReviewStatus((current) => ({
                      ...current,
                      [cardKey]: "pending",
                    }))
                  }
                  onMarkCompleted={() =>
                    setCardReviewStatus((current) => ({
                      ...current,
                      [cardKey]: "completed",
                    }))
                  }
                  onView={() => setSelectedCard(card)}
                />
              )
            })}
          </div>

          {stage.nextStageId && (
            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onNextStage}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  {`Proceed to ${
                    nextStageLabel ?? "Next Stage"
                  }`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCard && (
        <BriefcaseViewModal
          card={selectedCard}
          stageLabel={stage.label}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  )
}

function BriefcaseInfoCard({
  card,
  reviewStatus,
  onMarkPending,
  onMarkCompleted,
  onView,
}: {
  card: BriefcaseCard
  reviewStatus: "pending" | "completed"
  onMarkPending: () => void
  onMarkCompleted: () => void
  onView: () => void
}) {
  const toneClasses =
    card.tone === "emerald"
      ? {
          card: "border-emerald-200 bg-emerald-50/70",
          badge: "bg-emerald-100 text-emerald-700",
          button:
            "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
        }
      : card.tone === "amber"
      ? {
          card: "border-amber-200 bg-amber-50/70",
          badge: "bg-amber-100 text-amber-700",
          button:
            "border-amber-200 text-amber-700 hover:bg-amber-100",
        }
      : {
          card: "border-blue-200 bg-blue-50/70",
          badge: "bg-blue-100 text-blue-700",
          button:
            "border-blue-200 text-blue-700 hover:bg-blue-100",
        }

  return (
    <div className={`rounded-[22px] border p-4 ${toneClasses.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${toneClasses.badge}`}
          >
            {card.category}
          </span>
        </div>
        <button
          type="button"
          onClick={onView}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${toneClasses.button}`}
        >
          View Document
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-950">
          {card.title}
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onMarkPending}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              reviewStatus === "pending"
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={onMarkCompleted}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              reviewStatus === "completed"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            Review Completed
          </button>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              reviewStatus === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {reviewStatus === "completed"
              ? "Completed"
              : "Pending"}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        {card.summary}
      </p>
    </div>
  )
}

function BriefcaseViewModal({
  card,
  stageLabel,
  onClose,
}: {
  card: BriefcaseCard
  stageLabel: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {stageLabel} Document View
            </p>
            <h4 className="mt-2 text-xl font-semibold text-slate-950">
              {card.title}
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              {card.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          {card.details.map((detail) => (
            <div
              key={detail}
              className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
              <p className="text-sm leading-6 text-slate-700">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubmitBriefcaseDetails({
  stage,
  isActive,
}: {
  stage: JourneyStep | null
  isActive: boolean
}) {
  const [running, setRunning] = useState(false)
  const [runComplete, setRunComplete] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [completedCardCount, setCompletedCardCount] = useState(0)

  if (!isActive || !stage) {
    return null
  }

  const finalStageIds: BriefcaseStageContentId[] = [
    "documents-briefcase",
    "compliance-briefcase",
    "drawings-briefcase",
  ]

  const briefcaseSections = finalStageIds.map((id) => ({
    id,
    content: BRIEFCASE_STAGE_CONTENT[id],
  }))
  const orderedCardKeys = briefcaseSections.flatMap(
    ({ id, content }) =>
      content.cards.map((card) => `${id}:${card.title}`)
  )
  const totalCardCount = orderedCardKeys.length

  const handleRunBriefcase = async () => {
    setRunning(true)
    setRunComplete(false)
    setSubmitted(false)
    setActiveStep(0)
    setCompletedCardCount(0)

    for (let index = 0; index < totalCardCount; index += 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, SUBMIT_BRIEFCASE_ITEM_DELAY_MS)
      )
      setCompletedCardCount(index + 1)
      setActiveStep(
        Math.min(
          3,
          Math.floor(((index + 1) / totalCardCount) * 4)
        )
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    setRunning(false)
    setRunComplete(true)
  }

  const handleSubmitAll = () => {
    setSubmitted(true)
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Flag className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Submit Briefcase
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Final Briefcase Review for Agent X
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-100/90">
                  Review all redacted briefcases together, run the final
                  briefcase check, and then send the full package to Agent X.
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-3xl border border-cyan-300/20 bg-white/10 p-4 shadow-sm backdrop-blur">
              {submitted ? (
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
                  All briefcase data has been submitted to Agent X.
                </div>
              ) : runComplete ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-100">
                    Can we send to Agent X the data?
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmitAll}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    Submit All
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleRunBriefcase()}
                  disabled={running}
                  className={`rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${
                    running
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700"
                  }`}
                >
                  {running ? "Running Briefcase" : "Run Briefcase"}
                </button>
              )}
            </div>
          </div>
        </div>

        {running && (
          <div className="border-t border-slate-200 bg-white px-5 pt-4">
            <ConstructionLoadingDock
              activeStep={activeStep}
              status="loading"
            />
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="rounded-[22px] border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
            Run the final briefcase check to validate Documentation,
            Compliance, and Drawings before the Agent X handoff.
          </div>
        </div>

        <div className="space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
          {briefcaseSections.map(({ id, content }) => (
            <div
              key={id}
              className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {content.eyebrow}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-950">
                    {content.heading}
                  </h4>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {content.cards.length} items
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {content.cards.map((card) => {
                  const cardKey = `${id}:${card.title}`
                  const cardIndex =
                    orderedCardKeys.indexOf(cardKey)
                  const isChecked =
                    runComplete || completedCardCount > cardIndex

                  return (
                    <div
                      key={`${id}-${card.title}`}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 ${
                        isChecked
                          ? "border-emerald-200 bg-emerald-50/80"
                          : "border-slate-200 bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-300 bg-white" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {card.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {card.summary}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          isChecked
                            ? "bg-emerald-100 text-emerald-700"
                            : running
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isChecked
                          ? "OK"
                          : running
                          ? "Checking"
                          : "Awaiting Briefcase Run"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

function JourneyStagePlaceholder({
  stage,
  isActive,
}: {
  stage: JourneyStep | null
  isActive: boolean
}) {
  if (!isActive || !stage) {
    return null
  }

  const StageIcon = stage.icon

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <StageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {stage.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {stage.description}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          This panel is now driven by the mock roadmap JSON and is
          ready to be replaced with live backend data later.
        </div>
      </div>
    </div>
  )
}

function JourneyRoadmap({
  steps,
  currentStepIndex,
  openedStageId,
  onStepClick,
}: {
  steps: JourneyStep[]
  currentStepIndex: number
  openedStageId: JourneyStageId | null
  onStepClick: (stageId: JourneyStageId) => void
}) {
  const safeActive = Math.min(
    Math.max(currentStepIndex, 0),
    steps.length - 1
  )
  const progress =
    steps.length > 1 ? (safeActive / (steps.length - 1)) * 100 : 0

  return (
    <div className="relative mt-6">
      <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-100" />
      <div
        className="absolute left-0 top-5 h-1 rounded-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div className="relative flex items-start justify-between">
        {steps.map((step) => (
          <RoadmapStep
            key={step.id}
            label={step.label}
            status={step.status}
            icon={step.icon}
            canOpen={step.canOpen}
            isSelected={step.id === openedStageId}
            onClick={() => onStepClick(step.id)}
          />
        ))}
      </div>
    </div>
  )
}
