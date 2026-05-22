'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { CheckCircle2, Zap } from 'lucide-react';

const benefits = [
  {
    title: 'Reduce Unplanned Downtime',
    description:
      'Predict failures before they happen and schedule maintenance proactively to minimize disruptions.',
    metrics: ['45% reduction', 'in downtime', 'on average'],
  },
  {
    title: 'Extend Equipment Lifespan',
    description:
      'Optimize maintenance schedules based on actual condition, not just time intervals.',
    metrics: ['25-35% longer', 'equipment life', 'cycle'],
  },
  {
    title: 'Lower Maintenance Costs',
    description:
      'Eliminate unnecessary maintenance and focus resources on critical repairs.',
    metrics: ['$2.3M+', 'annual savings', 'per client'],
  },
  {
    title: 'Improve Safety & Compliance',
    description:
      'Comprehensive audit trails and automated compliance reporting for all regulatory requirements.',
    metrics: ['100%', 'compliance', 'tracking'],
  },
  {
    title: 'Boost Team Productivity',
    description:
      'Streamline workflows and reduce administrative burden so teams focus on critical tasks.',
    metrics: ['40% faster', 'maintenance', 'execution'],
  },
  {
    title: 'Data-Driven Decisions',
    description:
      'Advanced analytics provide actionable insights for strategic planning and optimization.',
    metrics: ['Real-time', 'dashboards', 'insights'],
  },
];

export function Benefits() {
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="benefits"
      className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:bg-indigo-800 dark:opacity-10" />
      </div>

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
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Transform Your Maintenance
            <span className="block text-blue-600 dark:text-blue-400">
              Operations & Bottom Line
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience measurable improvements in asset reliability, operational efficiency, and financial performance.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300">
                {/* Icon */}
                <div className="mb-6 inline-block">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg group-hover:shadow-md transition-all">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2">
                  {benefit.metrics.map((metric, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mt-20 bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Enterprise-Ready Platform
                </h3>
                <ul className="space-y-3">
                  {[
                    'Multi-site management & centralized control',
                    'Advanced user roles & permissions',
                    'API integrations with existing systems',
                    'Customizable workflows & reports',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Industry-Proven
                </h3>
                <ul className="space-y-3">
                  {[
                    'Trusted by Fortune 500 companies',
                    'ISO 27001 & SOC 2 compliant',
                    '99.9% uptime SLA guaranteed',
                    'Dedicated 24/7 support team',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
