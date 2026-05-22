'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CTAProps {
  onGetStarted: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
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

  const benefits = [
    'Free trial for 14 days - no credit card required',
    'Personalized onboarding with our success team',
    'Access to all premium features during trial',
    'Live demos and technical support included',
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 -left-96 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:bg-blue-800 dark:opacity-10" />
        <div className="absolute bottom-1/3 -right-96 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:bg-indigo-800 dark:opacity-10" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center"
        >
          {/* Heading */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900/40 dark:text-blue-300">
                Ready to Transform?
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Start Optimizing Your
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Asset Performance Today
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join hundreds of enterprises already using AssetFlow to reduce downtime, cut costs, and extend equipment lifespan.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group hover:shadow-lg transition-all text-base"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group hover:bg-gray-100 dark:hover:bg-slate-800 text-base"
            >
              Schedule Demo
            </Button>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-slate-700 mb-8"
          >
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6">
              What's included in your free trial:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Questions? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                📧 Contact Sales
              </Button>
              <span className="hidden sm:inline text-gray-400 dark:text-gray-600">•</span>
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700">
                📞 Call: 1-800-ASSET-01
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
