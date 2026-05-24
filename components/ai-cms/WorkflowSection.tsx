'use client';

import { motion } from "framer-motion";
import { AlertTriangle, ClipboardCheck, UserCheck, Wrench, CheckCircle2, History } from "lucide-react";

const workflowSteps = [
  {
    icon: AlertTriangle,
    title: "Issue Identification",
    description: "Equipment issues are reported by operators or detected through inspections",
  },
  {
    icon: ClipboardCheck,
    title: "Work Order Creation",
    description: "System generates work orders with all relevant asset and maintenance information",
  },
  {
    icon: UserCheck,
    title: "Assignment & Planning",
    description: "Maintenance planners assign tasks to technicians based on skills and availability",
  },
  {
    icon: Wrench,
    title: "Maintenance Execution",
    description: "Technicians complete work with mobile access to procedures and documentation",
  },
  {
    icon: CheckCircle2,
    title: "Resolution & Logging",
    description: "Work completion is documented with parts used, time spent, and findings",
  },
  {
    icon: History,
    title: "History Tracking",
    description: "All maintenance activities are permanently recorded for compliance and analysis",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-background dark:to-gray-900/50">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Machinery Maintenance Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Streamlined Workflow from Start to Finish
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-CMS guides every maintenance activity through a clear, efficient process
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting line - hidden on mobile */}
            <div className="hidden md:block absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-blue-600"></div>

            <div className="space-y-8">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative flex items-start gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  {/* Icon container */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg z-10 relative">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 blur-md opacity-50"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-300 font-semibold text-lg">
              Continuous Improvement Loop
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Every completed work order feeds back into planning and analytics, helping your team improve maintenance strategies over time
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
