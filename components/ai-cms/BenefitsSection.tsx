'use client';

import { motion } from "framer-motion";
import { 
  Clock, 
  TrendingDown, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Users,
  BarChart3,
  Shield
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Better Coordination",
    description: "Centralized platform improves communication between planners, technicians, and managers",
    metric: "40% faster task assignment",
  },
  {
    icon: Clock,
    title: "Reduced Downtime",
    description: "Proactive maintenance and faster response times keep equipment running longer",
    metric: "30% less unplanned downtime",
  },
  {
    icon: BarChart3,
    title: "Improved Planning",
    description: "Data-driven scheduling optimizes resource allocation and prevents conflicts",
    metric: "50% better resource utilization",
  },
  {
    icon: Zap,
    title: "Increased Reliability",
    description: "Consistent preventive maintenance extends equipment life and performance",
    metric: "25% longer asset lifespan",
  },
  {
    icon: CheckCircle2,
    title: "Faster Resolution",
    description: "Access to complete asset history and documentation speeds up troubleshooting",
    metric: "35% quicker issue resolution",
  },
  {
    icon: FileText,
    title: "Organized Records",
    description: "Digital documentation eliminates lost paperwork and ensures compliance",
    metric: "100% audit trail coverage",
  },
  {
    icon: TrendingDown,
    title: "Lower Costs",
    description: "Optimized parts inventory and reduced emergency repairs improve bottom line",
    metric: "20% maintenance cost savings",
  },
  {
    icon: Shield,
    title: "Enhanced Efficiency",
    description: "Streamlined workflows eliminate redundant steps and administrative overhead",
    metric: "45% less paperwork",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/10">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Measurable Results
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Transform Your Machinery Maintenance Operations
          </h2>
          <p className="text-lg text-muted-foreground">
            Organizations using AI-CMS see significant improvements across key operational metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {benefit.description}
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {benefit.metric}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROI Callout */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                Typical ROI Within 6 Months
              </h3>
              <p className="text-blue-100 text-lg">
                Most organizations recover their investment through reduced downtime and improved efficiency
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">30%</div>
                <div className="text-blue-100">Reduction in Emergency Repairs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">45%</div>
                <div className="text-blue-100">Faster Work Order Processing</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">25%</div>
                <div className="text-blue-100">Lower Maintenance Costs</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
