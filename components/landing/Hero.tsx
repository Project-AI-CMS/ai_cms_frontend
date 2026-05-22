'use client';

import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 -z-10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:bg-blue-800" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:bg-indigo-800" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:bg-purple-800" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900/40 dark:text-blue-300">
                  ✨ Enterprise Asset Management
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Optimize Your
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Asset Performance
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl">
                Intelligent maintenance management system for industrial assets. Predict failures, reduce downtime, and maximize equipment lifespan with AI-powered insights.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group hover:shadow-lg transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Trusted by leading enterprises:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {['Fortune 500 Companies', 'ISO Certified', '99.9% Uptime'].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700"
                    >
                      ✓ {item}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:block"
          >
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-1">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 space-y-6">
                  {/* Mock Dashboard */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="flex-1 h-3 bg-gray-200 rounded dark:bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/40 rounded-lg p-3 space-y-2">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          156
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Assets Online
                        </div>
                      </div>
                      <div className="h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/40 rounded-lg p-3 space-y-2">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          98%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Health Score
                        </div>
                      </div>
                    </div>
                    <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -top-4 -left-6 w-32 h-24 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, delay: 0.3, repeat: Infinity }}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Downtime ↓
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  -45%
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-6 w-32 h-24 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, delay: 0.6, repeat: Infinity }}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Savings
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  +$2.3M
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
