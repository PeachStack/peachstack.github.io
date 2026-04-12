import { motion } from 'motion/react';
import { ChevronRight, Rocket, Target, ShieldCheck, ArrowRight, GraduationCap, Building2, Sparkles, BookOpen, Heart, Users, ExternalLink } from 'lucide-react';
import PeachLogo from '../components/ui/PeachLogo';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

const GOOGLE_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76';
const HERO_CTA_URL = `${GOOGLE_FORM_URL}?utm_source=peachstack&utm_medium=website&utm_campaign=hero_cta`;
const BOTTOM_CTA_URL = `${GOOGLE_FORM_URL}?utm_source=peachstack&utm_medium=website&utm_campaign=bottom_cta`;

export default function Landing() {
  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>Peach Stack — Turn Zero Experience into a Career Stack</title>
        <meta name="description" content="Real internships. Real projects. Real career outcomes. Connect with vetted employers for high-impact work. Based in Atlanta." />
        <link rel="canonical" href="https://peachstack.github.io/" />
        <meta property="og:title" content="Peach Stack — Turn Zero Experience into a Career Stack" />
        <meta property="og:description" content="Real internships. Real projects. Real career outcomes. Peach Stack connects motivated students with vetted employers for high-impact work. Based in Atlanta." />
        <meta property="og:url" content="https://peachstack.github.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://peachstack.github.io/peach-logo.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Peach Stack?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Peach Stack is an early-career platform based in Atlanta, Georgia that connects motivated college students with vetted employers for real, high-impact project-based internships. We place students in roles across sales, consulting, tech, and marketing."
                }
              },
              {
                "@type": "Question",
                "name": "How do I apply to Peach Stack as a student?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Students can apply at https://peachstack.github.io/apply. Fill out the application form and you will be matched to a cohort and role track based on your interests and skills."
                }
              },
              {
                "@type": "Question",
                "name": "What internship tracks does Peach Stack offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Peach Stack offers four internship tracks: Sales & Business Development, Consulting (Business Track), Consulting (Tech Track), and Marketing."
                }
              },
              {
                "@type": "Question",
                "name": "How can employers hire through Peach Stack?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Employers can submit an inquiry at https://peachstack.github.io/for-employers. Peach Stack will match you with a curated cohort of pre-vetted students ready to work on your projects."
                }
              },
              {
                "@type": "Question",
                "name": "Is Peach Stack only in Atlanta?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Peach Stack is based in Atlanta, Georgia but accepts students and serves employers nationally across the United States."
                }
              }
            ]
          }
        `}</script>
      </Helmet>
      <section className="relative bg-white pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600">
                <Sparkles size={16} />
                <span>Now Open for Summer 2026</span>
              </div>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Turn <span className="text-peach-500 italic">Zero Experience</span> into a Career Stack.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Peach Stack bridges the gap between students and the corporate world. Build real skills, complete high impact projects, and launch your career from day one.
              </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href={HERO_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-peach-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-peach-200 transition-all hover:bg-peach-600 hover:shadow-peach-300 active:scale-95"
                >
                  Join as a Student
                  <ArrowRight size={20} />
                </a>
                <Link
                  to="/for-employers"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                >
                  Hire Early Talent
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[
                    { src: '/Arnav_PFP.jpg', alt: 'Arnav' },
                    { src: '/Srikar_PFP.jpg', alt: 'Srikar' },
                    { src: null, initials: 'PS', bg: 'bg-peach-400' },
                    { src: null, initials: 'PS', bg: 'bg-blue-400' },
                  ].map((avatar, i) => (
                    avatar.src ? (
                      <img
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 object-cover"
                        src={avatar.src}
                        alt={avatar.alt}
                        width="32"
                        height="32"
                        loading="eager"
                      />
                    ) : (
                      <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${avatar.bg}`}
                        aria-hidden="true"
                      >
                        {avatar.initials}
                      </div>
                    )
                  ))}
                </div>
                <p>Join the next generation of leaders</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl bg-slate-900 p-2 shadow-2xl">
                <picture>
                  <source srcSet="/crm-dashboard.webp" type="image/webp" />
                  <img
                    src="/crm-dashboard.png"
                    alt="Peach Stack CRM dashboard built by interns"
                    className="rounded-2xl object-cover opacity-90"
                    width="1200"
                    height="642"
                    fetchPriority="high"
                    loading="eager"
                  />
                </picture>
                {/* Floating UI Element */}
                <div className="absolute -bottom-6 left-0 sm:-left-6 rounded-2xl bg-white p-6 shadow-xl md:-left-12">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Vetted Talent</p>
                      <p className="text-lg font-bold text-slate-900">Logic Score: 98/100</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-peach-200/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
              <Sparkles size={16} />
              <span>Our Mission</span>
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
              Bridging the gap between <span className="text-peach-500">ambition</span> and <span className="text-peach-500">opportunity</span>.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Peach Stack was founded with a simple goal: to empower students to build professional "stacks" of skills and experience before they even graduate.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-3xl font-bold text-slate-900 mb-6">The Peach Stack Story</h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                As high school seniors and college students, we saw firsthand how difficult it is to find real opportunities. Traditional internship programs often overlook early students, career fairs feel out of reach, and meaningful experience seems reserved only for upperclassmen.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We realized that waiting for opportunities to come to us wasn't working, so we decided to build a platform that brings those opportunities directly to students. Peach Stack was born from the belief that ambition shouldn't have to wait for a degree.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-2xl font-bold text-peach-500 mb-2">Your Next Opportunity Awaits</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Launch Your Career</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-peach-500 mb-2">Built to Connect You Faster</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accelerated Matching</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=75"
                alt="Students collaborating and succeeding"
                className="rounded-[2.5rem] shadow-2xl object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
                width="800"
                height="600"
                loading="lazy"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-xs hidden sm:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-peach-100 flex items-center justify-center text-peach-600">
                    <Heart size={24} />
                  </div>
                  <p className="font-bold text-slate-900">Student First</p>
                </div>
                <p className="text-sm text-slate-500">Our platform is designed by former consultants who understand what it takes to succeed.</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-peach-50 p-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-peach-500 text-white shadow-lg">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-peach-900 mb-4">For Students</h3>
              <p className="text-lg text-peach-700 leading-relaxed">
                Access professional training, complete real client projects, and build the experience that proves your value to future employers. Build your stack from day one.
              </p>
            </div>
            <Link to="/for-employers" className="rounded-[2rem] bg-blue-50 p-10 transition-all hover:shadow-lg hover:scale-[1.02] group">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg group-hover:bg-blue-600 transition-colors">
                <Building2 size={28} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">For Employers</h3>
              <p className="text-lg text-blue-700 leading-relaxed">
                Tap into a pipeline of motivated, vetted early talent. Get fresh perspectives on projects while building long term brand loyalty and early recruitment.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Project Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 mb-6">
              <Rocket size={16} />
              <span>Real World Impact</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-slate-900">Our Work in Action</h2>
            <p className="mt-4 text-lg text-slate-600">See the high impact projects our students deliver for real clients.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
              {/* Image Side */}
              <div className="relative h-[300px] lg:h-auto overflow-hidden bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-transparent z-10" />
                <img 
                  src="https://api.microlink.io/?url=https://luxe-threading-wx8o.vercel.app/&screenshot=true&meta=false&embed=screenshot.url"
                  alt="Luxe Threading Studio Website Preview"
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="800"
                  height="600"
                />
              </div>

              {/* Content Side */}
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-peach-500 flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-peach-400 font-bold tracking-wider uppercase text-xs">Featured Project</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Luxe Threading Studio</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                  A full service website built for a premium brow studio in Atlanta. From design to deployment, this is an example of the real world projects our students tackle through Peach Stack.
                </p>
                <a 
                  href="https://luxe-threading-wx8o.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-peach-500 hover:text-white active:scale-95"
                >
                  View Live Site
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-peach-500/10 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900">Our Core Values</h2>
            <p className="mt-4 text-lg text-slate-600">The principles that guide everything we build at Peach Stack.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparency',
                desc: 'We believe in clear outcomes and verified skills. No fluff, just results.',
                icon: ShieldCheck,
                color: 'bg-blue-500'
              },
              {
                title: 'Accessibility',
                desc: 'Professional opportunities should be available to all motivated students, regardless of their background.',
                icon: Users,
                color: 'bg-peach-500'
              },
              {
                title: 'Excellence',
                desc: 'We hold our students and partners to the highest standards of professional delivery.',
                icon: Target,
                color: 'bg-indigo-500'
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100"
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", value.color)}>
                  <value.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The Layered Approach to Career Success
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              We don't just match you with jobs. We build your professional "stack" from the ground up.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Foundational Skills',
                desc: 'Master industry standard tools like Excel, CRM, and Market Research through our curated professional resources.',
                icon: BookOpen,
                color: 'bg-blue-500',
              },
              {
                title: 'Dynamic Stack Profile',
                desc: 'Replace your empty resume with a live showcase of real project outcomes, skills in action, and professional deliverables.',
                icon: PeachLogo,
                color: 'bg-transparent',
              },
              {
                title: 'Real World Projects',
                desc: 'Get matched with companies for high impact projects that turn theory into tangible deliverables.',
                icon: Target,
                color: 'bg-indigo-500',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-20 text-center shadow-2xl sm:px-16">
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to build your stack?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
                Join the marketplace where ambition meets corporate opportunity.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={BOTTOM_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-2xl bg-peach-500 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-peach-600 sm:w-auto"
                >
                  Start as Student
                </a>
                <Link
                  to="/get-started"
                  className="w-full rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 sm:w-auto"
                >
                  Partner with Us
                </Link>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-peach-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
