"use client"

import { CheckCircle, Lock, ArrowRight } from "lucide-react"
import { useState } from "react"
import CILReviewModal from "./CILReviewModal"

export default function AgentY() {
  const [openCLI, SetOpenCLI] = useState(false)
  const [cilApproved, setCilApproved] = useState(false)
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-12 gap-6">

        {/* ================= LEFT PANEL ================= */}
        <div className="col-span-8 space-y-6">

          {/* Active Tasks */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Active Tasks</h2>
              <div className="flex gap-2">
                <button className="px-4 py-1 rounded-md bg-green-100 text-green-600 text-sm font-medium">
                  All Tasks
                </button>
                <button className="px-4 py-1 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
                  Auto-Fix Ready
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b">
                <tr>
                  <th className="text-left py-2">TASK ID</th>
                  <th className="text-left py-2">REASON / ISSUE</th>
                  <th className="text-left py-2">STATUS</th>
                  <th className="text-left py-2">AUTOMATION / ACTION</th>
                  <th className="text-left py-2">TIMER</th>
                </tr>
              </thead>
              <tbody className="divide-y">

                <tr>
                  <td className="py-4 text-gray-500">#Y-9102</td>
                  <td>
                    <p className="font-medium">Missing CII Form</p>
                    <p className="text-xs text-gray-400">
                      Council validation: Missing or incorrect CII form.
                    </p>
                  </td>
                  <td>
                    {cilApproved ? (
                      <span className="px-3 py-1 rounded bg-green-100 text-green-600 text-xs">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-600 text-xs">
                        PENDING FIX
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (!cilApproved) SetOpenCLI(true)
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-medium ${
                        cilApproved
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                      }`}
                      disabled={cilApproved}
                    >
                      {cilApproved ? "ATTACHED" : "Generate CIL Form"}
                    </button>
                  </td>
                  <td
                    className={
                      cilApproved ? "text-green-500" : "text-gray-400"
                    }
                  >
                    {cilApproved ? "Done" : "02:01s"}
                  </td>
                </tr>

                <tr>
                  <td className="py-4 text-gray-500">#Y-9103</td>
                  <td>
                    <p className="font-medium">No Location Plan</p>
                    <p className="text-xs text-gray-400">
                      Missing site boundary and location plan
                    </p>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded bg-green-100 text-green-600 text-xs">
                      AUTO-FIX READY
                    </span>
                  </td>
                  <td>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-medium cursor-pointer">
                 Fetch Location Plan
                    </button>
                  </td>
                  <td className="text-gray-400">Unlocked</td>
                </tr>

                <tr>
                  <td className="py-4 text-gray-500">#Y-9082</td>
                  <td>
                    <p className="font-medium">Contextual Refinement</p>
                    <p className="text-xs text-gray-400">
                      Awaiting parameter data from Agent X
                    </p>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded bg-orange-100 text-orange-600 text-xs">
                      AWAITING AGENT X
                    </span>
                  </td>
                  <td className="flex items-center gap-2 text-gray-400 text-xs">
                    <Lock size={14} />
                    Manual review locked
                  </td>
                  <td className="text-gray-400">04:12s</td>
                </tr>

                <tr>
                  <td className="py-4 text-gray-500">#Y-9085</td>
                  <td>
                    <p className="font-medium">Metadata Tagging</p>
                    <p className="text-xs text-gray-400">
                      Post-processing document structure
                    </p>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded bg-green-100 text-green-600 text-xs">
                      READY
                    </span>
                  </td>
                  <td>
                    <button className="px-4 py-2 bg-green-400 text-white rounded-lg text-xs font-medium">
                      EXECUTE
                    </button>
                  </td>
                  <td className="text-green-500">Ready</td>
                </tr>

              </tbody>
            </table>

            <p className="text-xs text-gray-400 mt-4">
              Showing 4 of 8 active tasks in queue
            </p>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-2 gap-6">

            {/* Automation Throughput */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  AUTOMATION THROUGHPUT
                </h3>
                <span className="text-green-500 text-xs font-medium">
                  LIVE VIEW
                </span>
              </div>

              <div className="flex items-end gap-6 h-20">
                <div className="w-10 bg-green-200 rounded h-10"></div>
                <div className="w-10 bg-green-300 rounded h-14"></div>
                <div className="w-10 bg-green-400 rounded h-16"></div>
                <div className="w-10 bg-green-500 rounded h-20"></div>
                <div className="w-10 bg-green-300 rounded h-14"></div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Resolution packets generated (Auto-Fix)
              </p>
            </div>

            {/* Agent Connectivity */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold mb-4">
                AGENT CONNECTIVITY
              </h3>

              <div className="w-32 h-32 border-4 border-green-300 rounded-full flex items-center justify-center">
                <span className="text-green-500 font-semibold text-sm">
                  Link: X & Y
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Protocol: HTTPS/2 Synchronized
              </p>
            </div>

          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="col-span-4 space-y-6">

          {/* Dependency Panel */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Dependency Panel</h2>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-lg">
              <span className="text-xs text-yellow-600 font-medium">
                PENDING
              </span>
              <p className="font-medium mt-1">
                Market Segment Analysis Report
              </p>

              <div className="w-full bg-gray-200 h-2 rounded mt-3">
                <div className="bg-yellow-500 h-2 rounded w-2/3"></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">65%</p>
            </div>

            <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded-lg">
              <span className="text-xs text-green-600 font-medium">
                RECEIVED
              </span>
              <p className="font-medium mt-1">Customer Persona Profiles</p>

              <button className="mt-3 w-full py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium">
                Pull Asset
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-500">
              <CheckCircle size={14} className="inline mr-2 text-green-500" />
              SYSTEM ALERT: Agent X performance is optimal.
            </div>
          </div>

          {/* Interlinked Journey */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">
              Interlinked Journey
            </h3>

            <p className="text-sm text-gray-300 mb-4">
              Agent Y is part of a collaborative mesh.
            </p>

            <button className="w-full py-2 bg-white text-black rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
              REQUEST PEER VIEW <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
      <CILReviewModal
        open={openCLI}
        onClose={() => SetOpenCLI(false)}
        onApprove={() => {
          setCilApproved(true)
          SetOpenCLI(false)
        }}
      />
    </div>
  )
}
