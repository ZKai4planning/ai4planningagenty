"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState, type ElementType } from "react"
import {
  AlertCircle,
  Building2,
  Cpu,
  Flag,
  FileSearch,
  FileText,
  FileCheck,
  Lock,
  Ruler,
  CheckCircle,
  ShieldCheck,
} from "lucide-react"
import ConstructionLoadingDock from "@/components/ConstructionLoadingDock"
import AgentY from "@/components/agenty"
import {
  PROJECTS_STORAGE_KEY,
  Project,
  initialProjects,
  normalizeProjects,
} from "@/lib/projects-data"

type JourneyStep = {
  id: string
  label: string
  icon: ElementType
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "initiation",
    label: "Initiation",
    icon: FileSearch,
  },
  {
    id: "agent-x-intake",
    label: "Agent X Intake",
    icon: FileText,
  },
  {
    id: "current-processing",
    label: "Current Processing",
    icon: Cpu,
  },
  {
    id: "validation",
    label: "Validation",
    icon: ShieldCheck,
  },
  {
    id: "final-output",
    label: "Final Output",
    icon: Flag,
  },
]

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

type AnswerMap = Record<string, string>

const ELIGIBILITY_STEP_ID = "initiation"
const PROJECT_LAST_ID_KEY = "ai4planning_last_project_id"
const MISSING_VALUE = "Missing"
const MISSING_TOKENS = new Set([
  MISSING_VALUE,
  "Not provided",
  "Don't know",
  "Not sure",
])

const isMissingAnswer = (value: string) => {
  const trimmed = value.trim()
  return trimmed === "" || MISSING_TOKENS.has(trimmed)
}

