import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, GraduationCap, ChevronDown, User, Settings as SettingsIcon, LogOut, Building2, Mail, Linkedin } from 'lucide-react';
import PeachLogo from './components/ui/PeachLogo';
import ScrollToTop from './components/ScrollToTop';
import { useState, useEffect, lazy, Suspense } from 'react';
import { cn } from './lib/utils';
import { Toaster, toast } from 'sonner';
import { apiFetch } from './lib/api';

// Pages
const Landing = lazy(() => import('./pages/Landing'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const GetStarted = lazy(() => import('./pages/GetStarted'));
const StudentSignup = lazy(() => import('./pages/StudentSignup'));
const EmployerOnboarding = lazy(() => import('./pages/EmployerOnboarding'));
const ForEmployers = lazy(() => import('./pages/ForEmployers'));
const Login = lazy(() => import('./pages/Login'));
const Workspace = lazy(() => import('./pages/Workspace'));
const WorkspaceLogin = lazy(() => import('./pages/WorkspaceLogin'));
const Settings = lazy(() => import('./pages/Settings'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Contact = lazy(() => import('./pages/Contact'));
const Apply = lazy(() => import('./pages/Apply'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const About = lazy(() => import('./pages/About'));
const Community = lazy(() => import('./pages/Community'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const Developers = lazy(() => import('./pages/Developers'));
const Safety = lazy(() => import('./pages/Safety'));
const Guidelines = lazy(() => import('./pages/Guidelines'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminInterns = lazy(() => import('./pages/admin/Interns'));
const AdminInternDetail = lazy(() => import('./pages/admin/InternDetail'));
const AdminTasks = lazy(() => import('./pages/admin/Tasks'));
const AdminTaskCreate = lazy(() => import('./pages/admin/TaskCreate'));
const AdminTaskDetail = lazy(() => import('./pages/admin/TaskDetail'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminCohorts = lazy(() => import('./pages/admin/Cohorts'));
const AdminCommunications = lazy(() => import('./pages/admin/Communications'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminTeam = lazy(() => import('./pages/admin/Team'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
const AdminContactSubmissions = lazy(() => import('./pages/admin/ContactSubmissions'));
const WorkspaceMessages = lazy(() => import('./pages/workspace/Messages'));

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await apiFetch('/api/me');
        setUserName(data.user.name);
        setUserRole(data.user.role);
        localStorage.setItem('peachstack_user_name', data.user.name);
        localStorage.setItem('peachstack_user_role', data.user.role);
      } catch (error) {
        setUserName(localStorage.getItem('peachstack_user_name'));
        setUserRole(localStorage.getItem('peachstack_user_role'));
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') checkUser();
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('peachstack_user_name');
      localStorage.removeItem('peachstack_user_role');
      localStorage.removeItem('peachstack_user_university');
      localStorage.removeItem('peachstack_user_year');
      setUserName(null);
      setUserRole(null);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const navLinks: { name: string; path: string; icon: any }[] = userName ? (
    userRole === 'employer' ? [
      { name: 'Dashboard', path: '/employer', icon: PeachLogo },
      { name: 'Contact', path: '/contact', icon: Mail },
    ] : [
      { name: 'Workspace', path: '/workspace', icon: PeachLogo },
      { name: 'Profile', path: '/student', icon: GraduationCap },
      { name: 'Contact', path: '/contact', icon: Mail },
    ]
  ) : [
    { name: 'For Students', path: '/apply', icon: GraduationCap },
    { name: 'For Employers', path: '/for-employers', icon: Building2 },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <Toaster position="top-center" richColors />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center transition-transform group-hover:scale-105">
              <PeachLogo size={32} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              Peach <span className="text-peach-500">Stack</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => {
            const isHashLink = link.path.startsWith('/#');
            const content = (
              <>
                <link.icon size={18} />
                {link.name}
              </>
            );

            if (isHashLink) {
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      const id = link.path.replace('/#', '');
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-peach-500 text-slate-600"
                  )}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-peach-500",
                  location.pathname === link.path ? "text-peach-500" : "text-slate-600"
                )}
              >
                {content}
              </Link>
            );
          })}
          {userName ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-peach-500 text-[10px] text-white">
                  {userName.charAt(0)}
                </div>
                <span>{userName}</span>
                <ChevronDown size={16} className={cn("transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-20"
                    >
                      <div className="px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</p>
                      </div>
                      <Link
                        to={userRole === 'employer' ? '/employer' : '/student'}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500 transition-colors"
                      >
                        <User size={18} />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500 transition-colors"
                      >
                        <SettingsIcon size={18} />
                        Settings
                      </Link>
                      <div className="h-px bg-slate-50 my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 hover:text-peach-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/get-started"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-100 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-2">
              {navLinks.map((link) => {
                const isHashLink = link.path.startsWith('/#');
                const content = (
                  <>
                    <link.icon size={20} />
                    {link.name}
                  </>
                );

                if (isHashLink) {
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      onClick={(e) => {
                        setIsOpen(false);
                        if (location.pathname === '/') {
                          e.preventDefault();
                          const id = link.path.replace('/#', '');
                          const element = document.getElementById(id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500"
                  >
                    {content}
                  </Link>
                );
              })}
              <div className="pt-4 space-y-3">
                {userName ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 border-b border-slate-50 mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</p>
                    </div>
                    <Link
                      to={userRole === 'employer' ? '/employer' : '/student'}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500"
                    >
                      <User size={20} />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-peach-500"
                    >
                      <SettingsIcon size={20} />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 py-3 text-base font-bold text-red-600"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-base font-bold text-slate-900"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/get-started"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-peach-500 py-3 text-base font-bold text-white shadow-lg shadow-peach-100"
                    >
                      Join the Stack
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  const EMPLOYER_FORM_URL = 'https://docs.google.com/forms/d/1uz55KEIkH3XwnVJxvdQgMMByidmsQRB9dRkVWLJb8p0/viewform';
  const STUDENT_FORM_URL = 'https://forms.gle/8nDwdqpbnXuYnhj76';

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 mb-16">
          {/* Logo and Tagline */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <PeachLogo size={32} />
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Peach <span className="text-peach-500">Stack</span>
              </span>
            </Link>
            <p className="max-w-xs text-base leading-relaxed mb-8">
              Building the professional stack for the next generation of corporate leaders. Bridging the gap between ambition and opportunity.
            </p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/peach-stack/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-peach-500 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><a href={STUDENT_FORM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-peach-500 transition-colors">Apply</a></li>
              <li><Link to="/for-employers" className="hover:text-peach-500 transition-colors">For Employers</Link></li>
              <li><Link to="/contact" className="hover:text-peach-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/developers" className="hover:text-peach-500 transition-colors">Developers</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-peach-500 transition-colors">About Us</Link></li>
              <li><Link to="/safety" className="hover:text-peach-500 transition-colors">Safety</Link></li>
              <li><Link to="/guidelines" className="hover:text-peach-500 transition-colors">Guidelines</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-xs font-medium">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Peach Stack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function MainApp() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="interns" element={<AdminInterns />} />
            <Route path="interns/:id" element={<AdminInternDetail />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="tasks/create" element={<AdminTaskCreate />} />
            <Route path="tasks/:id" element={<AdminTaskDetail />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="cohorts" element={<AdminCohorts />} />
            <Route path="communications" element={<AdminCommunications />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="contacts" element={<AdminContactSubmissions />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/workspace/login" element={<WorkspaceLogin />} />
              <Route path="/workspace/messages" element={<WorkspaceMessages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/for-employers" element={<ForEmployers />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/student/signup" element={<Apply />} />
              <Route path="/employer/onboarding" element={<EmployerOnboarding />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/creators" element={<About />} />
              <Route path="/community" element={<Community />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </Suspense>
        </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
