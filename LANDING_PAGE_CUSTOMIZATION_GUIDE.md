# Landing Page Customization Guide

## Overview
This guide helps you customize the landing page to match your brand identity and preferences.

---

## 🎨 Color Customization

### Update Theme Colors

#### In `styles/globals.css`

The landing page uses CSS variables that cascade through the application:

```css
:root {
  --primary: #030213;           /* Main brand color */
  --primary-foreground: oklch(1 0 0);  /* Text on primary */
  --secondary: oklch(0.95 0.0058 264.53);
  --accent: #e9ebef;            /* Accent highlights */
  --background: #ffffff;         /* Page background */
  --card: #ffffff;              /* Card backgrounds */
  --border: rgba(0, 0, 0, 0.1); /* Border color */
}

.dark {
  --primary: oklch(0.985 0 0);
  --background: oklch(0.145 0 0);
  --card: oklch(0.145 0 0);
  /* ... other dark mode colors */
}
```

#### Quick Color Changes

1. **Hero Section Background**
   - File: `components/landing/Hero.tsx` Line 43
   - Change: `from-slate-50 via-blue-50 to-white`
   - Options: Use any Tailwind colors

2. **Feature Cards**
   - File: `components/landing/Features.tsx` Line 95
   - Change: `bg-blue-100` → any Tailwind color
   - Icon color: `text-blue-600` → matching color

3. **Button Colors**
   - File: `components/ui/button.tsx`
   - Modify button variants for different styles

### Brand Color Examples

#### Tech Blue (Current)
```css
--primary: #030213;        /* Dark Blue */
--accent: #2563EB;         /* Bright Blue */
--secondary: #3B82F6;      /* Medium Blue */
```

#### Professional Green
```css
--primary: #064E3B;        /* Dark Green */
--accent: #10B981;         /* Emerald */
--secondary: #34D399;      /* Light Green */
```

#### Corporate Orange
```css
--primary: #7C2D12;        /* Dark Orange */
--accent: #EA580C;         /* Orange */
--secondary: #FB923C;      /* Light Orange */
```

#### Modern Purple
```css
--primary: #3F0F5C;        /* Dark Purple */
--accent: #8B5CF6;         /* Purple */
--secondary: #A78BFA;      /* Light Purple */
```

---

## 🎬 Animation Customization

### Adjust Animation Speed

#### In Component Files

**Hero Section** - `components/landing/Hero.tsx`
```typescript
// Line 52 - Increase or decrease duration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,  // ← Change for faster/slower stagger
      delayChildren: 0.3,    // ← Change initial delay
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },  // ← Change duration
  },
};
```

#### Disable Animations

Replace `motion.div` with regular `div`:
```typescript
// Before
<motion.div variants={itemVariants}>

// After (no animation)
<div>
```

### Blob Animation Speed

In `styles/globals.css`:
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;  /* ← Change 7s for speed */
}
```

---

## 📝 Content Customization

### Update Company Information

#### Navigation & Branding
File: `components/landing/Navigation.tsx`

```typescript
// Line 28
<span className="hidden sm:inline">AssetFlow</span>  // ← Change company name
```

#### Hero Section
File: `components/landing/Hero.tsx`

```typescript
// Lines 53-55 - Update headline
<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold...">
  Optimize Your
  <span className="block...">Asset Performance</span>  // ← Change headline
</h1>

// Line 56-58 - Update subheadline
<p className="text-xl...">
  Intelligent maintenance management system...  // ← Change description
</p>
```

#### Features
File: `components/landing/Features.tsx`

```typescript
// Update the features array (line 13-42)
const features = [
  {
    icon: Zap,
    title: 'Real-time Monitoring',  // ← Change title
    description: 'Monitor equipment...',  // ← Change description
  },
  // ... add/remove features
];
```

#### Benefits
File: `components/landing/Benefits.tsx`

```typescript
// Update benefits array (line 14-53)
const benefits = [
  {
    title: 'Reduce Unplanned Downtime',  // ← Change title
    description: 'Predict failures...',   // ← Change description
    metrics: ['45% reduction', 'in downtime', 'on average'],  // ← Change metrics
  },
  // ... modify all benefits
];
```

#### Testimonials
File: `components/landing/Testimonials.tsx`

```typescript
// Update testimonials array (line 14-31)
const testimonials = [
  {
    quote: 'AssetFlow transformed...',  // ← Change quote
    author: 'Zhang Wei',                 // ← Change author name
    role: 'Maintenance Director',        // ← Change role
    company: 'TechPower Industries',     // ← Change company
    rating: 5,
  },
  // ... add/replace with real testimonials
];
```

#### Contact Information
File: `components/landing/Footer.tsx`

```typescript
// Line 90-104 - Update contact info
<a href="mailto:hello@assetflow.com">  // ← Change email
  hello@assetflow.com
