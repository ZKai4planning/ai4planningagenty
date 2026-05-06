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

type AgentZResponseContent = {
  intro: string
  focus: string
  confidence: "High" | "Medium"
  checklist: readonly string[]
  insights: readonly string[]
  agentYNotes?: readonly string[]
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
        title: "existing floor plan",
        summary: "Required",
        details: [
          "Required drawing set item: Block or site plan.",
          "Show site context and planning boundary lines clearly.",
        ],
        tone: "blue",
      },
  
   

      {
        category: "Inputs Provided",
        title: "Site Visite Data",
        summary: "Complete / Partial / Missing",
        details: [
          "Status options: Complete / Partial / Missing.",
          "Use the supplied measurements to support drawing accuracy where provided.",
        ],
        tone: "emerald",
      },
      {
        category: "Inputs Provided",
        title: "Original Layout",
        summary: "Provided / Missing",
        details: [
          "Status options: Provided / Missing.",
          "Flag missing original layout material that limits technical drawing confidence.",
        ],
        tone: "emerald",
      },
      {
        category: "Agent Y Task",
        title: "Exist Original Layout Without Walls",
        summary: "Prepare for technical review",
        details: [
          "Prepare the existing original layout without walls.",
          "Keep the output consistent with the redacted planning pack.",
        ],
        tone: "amber",
      },
      {
        category: "Agent Y Task",
        title: "Proposed Layout 1",
        summary: "Prepare for submission pack",
        details: [
          "Prepare proposed layout 1 for the drawing pack.",
          "Keep the proposal aligned with the technical briefcase requirements.",
        ],
        tone: "amber",
      },
      {
        category: "Agent Y Task",
        title: "Proposed Layout 2",
        summary: "Prepare for submission pack",
        details: [
          "Prepare proposed layout 2 for the drawing pack.",
          "List any missing measurements or unresolved input dependencies for Agent X.",
        ],
        tone: "amber",
      },
    ],
  },
}

const AGENT_Z_RESPONSE_CONTENT: Record<
  string,
  AgentZResponseContent
