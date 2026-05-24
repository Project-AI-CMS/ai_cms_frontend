'use client';

import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Calendar, 
  Box, 
  Package, 
  BarChart3, 
  Shield,
  Activity,
  History,
  Users
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Work Order Management",
    description: "Create, assign, and track work orders from initiation to completion with full audit trails",
    color: "blue",
  },
  {
    icon: Calendar,
    title: "Maintenance Planning",
    description: "Schedule preventive and predictive maintenance to minimize downtime and extend asset life",
    color: "indigo",
  },
  {
    icon: Box,
    title: "Asset Management",
    description: "Centralize asset information, maintenance history, and documentation in one system",
    color: "purple",
  },
  {
    icon: Package,
    title: "Inventory & Spare Parts",
    description: "Track spare parts, manage stock levels, and coordinate procurement with maintenance needs",
    color: "green",
  },
  {
    icon: Calendar,
    title: "Maintenance Scheduling",
    description: "Optimize technician assignments and balance workloads across your maintenance team",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Control permissions and workflows based on roles—technicians, planners, and managers",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Generate insights on maintenance KPIs, costs, and equipment performance trends",
    color: "pink",
  },
  {
    icon: Activity,
    title: "Asset Health Insights",
    description: "Monitor equipment condition and receive early warnings about potential failures",
    color: "teal",
  },
  {
    icon: History,
    title: "Maintenance History",
    description: "Access complete maintenance records and identify recurring issues across assets",
    color: "violet",
  },
];

const colorClasses = {
  blue: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  indigo: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
  purple: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  green: "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  orange: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  cyan: "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400",
  pink: "bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  teal: "bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  violet: "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
};

export function CoreFeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Complete Machinery Maintenance Management Suite
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to digitize and optimize your maintenance operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
