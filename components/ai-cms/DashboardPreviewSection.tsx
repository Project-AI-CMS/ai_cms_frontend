'use client';

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Operational Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Complete Visibility Across Operations
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitor work orders, asset conditions, and maintenance performance from a unified dashboard
          </p>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main Dashboard Container */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold mb-1">Machinery Maintenance Overview</h3>
                <p className="text-muted-foreground">Last updated: Just now</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">All Systems Operational</span>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
                </div>
                <h4 className="text-sm text-muted-foreground mb-1">Open Work Orders</h4>
                <p className="text-3xl font-semibold">24</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8%</span>
                </div>
                <h4 className="text-sm text-muted-foreground mb-1">Completed This Week</h4>
                <p className="text-3xl font-semibold">47</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">-5%</span>
                </div>
                <h4 className="text-sm text-muted-foreground mb-1">High Priority</h4>
                <p className="text-3xl font-semibold">8</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15%</span>
                </div>
                <h4 className="text-sm text-muted-foreground mb-1">Asset Health Avg</h4>
                <p className="text-3xl font-semibold">92%</p>
              </div>
            </div>

            {/* Bottom Section - Charts/Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Maintenance Schedule */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-4">Upcoming Maintenance</h4>
                <div className="space-y-4">
                  {[
                    { asset: "Conveyor System A", date: "May 24", type: "Preventive" },
                    { asset: "Hydraulic Press #3", date: "May 25", type: "Inspection" },
                    { asset: "Cooling Tower B", date: "May 26", type: "Preventive" },
                    { asset: "Air Compressor Unit", date: "May 27", type: "Calibration" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.asset}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asset Conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-4">Asset Health Summary</h4>
                <div className="space-y-4">
                  {[
                    { category: "Critical Assets", health: 95, color: "green" },
                    { category: "Production Equipment", health: 88, color: "blue" },
                    { category: "Auxiliary Systems", health: 92, color: "indigo" },
                    { category: "Infrastructure", health: 78, color: "yellow" },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm font-semibold">{item.health}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.color === "green" ? "bg-green-600" :
                            item.color === "blue" ? "bg-blue-600" :
                            item.color === "indigo" ? "bg-indigo-600" :
                            "bg-yellow-600"
                          }`}
                          style={{ width: `${item.health}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