> = {
  "Gas Safety Certificate (CP12)": {
    intro:
      "Newham requires a valid Gas Safety Certificate where gas appliances are present. Agent Z checks date validity, engineer registration, and whether the certificate fully covers the installed appliances.",
    focus: "Gas safety compliance",
    confidence: "High",
    checklist: [
      "Certificate should usually be issued within the last 12 months.",
      "Engineer must be Gas Safe registered.",
      "Certificate should list the relevant gas appliances and inspection outcome.",
    ],
    insights: [
      "Request CP12 upload or a gas safety inspection if the customer has not provided one.",
      "Pause compliance progression where the certificate is missing, expired, or unclear.",
      "Prepare a redacted summary for Agent Y once evidence is available.",
    ],
    agentYNotes: [
      "Field: Gas Safety Certificate (CP12).",
      "Redacted summary: CP12 required for Newham compliance where gas appliances exist.",
      "Awaiting: certificate upload, gas safety inspection, or customer clarification.",
      "Task for Y Team: validate certificate once uploaded and flag expiry or non-compliance.",
      "Add fire and gas compliance notes to the final submission pack.",
    ],
  },
  "Electrical Report (EICR)": {
    intro:
      "Newham requires a valid EICR for rented and HMO properties. Agent Z checks issue age, electrician accreditation, the inspection outcome, and whether remedial actions are still outstanding.",
    focus: "Electrical safety",
    confidence: "High",
    checklist: [
      "EICR should be within the last 5 years.",
      "Outcome should clearly show whether the report is satisfactory.",
      "Electrician accreditation and remedial notes should be present.",
    ],
    insights: [
      "Request EICR upload and verify issue date, satisfactory status, and electrician accreditation.",
      "If evidence is missing or unclear, recommend a fresh electrical inspection and hold compliance until uploaded.",
      "Prepare the briefcase update and redacted summary for Agent Y.",
    ],
    agentYNotes: [
      "Field: Electrical Report (EICR).",
      "Redacted summary: EICR required for Newham compliance and valid for 5 years.",
      "Awaiting: EICR upload, electrical inspection, or customer clarification.",
      "Task for Y Team: validate the EICR once uploaded.",
      "Flag any unsatisfactory report or C1, C2, or FI issue.",
      "Add electrical compliance notes to the final submission pack.",
    ],
  },
  "Energy Performance Certificate (EPC)": {
    intro:
      "Newham requires an EPC for rented properties and HMO applications. Agent Z checks whether the certificate is valid, whether the band meets the minimum standard, and whether assessor details are present.",
    focus: "Energy performance evidence",
    confidence: "High",
    checklist: [
      "EPC should remain valid within the 10-year window.",
      "Band E or above is the minimum expected threshold.",
      "Issue date and assessor accreditation should be visible.",
    ],
    insights: [
      "Request EPC upload and verify rating, issue date, and assessor details.",
      "If the certificate is missing or below Band E, recommend assessment or improvement steps before compliance continues.",
      "Prepare the briefcase update and redacted summary for Agent Y.",
    ],
    agentYNotes: [
      "Field: EPC Status.",
      "Redacted summary: EPC required for Newham compliance, valid for 10 years, with minimum Band E.",
      "Awaiting: EPC upload, EPC assessment, or customer clarification.",
      "Task for Y Team: validate EPC once uploaded and flag any rating below Band E.",
      "Add energy compliance notes to the final submission pack.",
    ],
  },
  "Fire Risk Assessment": {
    intro:
      "Agent Z assessed whether the fire risk review looks complete enough to support the technical briefcase stage.",
    focus: "Fire risk review completeness",
    confidence: "Medium",
    checklist: [
      "Check that escape routes, alarms, and fire doors are addressed.",
      "Look for dated observations and any recommended actions.",
      "Flag incomplete or generic assessments for Agent X follow-up.",
    ],
    insights: [
      "A fire risk document with no actionable findings can still be incomplete if the layout is not covered.",
      "Missing assessor details or review dates reduce confidence.",
      "Any open fire safety actions should be surfaced before handoff.",
    ],
    agentYNotes: [
      "FRA required for Newham HMO compliance.",
      "Awaiting:",
      "FRA document",
      "Fire safety photos",
      "Assessment booking (if required)",
      "No personal data included.",
      "Technical Tasks for Y-Team:",
      "Validate FRA content (risk categories, actions, assessor competence).",
      "Flag any missing fire safety elements (doors, alarms, escape routes).",
      "Add fire safety notes to final compliance pack.",
      "Integrate FRA findings into fire safety plan drawings.",
    ],
  },
  "Existing Planning Permissions": {
    intro:
      "Agent Z reviewed the planning history angle to see whether supplied permissions line up with the current technical pack.",
    focus: "Planning history relevance",
    confidence: "Medium",
    checklist: [
      "Check whether the consent relates to the same property scope.",
      "Compare the permission description with the current proposal or layout.",
      "Flag missing reference numbers or unclear approval dates.",
    ],
    insights: [
      "Historic permissions help most when they clearly connect to the current drawings or use class context.",
      "Unclear planning history should be escalated instead of assumed.",
      "A planning document can be present but still not technically relevant.",
    ],
  },
  "Fit & Proper Declaration": {
    intro:
      "Agent Z treated this as a presence-and-completeness check only, consistent with the redacted workflow.",
    focus: "Presence check",
    confidence: "Medium",
    checklist: [
      "Confirm the declaration is included in the pack.",
      "Check that the document looks complete rather than partial.",
      "Route any absence or ambiguity through Agent X.",
    ],
    insights: [
      "This card is mainly about whether the declaration exists in the evidence set.",
      "The briefcase flow does not need personal-data review here.",
      "A missing declaration should stay flagged until replaced with valid evidence.",
    ],
  },
  "Ownership / Lease / Mortgage Consents": {
    intro:
      "Agent Z reviewed whether the supporting consent evidence is sufficient for the ownership structure described in the pack.",
    focus: "Supporting consents",
    confidence: "Medium",
    checklist: [
      "Check whether consent is required for the ownership arrangement.",
      "Verify any freeholder, lender, or lease evidence is present where applicable.",
      "Flag unclear ownership chains or partial consent records.",
    ],
    insights: [
      "Consent requirements often depend on lease terms and lender restrictions.",
      "Partial consent evidence should not be treated as complete.",
      "Agent X should be asked to clarify ownership obligations where the pack is ambiguous.",
    ],
  },
  "Smoke / Heat Alarm Layout": {
    intro:
      "Agent Z checked the alarm layout response against the typical HMO expectation for interlinked detection and kitchen heat alarms.",
    focus: "Alarm coverage",
    confidence: "High",
    checklist: [
      "Check that each storey is covered by smoke detection.",
      "Confirm a heat alarm is accounted for in the kitchen.",
      "Flag unclear alarm positions or missing proof images.",
    ],
    insights: [
      "Interlinked alarms are the clearest compliance signal in this workflow.",
      "Kitchen coverage is often the first missing detail in partial packs.",
      "Photos of ceilings, landings, and the kitchen usually improve certainty quickly.",
    ],
  },
  "Fire Doors (FD30)": {
    intro:
      "Agent Z reviewed the fire door evidence with attention to FD30 suitability and clarity of proof.",
    focus: "Fire door evidence",
    confidence: "Medium",
    checklist: [
      "Check whether FD30 doors are identified where required.",
      "Look for evidence that doors are complete and appropriate to the risk areas.",
      "Flag unclear labeling or missing product information.",
    ],
    insights: [
      "Door presence alone is weaker than proof that the doors meet the required standard.",
      "Missing seals, closers, or product details can leave the evidence incomplete.",
      "Agent X should request sharper evidence if the door specification is uncertain.",
    ],
  },
  "Escape Routes": {
    intro:
      "Agent Z assessed whether the escape route response gives enough clarity on safe movement and protected egress.",
    focus: "Means of escape",
    confidence: "Medium",
    checklist: [
      "Review whether the route appears unobstructed and understandable.",
      "Check for any obvious dead ends or weak route descriptions.",
      "Flag gaps where plans or photos are needed to confirm the route.",
    ],
    insights: [
      "Escape route concerns are high-risk issues and should not be left implicit.",
      "Good layout evidence often matters more here than text alone.",
      "Unknown route conditions should stay marked for follow-up.",
    ],
  },
  "Emergency Lighting": {
    intro:
      "Agent Z reviewed the emergency lighting position to determine whether the evidence is enough for the current route and layout context.",
    focus: "Lighting requirement check",
    confidence: "Medium",
    checklist: [
      "Check whether the property layout suggests emergency lighting may be needed.",
      "Review whether any installed lighting evidence is actually shown.",
      "Flag uncertainty where route lighting cannot be judged from the pack.",
    ],
    insights: [
      "This is often a context-sensitive check rather than a simple yes-or-no document item.",
      "Where the route evidence is weak, emergency lighting should stay under review.",
      "Photos and route drawings usually improve confidence most.",
    ],
  },
  "Kitchen Adequacy": {
    intro:
      "Agent Z reviewed the kitchen response against adequacy expectations for size, layout, and shared use.",
    focus: "Kitchen provision",
    confidence: "Medium",
    checklist: [
      "Check whether the kitchen appears proportionate to occupancy.",
      "Review appliance, worktop, and circulation evidence.",
      "Flag missing measurements or incomplete photo coverage.",
    ],
    insights: [
      "Kitchen adequacy is easier to confirm when measurements and appliance count are both present.",
      "Shared-occupancy kitchens need stronger evidence than a simple description.",
      "Missing dimensions should remain visible until the pack is updated.",
    ],
  },
  "Bathroom Ratio": {
    intro:
      "Agent Z reviewed the bathroom ratio response against occupancy-based adequacy checks used in the pack.",
    focus: "Bathroom provision",
    confidence: "Medium",
    checklist: [
      "Compare the indicated bathroom count to the likely occupancy load.",
      "Check whether toilets, showers, and baths are clearly evidenced.",
      "Flag unclear room counts or incomplete facility descriptions.",
    ],
    insights: [
      "Bathroom ratio issues often surface when occupancy and layout data are incomplete.",
      "Room labels on drawings help this check more than narrative text alone.",
      "Any uncertainty here should stay routed back through Agent X.",
    ],
  },
  "Ventilation / Heating": {
    intro:
      "Agent Z reviewed whether the ventilation and heating evidence is strong enough to support the compliance briefcase.",
    focus: "Habitable environment checks",
    confidence: "Medium",
    checklist: [
      "Check for extractor, opening-window, or ventilation references where relevant.",
      "Review whether fixed heating provision is described or shown.",
      "Flag vague evidence or rooms with no clear servicing details.",
    ],
    insights: [
      "Ventilation and heating are often under-evidenced unless room-by-room details exist.",
      "Bathroom and kitchen extract evidence is especially useful.",
      "Unsupported statements should be treated as pending rather than complete.",
    ],
  },
  "Water Supply": {
    intro:
      "Newham requires a safe, continuous water supply with suitable hot and cold water to fixtures. Agent Z checks continuity, quality, and whether the evidence is strong enough for compliance review.",
    focus: "Water supply compliance",
    confidence: "High",
    checklist: [
      "Confirm potable hot and cold water provision is addressed.",
      "Review pressure, continuity, and any boiler or tank evidence.",
      "Treat missing, intermittent, or unclear supply as a serious compliance concern.",
    ],
    insights: [
      "Request confirmation of mains or tank supply plus photos of taps, boiler, hot water system, and tank if applicable.",
      "If water supply is missing or unreliable, escalate to repair and pause compliance progression.",
      "If unsure, trigger a site visit or verification check before handoff.",
    ],
    agentYNotes: [
      "Field: Water Supply Status.",
      "Redacted summary: water supply must be safe, continuous, and compliant with Newham standards.",
      "Awaiting: photos of taps, boiler, or tank; plumbing repair; or site visit verification.",
      "Task for Y Team: validate uploaded water supply evidence.",
      "Flag any issue affecting habitability or compliance.",
      "Add water safety notes to the final submission pack.",
    ],
  },
  "Sewage / Drainage": {
    intro:
      "Newham requires a safe and functional connection to an approved sewage or drainage system. Agent Z checks whether the property appears free from drainage failure, blockage, or foul waste risk.",
    focus: "Foul drainage",
    confidence: "High",
    checklist: [
      "Check for evidence of a proper sewer connection or approved private system.",
      "Look for leaks, backflow, blockages, or non-functioning waste systems.",
      "Treat unclear or failed drainage as a major compliance issue.",
    ],
    insights: [
      "If customer evidence is missing or uncertain, request manhole, external drainage, and waste pipe photos.",
      "Escalate active failures to plumbing or drainage repair before compliance continues.",
      "Trigger a drainage assessment site visit if evidence remains unclear.",
    ],
    agentYNotes: [
      "Field: Sewage / Drainage Status.",
      "Redacted summary: sewage and drainage must be functional and compliant with Newham standards.",
      "Awaiting: confirmation of mains connection, drainage photos, repair evidence, or site visit.",
      "Task for Y Team: validate drainage evidence once uploaded.",
      "Flag issues affecting habitability or compliance.",
      "Add drainage compliance notes to the final submission pack.",
    ],
  },
  "Surface Water Drainage": {
    intro:
      "Newham requires adequate surface water drainage to prevent flooding, damp, pooling, and neighbour impact. Agent Z checks whether rainwater routing appears lawful and technically sufficient.",
    focus: "Surface water management",
    confidence: "High",
    checklist: [
      "Check that runoff destination is identified or can be verified.",
      "Review gutters, downpipes, and external drainage points.",
      "Flag uncertainty where foul and surface systems may be mixed or illegal.",
    ],
    insights: [
      "Request photos of external drainage, gutters, downpipes, and any signs of pooling.",
      "If drainage is missing or broken, recommend repair or specialist assessment before compliance continues.",
      "If unclear, trigger a drainage assessment site visit and keep the briefcase open.",
    ],
    agentYNotes: [
      "Field: Surface Water Drainage Status.",
      "Redacted summary: surface water drainage must meet Newham standards to avoid flooding and damp.",
      "Awaiting: drainage photos, drainage-type confirmation, repair evidence, or site visit.",
      "Task for Y Team: validate external drainage evidence.",
      "Flag issues affecting surface water management or compliance.",
      "Add drainage notes to the final submission pack.",
    ],
  },
  "Waste Arrangements": {
    intro:
      "Newham requires adequate, secure waste storage with correct bins and clear collection access. Agent Z checks whether household waste arrangements appear suitable for occupancy and site layout.",
    focus: "Waste storage suitability",
    confidence: "High",
    checklist: [
      "Check whether storage capacity appears sufficient for the expected occupants.",
      "Review the bin area for secure, pest-resistant, collection-ready storage.",
      "Flag overflow risk, missing bins, or unclear access routes.",
    ],
    insights: [
      "Request photos of front and rear waste areas plus bin-type confirmation.",
      "If arrangements are missing, direct the customer to order correct bins and create secure storage before progressing.",
      "If unclear, trigger a waste assessment site visit and keep compliance open.",
    ],
    agentYNotes: [
      "Field: Existing Waste Arrangements.",
      "Redacted summary: waste storage must meet Newham standards with correct bins, adequate capacity, and secure storage.",
      "Awaiting: waste-area photos, bin-type confirmation, new bin ordering evidence, or site visit.",
      "Task for Y Team: validate waste arrangements once evidence is uploaded.",
      "Flag hygiene, pest, or compliance issues.",
      "Add waste management notes to the final submission pack.",
    ],
  },
  "Bedroom Sizes": {
    intro:
      "Agent Z reviewed the bedroom size response against the expected minimum-area and overcrowding checks in the pack.",
    focus: "Room size adequacy",
    confidence: "Medium",
    checklist: [
      "Check whether measurements are present and appear usable.",
      "Compare any known sizes against the intended occupancy use.",
      "Flag unclear ceiling or usable-floor-area constraints.",
    ],
    insights: [
      "Bedroom size checks lose confidence quickly when measurements are partial.",
      "Drawings and survey data matter more than descriptive text here.",
      "Potential overcrowding risks should stay clearly highlighted for Agent X.",
    ],
  },
  "Communal Space": {
    intro:
      "Agent Z reviewed the communal space response to see whether shared living provision appears proportionate to occupancy.",
    focus: "Shared space provision",
    confidence: "Medium",
    checklist: [
      "Check whether the communal area is clearly identified and measured.",
      "Review whether it looks usable for the expected number of occupants.",
      "Flag missing room labels, dimensions, or conflicting layout evidence.",
    ],
    insights: [
      "Communal space is easier to validate when the drawings clearly label use and size.",
      "Shared-space adequacy often interacts with bedroom count and kitchen use.",
      "If the room function is ambiguous, the card should remain under review.",
    ],
  },
}

