"use client"

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import axiosInstance from "@/lib/axiosinstance"
import { useAuthStore } from "@/lib/zustand"

type EmployeeProfile = {
  _id?: string
  profileId?: string
  userRefId?: string
  name: string
  email: string
  phoneNumber: string
  profilePicture?: string
  createdAt?: string
  updatedAt?: string
}

type ProfileFormValues = {
  name: string
  email: string
  phoneNumber: string
}

const PHONE_PREFIX = "+91 "

const getPhoneDigits = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, "")
  return digitsOnly.startsWith("91") ? digitsOnly.slice(2) : digitsOnly
}

const normalizePhoneNumber = (value: string): string => {
  return `${PHONE_PREFIX}${getPhoneDigits(value)}`
}

const EMPTY_FORM: ProfileFormValues = {
  name: "",
  email: "",
  phoneNumber: PHONE_PREFIX,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const toEmployeeProfile = (value: unknown): EmployeeProfile | null => {
  if (!isRecord(value)) return null

  const name = typeof value.name === "string" ? value.name : ""
  const email = typeof value.email === "string" ? value.email : ""
  const phoneNumber =
    typeof value.phoneNumber === "string" ? value.phoneNumber : ""

  if (!name && !email && !phoneNumber) return null

  return {
    _id: typeof value._id === "string" ? value._id : undefined,
    profileId:
      typeof value.profileId === "string" ? value.profileId : undefined,
    userRefId:
      typeof value.userRefId === "string" ? value.userRefId : undefined,
    name,
    email,
    phoneNumber,
    profilePicture:
      typeof value.profilePicture === "string"
        ? value.profilePicture
        : undefined,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  }
}

const extractProfile = (payload: unknown): EmployeeProfile | null => {
  const direct = toEmployeeProfile(payload)
  if (direct) return direct

  if (!isRecord(payload)) return null

  const firstLevel = [payload.data, payload.profile]
  for (const item of firstLevel) {
    const parsed = toEmployeeProfile(item)
    if (parsed) return parsed
  }

  if (isRecord(payload.data)) {
    const nested = [payload.data.data, payload.data.profile]
    for (const item of nested) {
      const parsed = toEmployeeProfile(item)
      if (parsed) return parsed
    }
  }

  return null
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isRecord(error) && isRecord(error.response) && isRecord(error.response.data)) {
    const apiMessage = error.response.data.message
    if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
      return apiMessage
    }
  }
  return fallback
}

export default function ProfilePage() {
  const userId = useAuthStore((state) => state.userId)
  const [formValues, setFormValues] =
    useState<ProfileFormValues>(EMPTY_FORM)
  const [profilePicture, setProfilePicture] =
    useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      setFetchError("User ID is not available. Please sign in again.")
      return
    }

    setLoading(true)
    setFetchError(null)
    setSaveMessage(null)
    setSaveError(null)

    try {
      const response = await axiosInstance.get(
        `/employee/profile/${userId}`
      )
      const profile = extractProfile(response.data)
      if (!profile) {
        setFetchError("Profile response format is invalid.")
        return
      }

      setFormValues({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phoneNumber: normalizePhoneNumber(profile.phoneNumber ?? ""),
      })
      setProfilePicture(profile.profilePicture ?? null)
    } catch (error: unknown) {
      setFetchError(
        getErrorMessage(error, "Failed to load employee profile.")
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleInputChange = (
    field: keyof ProfileFormValues,
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]:
        field === "phoneNumber" ? normalizePhoneNumber(value) : value,
    }))
    if (saveMessage) setSaveMessage(null)
    if (saveError) setSaveError(null)
  }

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userId) {
      setSaveError("User ID is not available. Please sign in again.")
      return
    }

    if (!getPhoneDigits(formValues.phoneNumber)) {
      setSaveError("Please enter a mobile number after +91.")
      return
    }

    setSaving(true)
    setSaveMessage(null)
    setSaveError(null)

    try {
      await axiosInstance.put(`/employee/profile/${userId}`, {
        name: formValues.name.trim(),
        // email: formValues.email.trim(),
        phoneNumber: normalizePhoneNumber(formValues.phoneNumber),
      })
      setSaveMessage("Profile details updated successfully.")
    } catch (error: unknown) {
      setSaveError(
        getErrorMessage(error, "Failed to update profile details.")
      )
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!userId) {
      setUploadError("User ID is not available. Please sign in again.")
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPicture(true)
    setUploadMessage(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const response = await axiosInstance.put(
        `/employee/profile/${userId}/picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const profile = extractProfile(response.data)
      if (profile?.profilePicture) {
        setProfilePicture(profile.profilePicture)
      } else {
        await loadProfile()
      }

      setUploadMessage("Profile picture updated successfully.")
    } catch (error: unknown) {
      setUploadError(
        getErrorMessage(error, "Failed to upload profile picture.")
      )
    } finally {
      event.target.value = ""
      setUploadingPicture(false)
    }
  }

  const initials =
    formValues.name
      .trim()
      .split(/\s+/)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "EM"

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Loading employee profile...
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-rose-700">
          Unable to load profile
        </h1>
        <p className="mt-2 text-sm text-rose-600">{fetchError}</p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Employee Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Profile
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Update your name, phone number, and profile picture.
        </p>
       
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Employee profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-semibold text-slate-500">
                  {initials}
                </span>
              )}
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Profile Picture
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploadingPicture}
                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            {uploadMessage && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {uploadMessage}
              </p>
            )}
            {uploadError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {uploadError}
              </p>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Name
              </span>
              <input
                type="text"
                value={formValues.name}
                onChange={(event) =>
                  handleInputChange("name", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Jane Doe"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Email
              </span>
              <input
                type="email"
                value={formValues.email}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                placeholder="jane@example.com"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Phone Number
              </span>
              <input
                type="tel"
                value={formValues.phoneNumber}
                onChange={(event) =>
                  handleInputChange("phoneNumber", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="+91 9876543210"
                required
              />
            </label>

            {saveMessage && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {saveMessage}
              </p>
            )}
            {saveError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {saveError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || uploadingPicture}
                className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
