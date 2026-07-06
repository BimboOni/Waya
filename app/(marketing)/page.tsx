import Image from 'next/image';
import Link from 'next/link';

const subjects = [
  {
    subject: 'Mathematics',
    topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    icon: '📐',
    chip: 'bg-subject-math-container text-subject-math-text',
  },
  {
    subject: 'Science & Tech',
    topics: ['Physics', 'Chemistry', 'Biology', 'Computer Science'],
    icon: '🔬',
    chip: 'bg-subject-science-container text-subject-science-text',
  },
  {
    subject: 'History & Culture',
    topics: ['World History', 'African Heritage', 'Government', 'Philosophy'],
    icon: '📜',
    chip: 'bg-subject-history-container text-subject-history-text',
  },
  {
    subject: 'Creative Arts',
    topics: ['Music', 'Art & Design', 'Literature', 'Fashion'],
    icon: '🎨',
    chip: 'bg-subject-arts-container text-subject-arts-text',
  },
];

const steps = [
  {
    number: 'Step 1',
    title: 'Tell us what you love.',
    description:
      'Gaming, music, fashion, or sports — whatever excites you, Waya uses it as a lens for every lesson.',
    image: '/images/step-1-image.webp',
    alt: 'Tell us what you love',
    color: 'text-pink-500',
    imageFirst: true,
  },
  {
    number: 'Step 2',
    title: 'Pick what you want to master.',
    description:
      'Choose any school subject or topic you are studying. Waya breaks it down using your interests, making even the hardest concepts feel familiar and fun.',
    image: '/images/step-2-image.webp',
    alt: 'Pick what you want to master',
    color: 'text-emerald-500',
    imageFirst: false,
  },
  {
    number: 'Step 3',
    title: 'Learn and level up.',
    description:
      'Complete synthesis challenges, earn XP, build streaks, and watch your knowledge map grow. Every session moves you forward.',
    image: '/images/step-3-image.webp',
    alt: 'Learn and level up',
    color: 'text-purple-500',
    imageFirst: true,
  },
];

