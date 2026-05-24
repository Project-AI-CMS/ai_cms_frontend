'use client';

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight, Mail, Phone } from "lucide-react";

export function FinalCTASection() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6">
                  Ready to Modernize Your Machinery Maintenance Operations?
                </h2>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Join industrial companies already streamlining their maintenance workflows with AI-CMS. 
                  Request a personalized demo and see how we can help your team work more efficiently.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 rounded-lg px-8 text-lg group"
                >
                  Request a Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 rounded-lg px-8 text-lg"
                >
                  Explore Platform
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 justify-center md:justify-end">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-100">Email us</p>
                    <p className="font-semibold">contact@ai-cms.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-100">Call us</p>
                    <p className="font-semibold">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-8">
            Trusted by manufacturing and industrial companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              "ISO 9001 Certified",
              "SOC 2 Compliant",
              "Enterprise Ready",
              "24/7 Support",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
