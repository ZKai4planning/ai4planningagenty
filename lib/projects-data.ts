export type ProjectStatus = "In Progress" | "Completed" | "Closed"

export type AcceptanceStatus = "Pending" | "Accepted" | "Rejected"

export type DocumentStatus = "Pending" | "Validated" | "Not Validated"

export type ProjectMessageType =
  | "Document Issue"
  | "Drawing Issue"
  | "General"
  | "Chat"
  | "Documents Delivered"
  | "Drawings Delivered"

export type ProjectMessage = {
  id: string
  createdAt: string
  type: ProjectMessageType
  sender?: "Agent X" | "Agent Y"
  message: string
}

export type Project = {
  id: string
  serviceId: string
  serviceName: string
  subServices: string[]
  clientQuestionnaire?: {
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
  clientName?: string
  location?: string
  postcode?: string
  documentSubServices: string[]
  cadSubServices: string[]
  drawings: string[]
  documents: string[]
  uploadedDocuments: string[]
  deliverables: string[]
  assignees: string[]
  documentAssignee: string
  drawingAssignee: string
  accessUsers: string[]
  documentStatuses: Record<string, DocumentStatus>
  drawingStatuses: Record<string, DocumentStatus>
  documentsSentToAgentX: boolean
  documentsSentAt: string
  uploadedDrawings: string[]
  drawingsSentToAgentX: boolean
  drawingsSentAt: string
  messages: ProjectMessage[]
  status: ProjectStatus
  acceptance: AcceptanceStatus
  createdAt: string
  origin: string
  destination: string
  startAt: string
  endAt: string
}

export const PROJECTS_STORAGE_KEY = "ai4planning_projects"

const normalizeProjectId = (id: unknown): string => {
  if (id === "PRJ-1001") return "Z7@qL2"
  return typeof id === "string" ? id : ""
}

export const initialProjects: Project[] = [
  {
    id: "Z7@qL2",
    serviceId: "HSPC000-07",
    serviceName: "Residental-home owners & landlords",
    subServices: ["householder planning consent"],
    clientQuestionnaire: {
      propertyDetails: {
        applicantFullName: "Zafer Khan",
        contactEmailOrPhone:
          "zafer.khan@ai4planning.com / 07768262279",
        siteAddress: "42 Brick Lane, London",
        postcode: "E1 6RF",
        propertyType: "Terraced house",
        ownershipStatus: "Freehold",
        conservationOrListed: "No",
        purposeOfDevelopment: "Rear extension",
      },
      dimensions: {
        existingPropertyWidthM: "5.4",
        existingPropertyDepthM: "11.8",
        proposedExtensionDepthM: "3.6",
        proposedExtensionHeightM: "3.2",
        externalMaterials: "Match existing",
        briefDescription:
          "Single-storey rear extension with open-plan kitchen-dining and rear glazing.",
      },
      constraints: {
        listedBuilding: "No",
        tpo: "Don't know",
        floodZone: "No",
        vehicleAccess: "Yes",
        preApplicationAdvice: "No",
        additionalConsentsRequired: "None",
      },
    },
    documentSubServices: ["householder planning consent"],
    cadSubServices: ["CAD Drafting"],
    drawings: ["Foundation Plan v2"],
    documents: [
      "Site Location Plan",
      "Block Plan",
      "Existing Floor Plan",
      "Proposed Floor Plan",
      "Design & Access Statement",
    ],
    uploadedDocuments: [],
    deliverables: [],
    assignees: [],
    documentAssignee: "",
    drawingAssignee: "",
    accessUsers: ["AY-001", "AY-002"],
    documentStatuses: {
      "Site Location Plan": "Pending",
      "Block Plan": "Pending",
      "Existing Floor Plan": "Pending",
      "Proposed Floor Plan": "Pending",
      "Design & Access Statement": "Pending",
    },
    drawingStatuses: {
      "Foundation Plan v2": "Pending",
    },
    documentsSentToAgentX: false,
    documentsSentAt: "",
    uploadedDrawings: [],
    drawingsSentToAgentX: false,
    drawingsSentAt: "",
    messages: [],
    status: "In Progress",
    acceptance: "Pending",
    createdAt: "2026-02-01",
    origin: "Agent X",
    destination: "Agent Y (India)",
    startAt: "",
    endAt: "",
  },
]

const buildStatusMap = (
  items: string[],
  existing?: Record<string, DocumentStatus>
) =>
  items.reduce<Record<string, DocumentStatus>>(
    (acc, item) => {
      acc[item] = existing?.[item] ?? "Pending"
      return acc
    },
    {}
  )

const ensureStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string")
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value]
  }
  return []
}