const metrics = [
  {
    title: 'XP & Levels',
    description:
      'Earn XP for every session and synthesis. Level up from Curious to Polymath as you grow.',
    containerClass: 'bg-[#effaf3]',
    iconBg: 'bg-emerald-100',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#10b981" />
      </svg>
    ),
  },
  {
    title: 'Streaks',
    description:
      'Stay consistent. Complete sessions daily to build your streak and unlock exclusive bonuses.',
    containerClass: 'bg-[#fff0f3]',
    iconBg: 'bg-rose-100',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"
          fill="#f97316"
        />
      </svg>
    ),
  },
  {
    title: 'Badges',
    description:
      'Unlock achievements for milestones — first session, subject mastery, streak records, and more.',
    containerClass: 'bg-[#f5f3ff]',
    iconBg: 'bg-purple-100',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="#8b5cf6"
        />
      </svg>
    ),
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Floating Capsule Navigation */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6">
        <nav className="w-full bg-white rounded-[32px] shadow-sm border border-slate-100 px-8 py-4 flex flex-row justify-between items-center">
          <Link href="/" className="font-nunito font-bold tracking-tighter text-3xl text-[#03a696]">waya</Link>
          <div className="flex flex-row items-center gap-4">
            <Link href="/auth?view=login" className="bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-700 font-bold rounded-xl h-12 px-6 flex items-center active:translate-y-[2px] active:border-b-2 transition-all">Sign In</Link>
            <Link href="/auth?view=get-started" className="bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl h-12 px-6 border-b-4 border-[#016f64] flex items-center active:translate-y-[2px] active:border-b-2 transition-all">Get Started</Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05]">
            Learn any subject through{' '}
            <span className="text-[#f25c74]">what you love.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 font-medium max-w-xl leading-relaxed tracking-tight">
            Waya is your AI study partner. We break down complex school topics using
            the things you actually care about, like gaming, music, and sports.
          </p>
          <Link
            href="/auth?view=get-started"
            className="bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl h-12 px-8 border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all w-fit mt-8 flex items-center justify-center"
          >
            Start Learning for Free
          </Link>
        </div>
        <div className="w-full flex justify-end">
          <Image
            src="/images/hero-section-image.webp"
            alt="Student learning with Waya"
            width={800}
            height={600}
            className="rounded-[32px] w-full max-w-xl object-cover"
            priority
          />
        </div>
      </section>

      {/* 3-Step Flow Section */}
      <section className="py-16 bg-white border-t border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center mb-12 px-6">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Your world. <span className="text-[#03a696]">Your lessons.</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Pick what you love, tell us what you need to study, and we&apos;ll connect
            the dots.
          </p>
        </div>

        {steps.map((step) => (
          <div
            key={step.number}
            className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center my-16"
          >
            {step.imageFirst ? (
              <>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  className="rounded-[32px] max-w-md w-full mx-auto object-cover"
                />
                <div className="max-w-md">
                  <span
                    className={`text-xs font-bold ${step.color} uppercase tracking-wider`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mt-2 font-medium">
                    {step.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="max-w-md mx-auto md:ml-auto md:mr-0">
                  <span
                    className={`text-xs font-bold ${step.color} uppercase tracking-wider`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mt-2 font-medium">
                    {step.description}
                  </p>
                </div>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  className="rounded-[32px] max-w-md w-full mx-auto object-cover"
                />
              </>
            )}
          </div>
        ))}
      </section>

      {/* Subject Grid — Deep Teal Background */}
      <section className="bg-[#027368] py-16 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black tracking-tighter text-center text-white">
            Any subject, explained your way.
          </h2>
          <p className="text-center mt-2 text-emerald-100 font-medium">
            We take the standard school curriculum and break it down through the
            filter of what you love.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {subjects.map(({ subject, topics, chip }) => (
              <div
                key={subject}
                className="bg-white rounded-[32px] p-8 text-slate-900"
              >
                <h3 className="text-xl font-bold text-slate-900">{subject}</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className={`${chip} text-xs font-bold px-4 py-2 rounded-full`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Metrics — Pastel Flood Backgrounds */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black tracking-tighter text-center text-slate-900">
            Progress you can see.
          </h2>
          <p className="text-slate-500 font-medium text-center mt-2">
            Every synthesis moves you forward. Streaks, levels, badges, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {metrics.map((metric) => (
              <div
                key={metric.title}
                className={`${metric.containerClass} rounded-[32px] p-8`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${metric.iconBg}`}
                >
                  {metric.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {metric.title}
                </h3>
                <p className="text-slate-500 mt-3 leading-relaxed text-sm">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Learn — Dark Teal CTA */}
      <section className="bg-[#116d62]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to learn your way?
            </h2>
            <p className="text-lg mt-4 max-w-lg leading-relaxed text-[#8cafb3]">
              Join Waya today and start learning every subject through the things
              you already love.
            </p>
            <Link
              href="/auth?view=get-started"
              className="bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl h-12 px-8 border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all w-fit mt-8 flex items-center justify-center"
            >
              Get Started Free
            </Link>
          </div>
          <div className="rounded-[32px] overflow-hidden">
            <Image
              src="/images/ready-to-learn-image.webp"
              alt="Ready to learn"
              width={600}
              height={450}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-[32px] overflow-hidden">
            <Image
              src="/images/hero-section-image.webp"
              alt="Learn with Waya"
              width={600}
              height={450}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="md:pl-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Start learning today.
            </h2>
            <p className="text-lg text-slate-600 font-medium mt-4 max-w-lg leading-relaxed">
              Join thousands of students who learn through what they love.
            </p>
            <Link
              href="/auth?view=get-started"
              className="bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl h-12 px-8 border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all w-fit mt-8 flex items-center justify-center"
            >
              Start Learning for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        <span className="font-nunito font-bold text-slate-400 text-xl tracking-tighter">waya</span>
        <span className="text-sm font-medium text-slate-400">
          &copy; 2026 Waya. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
