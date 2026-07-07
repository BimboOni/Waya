'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IconFlame, IconMenu2, IconX } from '@tabler/icons-react';

const slideUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

const slideUpChildren = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

const subjects = [
  {
    subject: 'Mathematics',
    description: 'Algebra, geometry, and calculus explained through game mechanics, sports stats, and rhythm.',
    icon: '📐',
    iconBg: 'bg-violet-50',
    chips: ['Game mechanics', 'Sports stats', 'Music rhythm'],
    chipClass: 'bg-violet-100 text-violet-700',
  },
  {
    subject: 'Science & Tech',
    description: 'Physics, chemistry, and coding decoded using sneaker design, sports car engineering, and gaming tech.',
    icon: '🔬',
    iconBg: 'bg-cyan-50',
    chips: ['Sneaker design', 'Car engineering', 'Gaming tech'],
    chipClass: 'bg-cyan-100 text-cyan-700',
  },
  {
    subject: 'History & Culture',
    description: 'The stories, empires, and movements that shaped our world, told like an engaging podcast.',
    icon: '🗺️',
    iconBg: 'bg-orange-50',
    chips: ['Ancient empires', 'Movement stories', 'Global events'],
    chipClass: 'bg-orange-100 text-orange-700',
  },
  {
    subject: 'Creative Arts',
    description: 'Music theory, literature, and visual design broken down through your favorite tracks and creators.',
    icon: '🎨',
    iconBg: 'bg-pink-50',
    chips: ['Music theory', 'Visual design', 'Top tracks'],
    chipClass: 'bg-pink-100 text-pink-700',
  },
];

const steps = [
  {
    number: '1',
    label: 'STEP 1',
    title: 'Tell us what you love.',
    description:
      'Gaming, music, fashion, or sports. Select your favorite hobbies and we\'ll use them as the lens for every lesson.',
    image: '/images/step-1-image.webp',
    alt: 'Tell us what you love',
    imageFirst: true,
  },
  {
    number: '2',
    label: 'STEP 2',
    title: 'Pick what you want to master.',
    description:
      'Mathematics, Science, History, or Arts. Tell Waya exactly what you need to understand, and watch the magic happen.',
    image: '/images/step-2-image.webp',
    alt: 'Pick what you want to master',
    imageFirst: false,
  },
  {
    number: '3',
    label: 'STEP 3',
    title: 'Learn and level up.',
    description:
      'Read bite-sized explanations tailored to your world, answer guiding Socratic questions, and watch your Knowledge Map grow.',
    image: '/images/step-3-image.webp',
    alt: 'Learn and level up',
    imageFirst: true,
  },
];