const AGENT_X_ANSWERS: AnswerMap = {
  "Property Type": "Terraced house",
  "Ownership Status": "Freehold",
  "Conservation Area or Listed Building?": "No",
  "Purpose of Development": "Rear extension",
  "Existing Property Width (m)": "5.4",
  "Existing Property Depth (m)": "11.8",
  "Proposed Extension Depth (m)": "3.6",
  "Proposed Extension Height (m)": "3.2",
  "External Materials": "Match existing",
  "Brief Description of Proposed Works":
    "Single-storey rear extension with open-plan kitchen-dining and rear glazing.",
  "Listed Building?": "No",
  "TPO? (Tree Preservation Order)": "No",
  "Flood Zone?": "No",
  "Vehicle access?": "Yes",
  "Pre-application advice?": "No",
  "Additional Consents Required": "None",
  "Heritage Impact Assessment?": "Not required",
  "Parking Impact?": "Low impact",
  "Neighbour Consultation Required?": "No",
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

export default function ProjectDetailsPage() {
  const params = useParams()
  const rawProjectId = (params?.projectId as string) ?? ""
  const decodedProjectId = decodeProjectId(rawProjectId)
  const resolvedProjectId =
    decodedProjectId === "PRJ-1001" ? "Z7@qL2" : decodedProjectId

  const [projects, setProjects] =
    useState<Project[]>(initialProjects)
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [automationLoading, setAutomationLoading] = useState(false)
  const [automationStatus, setAutomationStatus] = useState<
    "idle" | "running" | "failed"
  >("idle")
  const [automationStep, setAutomationStep] = useState(0)
  const [activeJourneyStep, setActiveJourneyStep] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProjects(normalizeProjects(parsed))
      }
    } catch {
      // Keep defaults if storage is unavailable.
    } finally {
      setProjectsLoaded(true)
    }
  }, [])

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

  const project = useMemo(
    () => projects.find((item) => item.id === resolvedProjectId),
    [projects, resolvedProjectId]
  )

  useEffect(() => {
    if (!project || typeof window === "undefined") return
    try {
      localStorage.setItem(PROJECT_LAST_ID_KEY, project.id)
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [project])

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

  if (!project) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Project Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The project you requested does not exist.
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
            <div className="rounded-2xl border bg-white p-6 shadow-sm max-w-5xl mx-auto">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Shared Journey Progress
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    Initiation Workflow
                  </h2>
                  <p className="text-xs text-slate-500">
                    Eligibility form is active for initiation.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Phase: {JOURNEY_STEPS[activeJourneyStep]?.label}
                </span>
              </div>

              <JourneyRoadmap
                steps={JOURNEY_STEPS}
                activeStep={activeJourneyStep}
              />
            </div>

            <div className="max-w-4xl mx-auto">
              <EligibilityCheckDetails
                project={project as EligibilityProject}
                isActive={
                  JOURNEY_STEPS[activeJourneyStep]?.id ===
                  ELIGIBILITY_STEP_ID
                }
                onRunBriefcase={runAutomation}
                onSubmitSuccess={() => {
                  setActiveJourneyStep((prev) =>
                    Math.min(prev + 1, JOURNEY_STEPS.length - 1)
                  )
                }}
                automationLoading={automationLoading}
                automationStatus={automationStatus}
                activeAutomationStep={automationStep}
              />
              <AgentXIntakeDetails
                project={project as EligibilityProject}
                isActive={
                  JOURNEY_STEPS[activeJourneyStep]?.id ===
                  "agent-x-intake"
                }
                onProceed={() => {
                  setActiveJourneyStep((prev) =>
                    Math.min(prev + 1, JOURNEY_STEPS.length - 1)
                  )
                }}
              />
              <CurrentProcessingDetails
                isActive={
                  JOURNEY_STEPS[activeJourneyStep]?.id ===
                  "current-processing"
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
}: {
  label: string
  status: "completed" | "active" | "locked"
  icon: ElementType
}) {
  const isCompleted = status === "completed"
  const isActive = status === "active"
  const isLocked = status === "locked"
  const StepIcon = isCompleted ? CheckCircle : isLocked ? Lock : Icon

  return (
    <div className="flex flex-col items-center gap-2 min-w-[120px]">
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
        `}
      >
        <StepIcon className="w-5 h-5" />
      </div>

      <span
        className={`text-xs text-center ${
          isActive
            ? "text-emerald-600 font-semibold"
            : isCompleted
            ? "text-emerald-700"
            : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
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
        : "Briefcase Complete"
    : "Run Briefcase"

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
            {missingItems.length > 0 ? (
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

function AgentXIntakeDetails({
  project,
  isActive,
  onProceed,
}: {
  project: EligibilityProject
  isActive: boolean
  onProceed?: () => void
}) {
  if (!isActive) {
    return null
  }

  const sections = buildEligibilitySections(project)
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
  ]
  const agentXSections = sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (!isMissingAnswer(item.answer)) {
        return item
      }
      return {
        ...item,
        answer: AGENT_X_ANSWERS[item.question] ?? "Provided by Agent X",
      }
    }),
  }))

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Agent X Intake
            </h3>
            <p className="text-xs text-slate-500">
              Remaining missing details carried from initiation.
            </p>
          </div>
          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {missingItems.length} missing
          </span>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {agentXSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-slate-900">
                  {section.title}
                </h4>
                <div className="mt-3 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  {section.items.map((item) => {
                    const missing = isMissingAnswer(item.answer)
                    return (
                      <div
                        key={`${section.title}-${item.question}`}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-xs font-semibold text-slate-500">
                          {item.question}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            missing ? "text-rose-600" : "text-slate-900"
                          }`}
                        >
                          {item.answer}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={onProceed}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
            >
              Proceed to Current Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CurrentProcessingDetails({
  isActive,
}: {
  isActive: boolean
}) {
  if (!isActive) {
    return null
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Current Processing
            </h3>
            <p className="text-xs text-slate-500">
              Active automation and dependency tracking.
            </p>
          </div>
        </div>
        <div className="bg-slate-100">
          <AgentY />
        </div>
      </div>
    </div>
  )
}

function JourneyRoadmap({
  steps,
  activeStep,
}: {
  steps: JourneyStep[]
  activeStep: number
}) {
  const safeActive = Math.min(
    Math.max(activeStep, 0),
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
        {steps.map((step, index) => {
          const status =
            index < safeActive
              ? "completed"
              : index === safeActive
              ? "active"
              : "locked"
          return (
            <RoadmapStep
              key={step.id}
              label={step.label}
              status={status}
              icon={step.icon}
            />
          )
        })}
      </div>
    </div>
  )
}
