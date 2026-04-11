import { motion } from 'motion/react';
import { MOCK_STUDENT } from '../constants';
import { Briefcase, ChevronRight, Edit3, Save, Trophy } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const [student, setStudent] = useState(MOCK_STUDENT);

  useEffect(() => {
    const savedName = localStorage.getItem('peachstack_user_name');
    const savedFirstName = localStorage.getItem('peachstack_user_first_name');
    const savedLastName = localStorage.getItem('peachstack_user_last_name');
    const savedBirthday = localStorage.getItem('peachstack_user_birthday');
    const savedUniversity = localStorage.getItem('peachstack_user_university');
    const savedYear = localStorage.getItem('peachstack_user_year');
    
    if (savedName || savedUniversity || savedYear) {
      setStudent(prev => ({ 
        ...prev, 
        name: savedName || prev.name,
        firstName: savedFirstName || '',
        lastName: savedLastName || '',
        birthday: savedBirthday || '',
        university: savedUniversity || prev.university,
        year: savedYear || prev.year
      }));
    }
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: localStorage.getItem('peachstack_user_first_name') || '',
    lastName: localStorage.getItem('peachstack_user_last_name') || '',
    bio: student.bio,
    university: student.university
  });

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const fullName = `${editForm.firstName} ${editForm.lastName}`;
    setStudent(prev => ({
      ...prev,
      name: fullName,
      university: editForm.university,
      bio: editForm.bio
    }));
    localStorage.setItem('peachstack_user_name', fullName);
    localStorage.setItem('peachstack_user_first_name', editForm.firstName);
    localStorage.setItem('peachstack_user_last_name', editForm.lastName);
    localStorage.setItem('peachstack_user_university', editForm.university);
    setIsEditModalOpen(false);
    toast.success('Profile updated successfully!');
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.info('Profile link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header / Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative">
              <img
                src="https://picsum.photos/seed/student/200/200"
                alt={student.name}
                className="h-32 w-32 rounded-3xl object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-peach-500 text-white shadow-lg">
                <Trophy size={20} />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold text-slate-900">{student.name}</h1>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Year {student.year} • {student.university}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-slate-600">{student.bio}</p>
              <div className="mt-6 flex flex-wrap gap-6">
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto">
              <button 
                onClick={handleShareProfile}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
              >
                Share Profile
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-95"
              >
                <Edit3 size={18} />
                Edit Stack
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Stack Profile"
        >
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">University</label>
              <input
                type="text"
                value={editForm.university}
                onChange={(e) => setEditForm(prev => ({ ...prev, university: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                required
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-peach-500 py-4 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95"
            >
              <Save size={20} />
              Save Changes
            </button>
          </form>
        </Modal>

        <div className="mt-8 grid grid-cols-1 gap-8">
          {/* Projects */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-slate-900">Project History</h2>
                <button className="text-sm font-bold text-peach-600 hover:underline">Find New Projects</button>
              </div>
              <div className="space-y-4">
                {student.projects.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
                    <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium text-slate-500">No projects yet</p>
                    <p className="text-sm text-slate-400 mt-1">Projects you complete will appear here.</p>
                  </div>
                ) : (
                  student.projects.map((project) => (
                    <div key={project.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <Briefcase size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{project.title}</h3>
                          <p className="text-sm text-slate-500">{project.company} • {project.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                          <p className="text-sm font-bold text-green-600">{project.status}</p>
                        </div>
                        <button className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
