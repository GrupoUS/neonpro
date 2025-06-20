"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Check, Download, FileText, Image, Loader2, X } from "lucide-react";
import React, { useState } from "react";

interface ExportDashboardProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  title?: string;
  className?: string;
}

export function ExportDashboard({
  targetRef,
  filename = "dashboard",
  title = "Dashboard Export",
  className,
}: ExportDashboardProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [exportOptions, setExportOptions] = useState({
    format: "pdf" as "pdf" | "png",
    quality: "high" as "low" | "medium" | "high",
    includeTimestamp: true,
    includeWatermark: false,
    orientation: "portrait" as "portrait" | "landscape",
  });

  const qualityScale = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const handleExport = async () => {
    if (!targetRef.current || isExporting) return;

    setIsExporting(true);
    setExportStatus("idle");

    try {
      // Add export class to hide interactive elements
      targetRef.current.classList.add("exporting");

      const scale = qualityScale[exportOptions.quality];
      const canvas = await html2canvas(targetRef.current, {
        scale,
        backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
        logging: false,
        windowWidth: targetRef.current.scrollWidth,
        windowHeight: targetRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // Style adjustments for export
          const clonedElement = clonedDoc.getElementById(targetRef.current!.id);
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.animation = "none";
          }
        },
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const finalFilename = exportOptions.includeTimestamp
        ? `${filename}-${timestamp}`
        : filename;

      if (exportOptions.format === "pdf") {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: exportOptions.orientation,
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Add watermark if enabled
        if (exportOptions.includeWatermark) {
          pdf.setFontSize(20);
          pdf.setTextColor(150);
          pdf.text("GRUPO US - Confidential", pdfWidth / 2, pdfHeight - 30, {
            align: "center",
          });
        }

        pdf.save(`${finalFilename}.pdf`);
      } else {
        // PNG export
        const link = document.createElement("a");
        link.download = `${finalFilename}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }

      setExportStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setExportStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
    } finally {
      // Remove export class
      targetRef.current?.classList.remove("exporting");
      setIsExporting(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-glass-light/50 dark:bg-glass-dark/50",
          "backdrop-blur-md border border-white/20",
          "text-gray-700 dark:text-gray-300",
          "hover:bg-white/20 dark:hover:bg-white/10",
          "transition-all duration-200",
          className
        )}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isExporting && setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => !isExporting && setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Format Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["pdf", "png"] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() =>
                            setExportOptions((prev) => ({ ...prev, format }))
                          }
                          className={cn(
                            "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                            exportOptions.format === format
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          {format === "pdf" ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium uppercase">
                            {format}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Export Quality
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "high"] as const).map((quality) => (
                        <button
                          key={quality}
                          onClick={() =>
                            setExportOptions((prev) => ({ ...prev, quality }))
                          }
                          className={cn(
                            "p-2 rounded-lg border text-sm font-medium capitalize transition-all",
                            exportOptions.quality === quality
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation (PDF only) */}
                  {exportOptions.format === "pdf" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Page Orientation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["portrait", "landscape"] as const).map(
                          (orientation) => (
                            <button
                              key={orientation}
                              onClick={() =>
                                setExportOptions((prev) => ({
                                  ...prev,
                                  orientation,
                                }))
                              }
                              className={cn(
                                "p-2 rounded-lg border text-sm font-medium capitalize transition-all",
                                exportOptions.orientation === orientation
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              )}
                            >
                              {orientation}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeTimestamp}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includeTimestamp: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Include timestamp in filename
                      </span>
                    </label>

                    {exportOptions.format === "pdf" && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeWatermark}
                          onChange={(e) =>
                            setExportOptions((prev) => ({
                              ...prev,
                              includeWatermark: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Add watermark
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                      "bg-blue-600 hover:bg-blue-700 text-white font-medium",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200"
                    )}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : exportStatus === "success" ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Export Successful!</span>
                      </>
                    ) : exportStatus === "error" ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Export Failed</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export Dashboard</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global styles for export */}
      <style jsx global>{`
        .exporting * {
          animation: none !important;
          transition: none !important;
        }
        .exporting .hover\\:scale-105:hover {
          transform: none !important;
        }
        .exporting button {
          cursor: default !important;
        }
      `}</style>
    </>
  );
}