const normalizeProjectStatus = (
  status: unknown
): ProjectStatus => {
  if (
    status === "In Progress" ||
    status === "Completed" ||
    status === "Closed"
  ) {
    return status
  }
  if (status === "Submitted") return "Completed"
  if (status === "Rejected") return "Closed"
  return "In Progress"
}

export const normalizeProject = (raw: Project): Project => {
  const documents = ensureStringArray(raw.documents)
  const drawings = ensureStringArray(raw.drawings)
  const accessUsers = ensureStringArray(raw.accessUsers)
  const assignees = ensureStringArray(raw.assignees)
  const deliverables = ensureStringArray(raw.deliverables)
  const subServices = ensureStringArray(raw.subServices)
  let documentSubServices = ensureStringArray(
    (raw as Project).documentSubServices
  )
  let cadSubServices = ensureStringArray(
    (raw as Project).cadSubServices
  )
  if (documentSubServices.length === 0 && cadSubServices.length === 0) {
    const classification = subServices.reduce<{
      documents: string[]
      cad: string[]
    }>(
      (acc, item) => {
        if (/cad|draft|drawing/i.test(item)) {
          acc.cad.push(item)
        } else {
          acc.documents.push(item)
        }
        return acc
      },
      { documents: [], cad: [] }
    )
    documentSubServices = classification.documents
    cadSubServices = classification.cad
  }
  const mergedSubServices = [
    ...documentSubServices,
    ...cadSubServices,
  ]
  const documentAssignee =
    typeof (raw as Project).documentAssignee === "string"
      ? (raw as Project).documentAssignee
      : assignees[0] ?? ""
  const drawingAssignee =
    typeof (raw as Project).drawingAssignee === "string"
      ? (raw as Project).drawingAssignee
      : assignees[1] ?? ""
  const uploadedDocuments = ensureStringArray(
    (raw as Project).uploadedDocuments
  )
  const uploadedDrawings = ensureStringArray(
    (raw as Project).uploadedDrawings
  )
  return {
    ...raw,
    id: normalizeProjectId(raw.id),
    documents,
    drawings,
    accessUsers,
    assignees:
      assignees.length > 0
        ? assignees
        : [documentAssignee, drawingAssignee].filter(Boolean),
    documentAssignee,
    drawingAssignee,
    deliverables,
    subServices:
      mergedSubServices.length > 0
        ? Array.from(new Set(mergedSubServices))
        : subServices,
    documentSubServices,
    cadSubServices,
    uploadedDocuments,
    uploadedDrawings,
    documentStatuses: buildStatusMap(
      documents,
      raw.documentStatuses
    ),
    drawingStatuses: buildStatusMap(
      drawings,
      raw.drawingStatuses
    ),
    documentsSentToAgentX: Boolean(raw.documentsSentToAgentX),
    documentsSentAt: raw.documentsSentAt ?? "",
    drawingsSentToAgentX: Boolean(raw.drawingsSentToAgentX),
    drawingsSentAt: raw.drawingsSentAt ?? "",
    messages: Array.isArray(raw.messages) ? raw.messages : [],
    status: normalizeProjectStatus(raw.status),
  }
}

export const normalizeProjects = (raw: unknown): Project[] => {
  if (!Array.isArray(raw)) return initialProjects
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => normalizeProject(item as Project))
}
