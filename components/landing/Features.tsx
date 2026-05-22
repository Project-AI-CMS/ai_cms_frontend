'use client';

import React from 'react';
import {
  Zap,
  BarChart3,
  AlertCircle,
  Package,
  Users,
  Shield,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

const features = [
  {
    icon: Zap,
    title: 'Real-time Monitoring',
    description: 'Monitor equipment status and performance metrics in real-time with instant alerts and notifications.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Data-driven insights with predictive maintenance analytics to prevent failures before they occur.',
  },
  {
    icon: AlertCircle,
    title: 'Predictive Maintenance',
    description: 'AI-powered defect prediction reduces unplanned downtime and extends equipment lifespan.',
  },
  {
    icon: Package,
    title: 'Spare Parts Management',
    description: 'Intelligent inventory tracking and automated reordering for critical spare parts.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamless coordination between technicians, managers, and safety teams with role-based access.',
  },
  {
    icon: Shield,
    title: 'Safety & Compliance',
    description: 'Comprehensive safety tracking, audit trails, and compliance reporting for regulatory requirements.',
  },
  {
    icon: TrendingUp,
    title: 'Cost Optimization',
    description: 'Detailed cost analysis and ROI tracking for maintenance budgets and asset investments.',
  },
  {
    icon: Clock,
    title: 'Workflow Automation',
    description: 'Streamline maintenance workflows with automated task assignments and status tracking.',
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-white dark:bg-slate-900 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900/40 dark:text-blue-300">
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Everything you need to manage
            <span className="block text-blue-600 dark:text-blue-400">
              industrial assets efficiently
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive tools designed for modern maintenance teams to optimize operations and reduce costs.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group h-full p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                  <div className="mb-4 inline-block p-3 bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60 rounded-lg transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
