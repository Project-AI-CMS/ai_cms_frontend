'use client';

import { motion } from "framer-motion";
import { AlertCircle, FileX, Clock, Users, Workflow, Package } from "lucide-react";

const challenges = [
  {
    icon: FileX,
    title: "Manual Tracking",
    description: "Paper-based maintenance records lead to lost information and compliance issues",
  },
  {
    icon: Clock,
    title: "Delayed Assignments",
    description: "Work orders get stuck in approval chains, causing equipment downtime",
  },
  {
    icon: AlertCircle,
    title: "Poor Visibility",
    description: "Managers lack real-time insight into maintenance status and asset conditions",
  },
  {
    icon: Workflow,
    title: "Fragmented Workflows",
    description: "Disconnected systems create communication gaps between teams",
  },
  {
    icon: Users,
    title: "Planning Inefficiencies",
    description: "Without proper scheduling, technicians face conflicting priorities",
  },
  {
    icon: Package,
    title: "Spare Parts Chaos",
    description: "Uncoordinated inventory leads to stockouts and emergency purchases",
  },
];

export function ChallengesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Common Challenges
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Machinery Maintenance Teams Face Daily Obstacles
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional maintenance management creates bottlenecks that reduce efficiency and increase costs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
                <challenge.icon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
              <p className="text-muted-foreground">{challenge.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              AI-CMS solves these challenges with a unified maintenance platform
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
