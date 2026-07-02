import Image from 'next/image';

const subjects = [
  {
    subject: 'Mathematics',
    topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    icon: '📐',
    chip: 'bg-violet-50 text-violet-700',
  },
  {
    subject: 'Science & Tech',
    topics: ['Physics', 'Chemistry', 'Biology', 'Computer Science'],
    icon: '🔬',
    chip: 'bg-amber-50 text-amber-700',
  },
  {
    subject: 'History & Culture',
    topics: ['World History', 'African Heritage', 'Government', 'Philosophy'],
    icon: '📜',
    chip: 'bg-rose-50 text-rose-700',
  },
  {
    subject: 'Creative Arts',
    topics: ['Music', 'Art & Design', 'Literature', 'Fashion'],
    icon: '🎨',
    chip: 'bg-indigo-50 text-indigo-700',
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
    containerClass: 'bg-[#effaf3] border-[#d1f2dc]',
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
    containerClass: 'bg-[#fff0f3] border-[#ffe0e6]',
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
    containerClass: 'bg-[#f5f3ff] border-[#e8e4fe]',
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
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <nav className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-row justify-between items-center">
          <span className="text-2xl font-black text-[#03a696] tracking-tight">waya</span>
          <div className="flex flex-row items-center gap-6">
            <a
              href="/auth/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Sign In
            </a>
            <a
              href="/auth/signup"
              className="bg-[#03a696] hover:bg-[#028b7e] text-white text-sm font-bold rounded-xl px-5 py-2.5 border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all"
            >
              Get Started
            </a>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Learn any subject through{' '}
            <span className="text-[#f25c74]">what you love.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
            Waya is your AI study partner. We break down complex school topics using
            the things you actually care about, like gaming, music, and sports.
          </p>
          <a
            href="/auth/signup"
            className="bg-[#03a696] hover:bg-[#028b7e] text-white text-base font-extrabold rounded-xl px-8 py-3.5 border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all w-fit mt-8 flex items-center justify-center"
          >
            Start Learning for Free
          </a>
        </div>
        <div className="w-full flex justify-center">
          <Image
            src="/images/hero-section-image.webp"
            alt="Student learning with Waya"
            width={800}
            height={600}
            className="rounded-3xl shadow-lg border border-slate-100 max-w-xl w-full object-cover"
            priority
          />
        </div>
      </section>

      {/* 3-Step Flow Section */}
      <section className="py-16 bg-white border-t border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center mb-12 px-6">
          <h2 className="text-4xl font-black text-slate-900">
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
            className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-12"
          >
            {step.imageFirst ? (
              <>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  className="rounded-3xl shadow-md max-w-sm w-full mx-auto object-cover"
                />
                <div>
                  <span
                    className={`text-xs font-bold ${step.color} uppercase tracking-wider`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mt-2 font-medium">
                    {step.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span
                    className={`text-xs font-bold ${step.color} uppercase tracking-wider`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
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
                  className="rounded-3xl shadow-md max-w-sm w-full mx-auto object-cover"
                />
              </>
            )}
          </div>
        ))}
      </section>

      {/* Subject Grid — Deep Teal Background */}
      <section className="bg-[#027368] py-20 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-white">
            Any subject, explained your way.
          </h2>
          <p className="text-center mt-2 text-emerald-100 font-medium">
            We take the standard school curriculum and break it down through the
            filter of what you love.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {subjects.map(({ subject, topics, chip }) => (
              <div
                key={subject}
                className="bg-white rounded-3xl p-8 shadow-md text-slate-900"
              >
                <h3 className="text-xl font-bold text-slate-900">{subject}</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className={`${chip} text-xs font-bold px-3 py-1 rounded-full`}
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
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-slate-900">
            Progress you can see.
          </h2>
          <p className="text-slate-500 font-medium text-center mt-2">
            Every synthesis moves you forward. Streaks, levels, badges, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {metrics.map((metric) => (
              <div
                key={metric.title}
                className={`${metric.containerClass} border rounded-3xl p-8 shadow-sm`}
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
            <a
              href="/auth/signup"
              className="inline-block bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all px-8 py-3.5 mt-8"
            >
              Get Started Free
            </a>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg">
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
          <div className="rounded-3xl overflow-hidden shadow-md">
            <Image
              src="/images/hero-section-image.webp"
              alt="Learn with Waya"
              width={600}
              height={450}
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Start learning today.
            </h2>
            <p className="text-lg text-slate-600 font-medium mt-4 max-w-lg leading-relaxed">
              Join thousands of students who learn through what they love.
            </p>
            <a
              href="/auth/signup"
              className="inline-block bg-[#03a696] hover:bg-[#028b7e] text-white font-bold rounded-xl border-b-4 border-[#016f64] active:translate-y-[2px] active:border-b-2 transition-all px-8 py-3.5 mt-8"
            >
              Start Learning for Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <span className="text-xs font-semibold text-slate-400">waya</span>
        <span className="text-xs text-slate-400">
          &copy; 2026 Waya. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
