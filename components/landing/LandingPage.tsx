'use client';

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { Features } from './Features';
import { Statistics } from './Statistics';
import { Workflow } from './Workflow';
import { Benefits } from './Benefits';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { Footer } from './Footer';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const handleGetStarted = () => {
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <Navigation onLoginClick={onLogin} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero onGetStarted={handleGetStarted} />

        {/* Features Section */}
        <Features />

        {/* Statistics Section */}
        <Statistics />

        {/* Workflow Section */}
        <Workflow />

        {/* Benefits Section */}
        <Benefits />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <CTA onGetStarted={handleGetStarted} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
