'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'AssetFlow transformed our maintenance operations. We reduced unplanned downtime by 45% in the first 6 months.',
    author: 'Zhang Wei',
    role: 'Maintenance Director',
    company: 'TechPower Industries',
    rating: 5,
  },
  {
    quote:
      'The predictive analytics caught a critical bearing failure 3 months before it would have failed. Saved us $500K+.',
    author: 'Li Ming',
    role: 'Operations Manager',
    company: 'Industrial Energy Corp',
    rating: 5,
  },
  {
    quote:
      'Implementation was smooth, support team was excellent. ROI positive within the first quarter. Highly recommended.',
    author: 'Chen Jian',
    role: 'Engineering Lead',
    company: 'Global Manufacturing Ltd',
    rating: 5,
  },
  {
    quote:
      'The mobile app lets our technicians update maintenance work in real-time. Eliminates paperwork completely.',
    author: 'Zhou Yu',
    role: 'Safety Officer',
    company: 'Energy Systems Inc',
    rating: 5,
  },
];

const companies = [
  { name: 'Fortune 500 Co', logo: '🏢' },
  { name: 'Tech Industries', logo: '⚙️' },
  { name: 'Global Energy', logo: '⚡' },
  { name: 'Manufacturing Ltd', logo: '🏭' },
];

export function Testimonials() {
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
    <section className="py-20 md:py-32 bg-white dark:bg-slate-900 relative">
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
              Trusted By Industry Leaders
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Success Stories from
            <span className="block text-blue-600 dark:text-blue-400">
              Enterprise Clients
            </span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full p-8 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 flex-grow leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Companies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: '-100px' }}
          className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/40 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-slate-700"
        >
          <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-8">
            Trusted by thousands of teams worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-4 rounded-lg bg-white dark:bg-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{company.logo}</div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {company.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: '🔒', label: 'ISO 27001 Certified' },
            { icon: '✅', label: 'SOC 2 Compliant' },
            { icon: '🕐', label: '99.9% Uptime' },
            { icon: '👥', label: '24/7 Support' },
          ].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-4"
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {badge.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