</a>

<a href="tel:+18008327380">  // ← Change phone
  1-800-ASSET-01
</a>

<div>
  <p>123 Tech Boulevard</p>            // ← Change address
  <p>San Francisco, CA 94105</p>
</div>
```

---

## 🎯 Section-Specific Customization

### Hero Section

**Change Hero Background**
File: `components/landing/Hero.tsx` Line 43
```typescript
<div className="absolute inset-0 bg-gradient-to-br 
  from-slate-50 via-blue-50 to-white
  dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 -z-10" />
```

**Change Blob Animation Colors**
File: `components/landing/Hero.tsx` Lines 48-50
```typescript
<div className="absolute top-20 left-10 w-72 h-72 
  bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl 
  opacity-20 animate-blob dark:bg-blue-800" />
  // ↑ Change colors here
```

**Change Dashboard Mock Size**
File: `components/landing/Hero.tsx` Line 115
```typescript
<div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-1">
  // ↑ Change gradient colors
```

### Features Grid

**Change Grid Columns**
File: `components/landing/Features.tsx` Line 94
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
// Change to: lg:grid-cols-3 for 3 columns on desktop
```

**Change Icon Background**
File: `components/landing/Features.tsx` Line 115
```typescript
<div className="mb-4 inline-block p-3 
  bg-blue-100 group-hover:bg-blue-200 
  dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60 rounded-lg">
  // ↑ Change background colors
```

### Workflow Section

**Change Step Counter Colors**
File: `components/landing/Workflow.tsx` Line 107
```typescript
<div className="absolute -top-4 -left-4 w-10 h-10 rounded-full 
  bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
  // ↑ Change gradient
</div>
```

### Statistics Section

**Change Counter Animation Speed**
File: `components/landing/Statistics.tsx` Lines 25-38
```typescript
const increment = numValue / steps;
const timer = setInterval(() => {
  // Adjust the 30 (milliseconds) for slower/faster counting
  // 30 = fast, 50 = slower, 100 = very slow
}, 30);
```

---

## 🖼️ Replace Mock Content

### Dashboard Visual

**Change Mock Dashboard Colors**
File: `components/landing/Hero.tsx` Lines 122-135
```typescript
<div className="grid grid-cols-2 gap-4">
  <div className="h-24 bg-gradient-to-br 
    from-blue-100 to-blue-50 
    dark:from-blue-900/40 dark:to-blue-950/40 rounded-lg p-3">
    // ↑ Change gradients for each card
  </div>
  // ...
</div>
```

### Company Logos

**Replace Placeholder Logos**
File: `components/landing/Testimonials.tsx` Lines 72-80
```typescript
const companies = [
  { name: 'Fortune 500 Co', logo: '🏢' },      // ← Replace emoji with brand
  { name: 'Tech Industries', logo: '⚙️' },
  { name: 'Global Energy', logo: '⚡' },
  { name: 'Manufacturing Ltd', logo: '🏭' },
];

// Better approach - use actual logos:
import Logo1 from '@/public/logo1.png';
<Image src={Logo1} alt="Company" width={100} height={50} />
```

---

## 📐 Layout Adjustments

### Change Section Padding

Global section padding is applied in each component. Example:
```typescript
<section className="py-20 md:py-32">  // ← Change padding
  {/* content */}
</section>
```

**Padding Sizes:**
- `py-8` - Small (32px)
- `py-12` - Medium (48px)
- `py-20` - Large (80px)
- `py-32` - Extra Large (128px)

### Adjust Container Max-Width

File: Multiple components, search for:
```typescript
<div className="max-w-7xl mx-auto">  // ← Change max-w
  {/* content */}
</div>
```

**Width Options:**
- `max-w-4xl` - Narrow (896px)
- `max-w-5xl` - Standard (1024px)
- `max-w-6xl` - Wide (1152px)
- `max-w-7xl` - Extra Wide (1280px)

