'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: '𝕏', href: '#', label: 'Twitter' },
  { icon: 'in', href: '#', label: 'LinkedIn' },
  { icon: 'f', href: '#', label: 'Facebook' },
  { icon: '◯', href: '#', label: 'Instagram' },
];

export function Footer() {
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
    <footer className="bg-gray-900 dark:bg-slate-950 text-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12"
        >
          {/* Logo & About */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">AssetFlow</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Enterprise asset management powered by AI for industrial excellence.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@assetflow.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                hello@assetflow.com
              </a>
              <a
                href="tel:+18008327380"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                1-800-ASSET-01
              </a>
              <div className="flex items-start gap-2 text-gray-400 text-sm pt-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>123 Tech Boulevard</p>
                  <p>San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div key={index} variants={itemVariants}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-12" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            © 2024 AssetFlow. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-6 mt-6 md:mt-0">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-gray-400 hover:text-white transition-colors text-lg"
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Legal Notice Bar */}
      <div className="border-t border-gray-800 bg-gray-950 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-gray-500 text-xs text-center">
            AssetFlow is a trusted platform by leading enterprises. SOC 2 Type II Certified | ISO 27001 Certified | GDPR Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
