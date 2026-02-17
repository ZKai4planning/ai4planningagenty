"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AgentUser,
  INITIAL_USERS,
  USERS_STORAGE_KEY,
} from "@/lib/agent-users"

type NewUserState = {
  name: string
  email: string
  role: string
}

const buildNextUserId = (users: AgentUser[]) => {
  const max = users.reduce((currentMax, user) => {
    const numeric = Number.parseInt(user.id.replace("AY-", ""), 10)
    if (Number.isNaN(numeric)) return currentMax
    return Math.max(currentMax, numeric)
  }, 0)
  return `AY-${String(max + 1).padStart(3, "0")}`
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<AgentUser[]>(INITIAL_USERS)
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [newUser, setNewUser] = useState<NewUserState>({
    name: "",
    email: "",
    role: "",
  })
  const [userError, setUserError] = useState("")
  const [showCreateUser, setShowCreateUser] = useState(false)

  const activeCount = useMemo(
    () => users.filter((user) => user.status === "Active").length,
    [users]
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AgentUser[]
        if (Array.isArray(parsed)) {
          setUsers(parsed)
        }
      }
    } catch {
      // Keep defaults if storage is unavailable.
    } finally {
      setUsersLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!usersLoaded || typeof window === "undefined") return
    try {
      localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(users)
      )
    } catch {
      // Ignore storage failures for static UI.
    }
  }, [users, usersLoaded])

  const updateNewUser = (
    field: keyof NewUserState,
    value: string
  ) => {
    setNewUser((prev) => ({ ...prev, [field]: value }))
    if (userError) setUserError("")
  }

  const canCreateUser =
    newUser.name.trim() !== "" &&
    newUser.email.trim() !== "" &&
    newUser.role.trim() !== ""

  const createUser = () => {
    const name = newUser.name.trim()
    const email = newUser.email.trim()
    const role = newUser.role.trim()
    if (!name || !email || !role) {
      setUserError("Name, email, and role are required.")
      return
    }

    const nextId = buildNextUserId(users)
    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        email,
        role,
        status: "Active",
      },
    ])
    setNewUser({ name: "", email: "", role: "" })
    setUserError("")
    setShowCreateUser(false)
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Agent Y Team
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Users Management
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Create Agent Y team users and grant access to projects
              from the Dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/Projects"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              View Projects
            </Link>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              {activeCount} active users
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Agent Y Users
            </h2>
            <p className="text-xs text-slate-500">
              Create Agent Y team users, then grant access per project.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {users.length} total users
            </div>
            <button
              type="button"
              onClick={() => setShowCreateUser(true)}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm active:translate-y-0 active:scale-95"
            >
              Create User
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Current Team
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">
                    ID
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    Role
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                          user.status === "Active"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No users created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {showCreateUser && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowCreateUser(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Create User
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Add Agent Y Team Member
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <label className="space-y-1 text-xs text-slate-500">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Name
                  </span>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(event) =>
                      updateNewUser("name", event.target.value)
                    }
                    placeholder="User name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-500">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Email
                  </span>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(event) =>
                      updateNewUser("email", event.target.value)
                    }
                    placeholder="name@agent-y.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-500">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Role
                  </span>
                  <input
                    type="text"
                    value={newUser.role}
                    onChange={(event) =>
                      updateNewUser("role", event.target.value)
                    }
                    placeholder="Role or responsibility"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              {userError && (
                <p className="mt-3 text-xs font-semibold text-rose-600">
                  {userError}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createUser}
                  disabled={!canCreateUser}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