### Adjust Gap Between Elements

```typescript
className="grid gap-6"  // ← Change gap-6
```

**Gap Options:**
- `gap-3` - Tight (12px)
- `gap-4` - Normal (16px)
- `gap-6` - Comfortable (24px)
- `gap-8` - Spacious (32px)
- `gap-12` - Very Spacious (48px)

---

## 🔧 Advanced Customization

### Add New Section

1. Create new file in `components/landing/`:
```typescript
// NewSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function NewSection() {
  return (
    <section className="py-20 md:py-32">
      {/* Your content */}
    </section>
  );
}
```

2. Import in `LandingPage.tsx`:
```typescript
import { NewSection } from './NewSection';
```

3. Add to component:
```typescript
<NewSection />
```

### Change Component Order

File: `components/landing/LandingPage.tsx`

```typescript
<main>
  <Hero onGetStarted={handleGetStarted} />
  <Features />
  {/* Reorder sections here */}
  <Statistics />
  <Workflow />
  <Benefits />
  <Testimonials />
  <CTA onGetStarted={handleGetStarted} />
</main>
```

### Hide Specific Sections

Wrap section in conditional rendering:
```typescript
{showFeatures && <Features />}
```

Or use CSS:
```typescript
<Features className="hidden" />
```

---

## 🎯 Common Customization Tasks

### 1. Change Hero Headline
- File: `components/landing/Hero.tsx` Line 55

### 2. Change Button Text
- File: `components/landing/Hero.tsx` Line 71
- File: `components/landing/CTA.tsx` Line 81

### 3. Change Feature Icons
- File: `components/landing/Features.tsx` Line 2-10
- Replace icon import and use in features array

### 4. Update Statistics Numbers
- File: `components/landing/Statistics.tsx` Line 117-120

### 5. Change Testimonial Quotes
- File: `components/landing/Testimonials.tsx` Line 14-31

### 6. Update Footer Links
- File: `components/landing/Footer.tsx` Line 20-46

### 7. Change Primary Color Throughout
- File: `styles/globals.css` - Update CSS variables
- Or search/replace `blue-600` → `your-color-600`

---

## 🎨 CSS Customization Tips

### Hover Effects
Every component uses hover states. Customize by changing:
```typescript
className="hover:bg-blue-100"  // ← Change color
className="hover:shadow-lg"    // ← Change shadow
className="hover:scale-105"    // ← Change scale
```

### Gradients
Used for visual impact. Change by modifying:
```typescript
className="bg-gradient-to-r from-blue-600 to-indigo-600"
// Change to: from-purple-600 to-pink-600
```

### Responsive Classes
Adjust breakpoints:
```typescript
className="text-2xl md:text-3xl lg:text-4xl"
// md: tablet (768px), lg: desktop (1024px)
```

---

## ✅ Testing Customizations

After making changes:

1. **Check Mobile View**
   - Open browser DevTools
   - Toggle device toolbar
   - Test on 375px width

2. **Check Dark Mode**
   - Toggle dark class on html element
   - Verify colors still readable

3. **Check Animations**
   - Scroll to trigger animations
   - Verify smooth performance
   - Check on slower devices if possible

4. **Check Links**
   - Click all navigation links
   - Verify scroll behavior
   - Check button CTAs

---

## 📋 Customization Checklist

- [ ] Update company name
- [ ] Change hero headline
- [ ] Update feature list
- [ ] Modify statistics/metrics
- [ ] Replace testimonials
- [ ] Update footer contact info
- [ ] Change primary color scheme
- [ ] Adjust animations speed
- [ ] Update company logo
- [ ] Test on all breakpoints
- [ ] Test dark mode
- [ ] Verify all links work

---

## 🆘 Troubleshooting

### Colors Not Changing
- Clear .next cache: `rm -rf .next`
- Restart dev server
- Check CSS variable names

### Animations Not Smooth
- Check browser performance
- Reduce animation complexity
- Increase duration values

### Layout Broken on Mobile
- Check responsive classes (md:, lg:)
- Verify grid columns
- Test actual mobile device

### Dark Mode Issues
- Check dark class in parent element
- Verify dark: prefixed classes
- Update CSS variables for dark mode

---

## 📚 Resources

- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- Lucide Icons: https://lucide.dev/
- Next.js: https://nextjs.org/docs

---

**Version:** 1.0  
**Last Updated:** May 22, 2026
