'use client';

import { Button } from "../ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            className="space-y-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Modern Machinery Maintenance Management
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              Streamline Industrial{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Machinery Maintenance Operations
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Centralize work orders, optimize maintenance planning, and improve asset reliability with 
              AI-CMS—the comprehensive maintenance management platform built for manufacturing and industrial enterprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg">
                Request Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Workflow Management</p>
                  <p className="text-sm text-muted-foreground">Streamline work order lifecycle</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Asset Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitor equipment health</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Dashboard Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Machinery Maintenance Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Real-time overview</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-muted-foreground mb-1">Active Work Orders</p>
                  <p className="text-2xl font-semibold">24</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-muted-foreground mb-1">Asset Health</p>
                  <p className="text-2xl font-semibold">92%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Order List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium mb-3">Recent Work Orders</p>
                <div className="space-y-3">
                  {[
                    { title: "Motor Bearing Replacement", status: "In Progress", priority: "High" },
                    { title: "Conveyor Belt Maintenance", status: "Scheduled", priority: "Medium" },
                    { title: "Pump System Inspection", status: "Pending", priority: "Low" }
                  ].map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{order.title}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                        order.priority === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" :
                        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      }`}>
                        {order.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating status cards */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">System Active</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
