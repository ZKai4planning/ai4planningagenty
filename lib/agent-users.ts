export type AgentUser = {
  id: string
  name: string
  role: string
  email: string
  status: "Active" | "Inactive"
}

export const USERS_STORAGE_KEY = "ai4planning_users"

export const INITIAL_USERS: AgentUser[] = [
  {
    id: "AY-001",
    name: "Aarav Sharma",
    role: "Lead Planner",
    email: "aarav@agent-y.com",
    status: "Active",
  },
  {
    id: "AY-002",
    name: "Diya Patel",
    role: "CAD Specialist",
    email: "diya@agent-y.com",
    status: "Active",
  },
  {
    id: "AY-003",
    name: "Rohit Verma",
    role: "QA Reviewer",
    email: "rohit@agent-y.com",
    status: "Active",
  },
  {
    id: "AY-004",
    name: "Meera Nair",
    role: "Project Coordinator",
    email: "meera@agent-y.com",
    status: "Active",
  },
  {
    id: "AY-005",
    name: "Kabir Joshi",
    role: "Planner",
    email: "kabir@agent-y.com",
    status: "Active",
  },
  {
    id: "AY-006",
    name: "Isha Kapoor",
    role: "CAD Drafter",
    email: "isha@agent-y.com",
    status: "Inactive",
  },
]