const metrics = [
  {
    title: 'XP & Levels',
    label: 'EARN XP',
    bullets: [
      'Earn XP per synthesis',
      '5 ranks: Curious → Sage',
      'Track your progress',
    ],
    containerClass: 'bg-lime-50',
    labelColor: 'text-lime-500',
    bulletColor: 'bg-lime-500',
    iconBg: 'bg-white',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Streaks',
    label: 'DAILY STREAKS',
    bullets: [
      'Build daily habits',
      'Unlock exclusive badges',
      'Stay motivated',
    ],
    containerClass: 'bg-rose-50',
    labelColor: 'text-rose-500',
    bulletColor: 'bg-rose-500',
    iconBg: 'bg-white',
    icon: <IconFlame size={20} />,
  },
  {
    title: 'Badges',
    label: 'MILESTONES',
    bullets: [
      'AI-generated artwork',
      'Celebrate achievements',
      'Show them off',
    ],
    containerClass: 'bg-purple-50',
    labelColor: 'text-purple-500',
    bulletColor: 'bg-purple-500',
    iconBg: 'bg-white',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

export default function MarketingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Sticky Navigation */}
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 w-full max-w-[1280px] mx-auto px-4 sm:px-8 animate-fade-in-up">
        <nav className="w-full bg-white rounded-full border-[3px] border-border-default py-3 sm:py-4 px-5 sm:px-8 flex flex-row justify-between items-center">
          <Link href="/" className="font-logo font-black text-[28px] leading-none text-brand-primary">waya</Link>
          <button
            className="sm:hidden p-1 text-text-secondary hover:text-text-primary transition-colors relative w-7 h-7"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <IconX size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <IconMenu2 size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <div className="hidden sm:flex flex-row items-center gap-4">
            <Link href="/auth?view=login" className="font-inter font-semibold text-[15px] text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
            <Link
              href="/auth?view=get-started"
              className="bg-brand-primary text-brand-on-primary border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:translate-y-1 active:scale-[0.98] inline-flex items-center justify-center font-inter font-bold rounded-full py-3 px-7 text-[15px]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 sm:hidden"
        >
            <div className="absolute inset-0 bg-white/70 backdrop-blur" onClick={() => setMenuOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-40 flex items-center justify-center h-full px-8"
          >
            <div className="w-full max-w-sm bg-white rounded-3xl border border-border-default shadow-2xl py-10 px-8 flex flex-col gap-5 items-center">
              <Link
                href="/auth?view=login"
                className="w-full text-center font-inter font-semibold text-[16px] text-brand-primary border-2 border-brand-primary rounded-full py-3.5 px-7 hover:bg-brand-primary/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth?view=get-started"
                className="w-full text-center bg-brand-primary text-brand-on-primary border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:translate-y-1 active:scale-[0.98] font-inter font-bold rounded-full py-3.5 px-7 text-[16px]"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 pt-40 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 sm:gap-16 items-center">
        <div className="flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h1 className="font-poppins font-black tracking-tighter text-[clamp(2.5rem,1.5rem+4vw,4.5rem)] leading-[1.1] text-text-primary">
            Learn any subject<br />
            through <span className="text-streak">what you<br />love.</span>
          </h1>
          <p className="mt-4 sm:mt-6 font-inter text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] leading-[1.6] sm:leading-[28px] text-text-secondary max-w-[480px]">
            Waya is your AI study partner. We break down complex school topics using
            the things you actually care about, like gaming, music, and sports.
          </p>
          <Link
            href="/auth?view=get-started"
            className="bg-brand-primary text-brand-on-primary border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:translate-y-1 active:scale-[0.98] inline-flex items-center justify-center font-inter font-bold rounded-full py-4 px-10 text-[clamp(0.875rem,0.8rem+0.3vw,1rem)] w-full sm:w-fit mt-8 sm:mt-10"
          >
            Start Learning for Free
          </Link>
        </div>
        <div className="w-full flex justify-center lg:justify-end animate-fade-in-up group" style={{ animationDelay: '300ms' }}>
          <div className="relative w-full max-w-[400px] sm:max-w-[540px] aspect-[5/6] overflow-hidden rounded-[24px] animate-float-slow transition-transform duration-500 group-hover:scale-[1.04] group-hover:[animation-play-state:paused]">
            <Image
              src="/images/hero-section-image.webp"
              alt="Student learning with Waya"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
            />
          </div>
        </div>
      </section>

      {/* 3-Step Flow Section */}
      <motion.section {...slideUp} className="py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <motion.div {...slideUpChildren} className="text-center mb-16 sm:mb-20">
            <h2 className="text-[clamp(1.75rem,1rem+3vw,3rem)] font-poppins font-bold text-text-primary tracking-tight">
              Your world. Your <span className="text-streak">lessons.</span>
            </h2>
            <p className="mt-3 font-inter text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] text-text-secondary">
              Pick what you love, tell us what you need to study, and we&apos;ll connect the dots.
            </p>
          </motion.div>

          <div className="flex flex-col gap-20 sm:gap-28">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center max-w-[1000px] mx-auto w-full`}
              >
                {step.imageFirst ? (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden rounded-[28px]">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        width={480}
                        height={480}
                        className="w-full object-cover"
                      />
                    </motion.div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[13px] font-bold tracking-widest text-brand-primary uppercase mb-3">{step.label}</span>
                      <h3 className="font-poppins font-bold text-[clamp(1.375rem,0.75rem+2.5vw,2.25rem)] leading-tight tracking-tight text-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-4 font-inter text-[clamp(0.95rem,0.85rem+0.5vw,1.0625rem)] leading-relaxed text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center order-2 md:order-1">
                      <span className="text-[13px] font-bold tracking-widest text-brand-primary uppercase mb-3">{step.label}</span>
                      <h3 className="font-poppins font-bold text-[clamp(1.375rem,0.75rem+2.5vw,2.25rem)] leading-tight tracking-tight text-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-4 font-inter text-[clamp(0.95rem,0.85rem+0.5vw,1.0625rem)] leading-relaxed text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden rounded-[28px] order-1 md:order-2">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        width={480}
                        height={480}
                        className="w-full object-cover"
                      />
                    </motion.div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Subject Grid — Deep Teal Background */}
      <motion.section {...slideUp} className="bg-[#2D7D78] py-16 sm:py-24 text-white">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
          <motion.div {...slideUpChildren} className="mb-10 sm:mb-14">
            <h2 className="text-[clamp(1.75rem,1rem+3vw,3rem)] font-poppins font-bold tracking-tight text-center text-white">
              Any subject, explained your way.
            </h2>
            <p className="text-center mt-4 text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] text-white/80 font-inter max-w-2xl mx-auto">
              We take the standard school curriculum and break it down using the
              hobbies, music, and sports you love.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {subjects.map(({ subject, description, icon, iconBg, chips, chipClass }, i) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1], hover: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
                className="bg-white rounded-[28px] p-6 sm:p-8 text-text-primary flex flex-col cursor-default"
              >
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl ${iconBg} mb-4 sm:mb-5`}>
                  {icon}
                </div>
                <h3 className="text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] font-poppins font-bold text-text-primary mb-2 sm:mb-3">{subject}</h3>
                <p className="font-inter text-[clamp(0.875rem,0.8rem+0.3vw,0.9375rem)] leading-relaxed text-text-secondary mb-5 sm:mb-6">{description}</p>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 mt-auto">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className={`${chipClass} text-[11px] sm:text-[13px] font-medium px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Progress Metrics — Gamification Cards */}
      <motion.section {...slideUp} className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
          <motion.div {...slideUpChildren} className="mb-10 sm:mb-14">
            <h2 className="text-[clamp(1.75rem,1rem+3vw,3rem)] font-poppins font-bold tracking-tight text-center text-text-primary">
              Progress you can see.
            </h2>
            <p className="text-text-secondary font-inter text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] text-center mt-4">
              Every synthesis moves you forward. Streaks, levels, badges, and more.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1], hover: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
                className={`${metric.containerClass} rounded-[28px] p-6 sm:p-8 flex flex-col cursor-default`}
              >
                <div className={`w-10 sm:w-12 h-10 sm:h-12 ${metric.iconBg} rounded-full flex items-center justify-center mb-4 sm:mb-6 text-${metric.labelColor.replace('text-', '')}`}>
                  {metric.icon}
                </div>
                <div className={`text-[11px] font-bold tracking-widest uppercase mb-2 ${metric.labelColor}`}>
                  {metric.label}
                </div>
                <h3 className="text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-poppins font-bold text-text-primary leading-tight mb-4 sm:mb-5">
                  {metric.title}
                </h3>
                <ul className="space-y-3 mt-auto">
                  {metric.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${metric.bulletColor}`} />
                      <span className="text-text-secondary font-inter text-[clamp(0.875rem,0.8rem+0.3vw,0.9375rem)]">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...slideUp} className="bg-bg-primary py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center order-1 md:order-2"
          >
            <h2 className="text-[clamp(2rem,1.25rem+3.5vw,3.5rem)] font-poppins font-bold tracking-tight text-text-primary leading-[1.1]">
              Ready to <span className="text-streak">learn?</span>
            </h2>
            <p className="text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] text-text-secondary mt-5 font-inter max-w-md leading-relaxed">
              Pick any subject you need to study. Waya handles the rest using the hobbies and interests you already have.
            </p>
            <Link
              href="/auth?view=get-started"
              className="bg-brand-primary text-brand-on-primary border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:translate-y-1 active:scale-[0.98] inline-flex items-center justify-center font-inter font-bold rounded-full py-4 px-10 text-[clamp(0.875rem,0.8rem+0.3vw,1rem)] w-full sm:w-fit mt-8"
            >
              Start Learning for Free
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1], hover: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }}
            className="rounded-[24px] overflow-hidden max-w-[520px] mx-auto md:mx-0 order-2 md:order-1"
          >
            <Image
              src="/images/ready-to-learn-image.webp"
              alt="Ready to learn"
              width={520}
              height={600}
              className="w-full h-auto object-cover -scale-x-100"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Footer with auth page bridge */}
      <footer className="bg-brand-dark">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="font-logo font-black text-white text-[24px] leading-none tracking-tighter">waya</Link>
            <span className="text-white/60 font-inter text-[13px]">Relational AI Study Partner</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 text-[14px] font-inter text-white/60">
            <Link href="/auth?view=login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth?view=get-started" className="hover:text-white transition-colors">Get Started</Link>
            <span className="text-white/40 hidden sm:inline">·</span>
            <span className="text-white/40">© 2026 Waya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
