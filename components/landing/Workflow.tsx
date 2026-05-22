'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import {
  Smartphone,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const workflowSteps = [
  {
    icon: Smartphone,
    title: 'Monitor Assets',
    description:
      'Real-time monitoring of equipment conditions, status, and performance metrics across your facility.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Detect Issues',
    description:
      'AI-powered system instantly detects anomalies and potential failures before they impact operations.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Optimize Maintenance',
    description:
      'Intelligent recommendations for optimal maintenance scheduling based on equipment condition and usage.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: CheckCircle2,
    title: 'Execute & Track',
    description:
      'Streamlined maintenance execution with real-time tracking, team coordination, and quality assurance.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export function Workflow() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
      id="workflow"
      className="py-20 md:py-32 bg-white dark:bg-slate-900 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900/40 dark:text-blue-300">
              How It Works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Simple Yet Powerful
            <span className="block text-blue-600 dark:text-blue-400">
              Maintenance Workflow
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From monitoring to execution, our intelligent system streamlines every step of your maintenance process.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4"
        >
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={index} variants={itemVariants} className="relative">
                <Card className="group h-full p-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 inline-block p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 group-hover:shadow-md transition-all">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Card>

                {/* Arrow Connector */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 -translate-x-6">
                    <ArrowRight className="w-5 h-5 text-blue-300 dark:text-blue-800" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Process Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mt-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    📊
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Real-time Visibility
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Dashboard shows all assets, their status, health scores, and maintenance schedules in one place.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    🤖
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  AI Intelligence
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Machine learning algorithms analyze patterns to predict failures and recommend optimal actions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ✅
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Smart Execution
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Teams execute maintenance with guided workflows, real-time collaboration, and quality checks.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
