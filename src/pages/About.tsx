import { motion } from 'motion/react';
import { Linkedin, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const founders = [
  {
    name: 'Arnav Hazari',
    title: 'Co-Founder',
    education: 'Management Information Systems @ University of Georgia',
    experience: [
      'AI Development Fellow at Handshake',
      'Generative AI Specialist at Uber AI Solutions',
      'Research Intern at University of Colorado Boulder',
    ],
    bio: 'Arnav leads product, engineering, and client strategy. He has built data systems, automated financial workflows, and evaluated multimodal AI pipelines at scale. He bridges technical execution and business outcomes.',
    tech: 'Python, SQL, Streamlit, Pandas, AI/ML pipelines',
    avatar: 'Arnav_PFP.jpg',
  },
  {
    name: 'Srikar Jujala',
    title: 'Co-Founder',
    education: 'Finance + Risk Management & Insurance @ University of Georgia\nMS Business Analytics (incoming) @ University of Georgia',
    experience: [
      'AI Development Fellow at Handshake',
      'Eagle Scout',
    ],
    bio: 'Srikar leads operations, finance, and business development. His background spans risk analysis, financial modeling, and clinical operations, bringing the rigor of compliance and the instincts of a builder to everything Peach Stack does.',
    tech: null,
    avatar: 'Srikar_PFP.jpg',
  },
];

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>About — Peach Stack | Student Internship Platform in Atlanta</title>
        <meta name="description" content="Meet the founders of Peach Stack. We're UGA students building the internship platform we wish existed — real projects, real mentorship, real career outcomes." />
        <link rel="canonical" href="https://peachstack.github.io/about" />
        <meta property="og:title" content="About — Peach Stack | Student Internship Platform in Atlanta" />
        <meta property="og:description" content="Meet the founders of Peach Stack. We're UGA students building the internship platform we wish existed — real projects, real mentorship, real career outcomes." />
        <meta property="og:url" content="https://peachstack.github.io/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://peachstack.github.io/peach-logo.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "url": "https://peachstack.github.io/about",
            "name": "About Peach Stack",
            "description": "Meet the founders of Peach Stack — Arnav Hazari and Srikar Jujala, UGA students building the internship platform for the next generation of talent.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Peach Stack",
              "url": "https://peachstack.github.io",
              "foundingLocation": "Atlanta, Georgia, USA",
              "member": [
                {
                  "@type": "Person",
                  "name": "Arnav Hazari",
                  "jobTitle": "Co-Founder",
                  "alumniOf": "University of Georgia",
                  "description": "Leads product, engineering, and client strategy. Previously AI Development Fellow at Handshake and Generative AI Specialist at Uber AI Solutions.",
                  "knowsAbout": ["Python", "SQL", "AI/ML", "Streamlit", "Pandas"]
                },
                {
                  "@type": "Person",
                  "name": "Srikar Jujala",
                  "jobTitle": "Co-Founder",
                  "alumniOf": "University of Georgia",
                  "description": "Leads operations, finance, and business development. Background in risk analysis, financial modeling, and clinical operations."
                }
              ]
            }
          }
        `}</script>
      </Helmet>
      <section className="bg-slate-950 py-24 lg:py-32 overflow-hidden relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-500/10 px-4 py-1.5 text-sm font-bold text-peach-400 mb-8 border border-peach-500/20">
              <MapPin size={14} />
              <span>Atlanta, Georgia</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl mb-8">
              Building the infrastructure for the next generation of{' '}
              <span className="text-peach-500">professional talent.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Peach Stack was founded in Atlanta by two builders who saw the same problem from both
              sides: students who couldn't get experience without experience, and businesses that
              couldn't find reliable junior talent without spending months training them. We decided
              to fix both at once.
            </p>
          </motion.div>
        </div>
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-peach-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      {/* Founders */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900">The Team</h2>
            <p className="mt-4 text-lg text-slate-600">
              Two builders. One mission.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {founders.map((founder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg shrink-0 bg-slate-100">
                    <img src={`${import.meta.env.BASE_URL}${founder.avatar}`} alt={founder.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-slate-900">{founder.name}</h3>
                    <p className="text-peach-500 font-bold text-sm uppercase tracking-wider mt-1">{founder.title}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      <GraduationCap size={14} />
                      Education
                    </div>
                    {founder.education.split('\n').map((line, j) => (
                      <p key={j} className="text-slate-700 text-sm leading-relaxed">{line}</p>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      <Briefcase size={14} />
                      Previously
                    </div>
                    <ul className="space-y-1">
                      {founder.experience.map((exp, j) => (
                        <li key={j} className="text-slate-700 text-sm flex items-start gap-2">
                          <span className="text-peach-400 mt-1.5 shrink-0">•</span>
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{founder.bio}</p>

                  {founder.tech && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Tech</p>
                      <p className="text-slate-700 text-sm font-medium">{founder.tech}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-slate-900 leading-relaxed mb-6">
              We are not a job board. We are not a bootcamp.
            </p>
            <p className="text-xl text-slate-600 leading-relaxed mb-6">
              We are the operating layer between ambition and opportunity, built by people who have
              worked at the companies you want to work at, and who know exactly what it takes to get
              there.
            </p>
            <p className="text-lg font-bold text-peach-500">
              Based in Atlanta. Building nationally.
            </p>

            <div className="mt-12 flex justify-center">
              <a
                href="https://www.linkedin.com/company/peach-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
              >
                <Linkedin size={18} />
                Follow us on LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
