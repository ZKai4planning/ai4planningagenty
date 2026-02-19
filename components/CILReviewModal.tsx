"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onApprove: () => void
}

const TOTAL_FILL_STEPS = 5

export default function CILReviewModal({
  open,
  onClose,
  onApprove,
}: Props) {
  const [fillStep, setFillStep] = useState(0)

  useEffect(() => {
    if (!open) {
      setFillStep(0)
      return
    }
    let step = 0
    setFillStep(0)
    const interval = window.setInterval(() => {
      step += 1
      setFillStep(step)
      if (step >= TOTAL_FILL_STEPS) {
        window.clearInterval(interval)
      }
    }, 1200)
    return () => window.clearInterval(interval)
  }, [open])

  if (!open) return null

  const isFilled = (step: number) => fillStep >= step

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">
            Review Generated CIL Form - Case #001
          </h1>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Split Layout */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* LEFT SIDE - PDF Preview */}
          <div className="w-7/12 bg-gray-100 p-8 overflow-y-auto">
            <div className="bg-white shadow-lg mx-auto w-full max-w-2xl p-10 border">

              <h2 className="text-lg font-bold mb-6">
                Community Infrastructure Levy (CIL) - Form 1
              </h2>

              <div className="space-y-4 text-sm">

                <div className="relative bg-blue-50 border border-blue-200 p-3 rounded overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-slate-200/70 animate-pulse transition-opacity ${
                      isFilled(1) ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <div
                    className={`relative transition-all duration-500 ${
                      isFilled(1)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    }`}
                  >
                    Ref: PL/2023/0842/CIL
                  </div>
                </div>

                <div className="relative bg-blue-50 border border-blue-200 p-3 rounded overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-slate-200/70 animate-pulse transition-opacity ${
                      isFilled(2) ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <div
                    className={`relative transition-all duration-500 ${
                      isFilled(2)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    }`}
                  >
                    14-18 Kensington High Street, London, W8 4EE
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative bg-blue-50 border border-blue-200 p-3 rounded overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-slate-200/70 animate-pulse transition-opacity ${
                        isFilled(3) ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <div
                      className={`relative transition-all duration-500 ${
                        isFilled(3)
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1"
                      }`}
                    >
                      450.00 sqm
                    </div>
                  </div>

                  <div className="relative bg-blue-50 border border-blue-200 p-3 rounded overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-slate-200/70 animate-pulse transition-opacity ${
                        isFilled(4) ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <div
                      className={`relative transition-all duration-500 ${
                        isFilled(4)
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1"
                      }`}
                    >
                      1,240.50 sqm
                    </div>
                  </div>
                </div>

                <div className="relative bg-blue-600 text-white p-6 rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-slate-200/30 animate-pulse transition-opacity ${
                      isFilled(5) ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <div
                    className={`relative transition-all duration-500 ${
                      isFilled(5)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    }`}
                  >
                    <p className="text-xs opacity-70">Total Levy Amount</p>
                    <p className="text-3xl font-bold">£214,845.00</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Data Context */}
          <div className="w-5/12 p-6 overflow-y-auto border-l">

            <h3 className="text-sm font-bold uppercase mb-4">
              Data Source Context
            </h3>

            <div className="space-y-4 text-sm">

              <div className="p-4 bg-gray-50 rounded border">
                <p className="font-semibold">Site Address</p>
                <p className="text-gray-500">
                  Validated against planning DB.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded border">
                <p className="font-semibold">Floor Space Calculation</p>
                <p className="text-green-600 text-xs font-semibold">
                  99% CONFIDENCE
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="font-semibold text-sm">
                  Validation Requirement
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Please ensure proposed floor space includes balconies over
                  1.5m depth.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-blue-700 border-2 border-blue-500 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onApprove}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
          >
            Approve & Attach
          </button>
        </div>

      </div>
    </div>
  )
}