const SUBMIT_BRIEFCASE_ITEM_DELAY_MS = 3000

const AGENT_Z_ENABLED_STAGE_IDS: readonly BriefcaseStageContentId[] = [
  "documents-briefcase",
  "compliance-briefcase",
]

const getAgentZResponseContent = (
  card: BriefcaseCard
): AgentZResponseContent =>
  AGENT_Z_RESPONSE_CONTENT[card.title] ?? {
    intro: `Agent Z reviewed ${card.title} and generated a technical response for the current briefcase stage.`,
    focus: card.category,
    confidence: "Medium",
    checklist: [
      "Review the evidence against the stated briefcase summary.",
      "Confirm the core technical proof points are visible and current.",
      "Route missing or unclear evidence back through Agent X.",
    ],
    insights: card.details,
    agentYNotes: [
      `Field: ${card.title}.`,
      "Redacted summary: review the submitted evidence against the technical briefcase requirements.",
      "Awaiting: supporting evidence, clarification, or follow-up routed through Agent X.",
      "Task for Y Team: validate the evidence and add technical notes to the final submission pack.",
    ],
  }

const buildAgentYTranscript = (
  response: AgentZResponseContent
) => {
  const lines = (response.agentYNotes ?? []).map((item) => `- ${item}`)

  return lines.join("\n")
}

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
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800 shadow-sm">
                      <h3 className="text-base font-semibold text-blue-900">
                        Awaiting Agent X Follow-up
                      </h3>
                      <p className="mt-1 text-xs text-blue-700">
                        You have submitted the required details
                        to Agent X. A follow-up notification
                        will appear shortly with required
                        documents.
                      </p>
                    </div>

                    {showAgentXFollowUp && (
                      <div
                        id="agent-x-followup"
                        className="rounded-2xl border border-blue-200 bg-white p-4 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
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
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                            NEW
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setShowAgentXModal(true)}
                            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0"
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
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
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
                                  className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            {!project?.documents?.length && (
                              <>
                                <li className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                  <span>Site Location Plan</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                  <span>Block Plan</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
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
                              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0"
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
              ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]"
              : isActive
              ? "border-2 border-blue-600 text-blue-600 bg-white shadow-[0_8px_20px_rgba(37,99,235,0.15)]"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }
          ${isSelected ? "ring-4 ring-blue-100" : ""}
        `}
      >
        <StepIcon className="w-5 h-5" />
      </div>

      <span
        className={`text-xs text-center ${
          isSelected || isActive
            ? "text-blue-600 font-semibold"
            : isCompleted
            ? "text-blue-700"
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
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-5 py-5 text-white">
          <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-400/15 ring-1 ring-blue-300/30">
                <Bot className="h-5 w-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
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
        <div className="rounded-[22px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Redacted technical checklist submitted to Agent X (mock).
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="w-5 h-5" />
                Project Summary
              </h2>
              <p className="mt-1 text-sm text-slate-600">
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
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="w-4 h-4 text-blue-600" />
              Property Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
              <div>
                <div className="mb-1 text-xs text-slate-500">
                  Property Type
                </div>
                <div
                  className={`text-sm font-medium ${
                    propertyTypeDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {propertyTypeDisplay.value}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">
                  Site Address
                </div>
                <div
                  className={`text-sm font-medium ${
                    siteAddressDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {siteAddressDisplay.value}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">
                  Postcode
                </div>
                <div
                  className={`text-sm font-medium ${
                    postcodeDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {postcodeDisplay.value}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">
                  Development Purpose
                </div>
                <div
                  className={`text-sm font-medium ${
                    purposeDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {purposeDisplay.value}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Ruler className="w-4 h-4 text-purple-600" />
              Dimensions
            </h3>
            <div className="grid grid-cols-4 gap-4 bg-purple-50 rounded-lg p-4">
              <div>
                <div className="mb-1 text-xs text-slate-500">Length</div>
                <div
                  className={`text-sm font-medium ${
                    lengthDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {lengthDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Width</div>
                <div
                  className={`text-sm font-medium ${
                    widthDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {widthDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Height</div>
                <div
                  className={`text-sm font-medium ${
                    heightDisplay.missing
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {heightDisplay.value} {dimensionUnits}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Units</div>
                <div className="text-sm font-medium capitalize text-slate-900">
                  {dimensionUnits}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertCircle className="w-4 h-4 text-slate-600" />
              Site Constraints
            </h3>
            <ul className="space-y-2">
              {displayedConstraints.length > 0 ? (
                displayedConstraints.map((constraint, idx) => {
                  const missing = isMissingAnswer(constraint.value)
                  return (
                    <li
                      key={`${constraint.label}-${idx}`}
                      className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 text-slate-600">•</span>
                      <span
                        className={missing ? "text-rose-600" : ""}
                      >
                        {constraint.label}: {constraint.value}
                      </span>
                    </li>
                  )
                })
              ) : (
                <li className="text-sm text-slate-500">
                  No constraints available.
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Proposed Materials
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {displayedMaterials.length > 0 ? (
                displayedMaterials.map((material, idx) => {
                  const missing = isMissingAnswer(material)
                  return (
                    <div
                      key={`${material}-${idx}`}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className={missing ? "text-rose-600" : ""}>
                        {material}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-slate-500">
                  No materials provided.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertCircle className="w-4 h-4 text-slate-600" />
              Remaining Missing Details
            </h3>
            {briefcaseCompleted ? (
              missingItems.length > 0 ? (
                <ul className="space-y-2">
                  {missingItems.map((item, idx) => (
                    <li
                      key={`${item.section}-${item.question}-${idx}`}
                      className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
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
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
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
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
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
          card: "border-slate-200 bg-slate-50/80",
          badge: "bg-slate-200 text-slate-700",
          bullet: "bg-slate-500",
        }
      : tone === "amber"
      ? {
          card: "border-blue-200 bg-blue-50/60",
          badge: "bg-blue-100 text-blue-700",
          bullet: "bg-blue-500",
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
  const [selectedAgentZCard, setSelectedAgentZCard] =
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
  const showAgentZResponse = AGENT_Z_ENABLED_STAGE_IDS.includes(
    stage.id as BriefcaseStageContentId
  )
  const StageIcon = stage.icon

  return (
    <>
      <div
        className={`mt-6 ${
          selectedAgentZCard
            ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start"
            : ""
        }`}
      >
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-5 py-5 text-white">
            <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <StageIcon className="h-5 w-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
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
                  showAgentZResponse={showAgentZResponse}
                  onAgentZResponse={() => setSelectedAgentZCard(card)}
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
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  {`Proceed to ${
                    nextStageLabel ?? "Next Stage"
                  }`}
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedAgentZCard && (
          <div className="xl:sticky xl:top-6">
            <AgentZResponseModal
              card={selectedAgentZCard}
              stageLabel={stage.label}
              onClose={() => setSelectedAgentZCard(null)}
            />
          </div>
        )}
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
  showAgentZResponse,
  onAgentZResponse,
}: {
  card: BriefcaseCard
  reviewStatus: "pending" | "completed"
  onMarkPending: () => void
  onMarkCompleted: () => void
  onView: () => void
  showAgentZResponse: boolean
  onAgentZResponse: () => void
}) {
  const toneClasses =
    card.tone === "emerald"
      ? {
          card: "border-slate-200 bg-slate-50/80",
          badge: "bg-slate-200 text-slate-700",
          button:
            "border-slate-200 text-slate-700 hover:bg-slate-100",
        }
      : card.tone === "amber"
      ? {
          card: "border-blue-200 bg-blue-50/60",
          badge: "bg-blue-100 text-blue-700",
          button:
            "border-blue-200 text-blue-700 hover:bg-blue-100",
        }
      : {
          card: "border-blue-200 bg-blue-50/70",
          badge: "bg-blue-100 text-blue-700",
          button:
            "border-blue-200 text-blue-700 hover:bg-blue-100",
        }

  return (
    <div className={`rounded-[22px] border p-4 ${toneClasses.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${toneClasses.badge}`}
          >
            {card.category}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onView}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${toneClasses.button}`}
          >
            View Document
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <h4 className="text-base font-semibold text-slate-950">
          {card.title}
        </h4>
        <p className="text-sm leading-6 text-slate-700">
          {card.summary}
        </p>

        {showAgentZResponse && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onAgentZResponse}
              className="rounded-full border border-slate-300 bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Agent Z Response
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-3">
          <button
            type="button"
            onClick={onMarkPending}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              reviewStatus === "pending"
                ? "bg-yellow-400 text-yellow-950"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={onMarkCompleted}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              reviewStatus === "completed"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Review Completed
          </button>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              reviewStatus === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {reviewStatus === "completed"
              ? "Completed"
              : "Pending"}
          </span>
        </div>
      </div>
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

function AgentZResponseModal({
  card,
  stageLabel,
  onClose,
}: {
  card: BriefcaseCard
  stageLabel: string
  onClose: () => void
}) {
  const response = getAgentZResponseContent(card)
  const transcript = useMemo(
    () => buildAgentYTranscript(response),
    [response]
  )
  const [visibleCharacterCount, setVisibleCharacterCount] =
    useState(0)

  useEffect(() => {
    setVisibleCharacterCount(0)

    const timer = window.setInterval(() => {
      setVisibleCharacterCount((current) => {
        if (current >= transcript.length) {
          window.clearInterval(timer)
          return current
        }

        return current + 1
      })
    }, 12)

    return () => window.clearInterval(timer)
  }, [transcript])

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 text-white shadow-[0_20px_60px_-28px_rgba(2,6,23,0.85)]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_45%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
              <Bot className="h-4 w-4 text-blue-300" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                Agent Z Response
              </p>
              <h4 className="mt-2 text-lg font-semibold text-white">
                {card.title}
              </h4>
              <p className="mt-1.5 text-sm leading-6 text-slate-300">
                {stageLabel} / {response.focus}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-[22px] border border-blue-400/15 bg-slate-900/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-300" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              Agent Y Response
            </p>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-100">
            {transcript.slice(0, visibleCharacterCount)}
            <span className="text-blue-300">
              {visibleCharacterCount < transcript.length ? "|" : ""}
            </span>
          </pre>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          <span>Powered by Agent Z - Zynapse</span>
        </div>
        <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
          Technical Guidance
        </span>
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
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-5 py-5 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex max-w-3xl items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Flag className="h-5 w-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
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

            <div className="w-full max-w-sm rounded-3xl border border-blue-300/20 bg-white/10 p-4 shadow-sm backdrop-blur">
              {submitted ? (
                <div className="rounded-2xl border border-blue-300/20 bg-blue-500/15 px-4 py-3 text-sm text-blue-100">
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
                    className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
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
                          ? "border-blue-200 bg-blue-50/80"
                          : "border-slate-200 bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
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
                            ? "bg-blue-100 text-blue-700"
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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
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
        className="absolute left-0 top-5 h-1 rounded-full bg-blue-600 transition-all duration-300"
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
