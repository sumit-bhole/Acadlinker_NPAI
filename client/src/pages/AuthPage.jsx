import React, { useState } from 'react';
import { Users, BookOpen, Shield } from 'lucide-react';
import LoginForm from '../components/LoginForm';       // Adjust path
import RegisterForm from '../components/RegisterForm'; // Adjust path

// Feature Card Component (Local to this file as it's presentation only)
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
    <div className="p-2 bg-indigo-500/20 rounded-lg">
      <Icon className="h-6 w-6 text-indigo-300" />
    </div>
    <div>
      <h3 className="font-semibold text-white text-lg">{title}</h3>
      <p className="text-indigo-100/80 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const AuthPage = () => {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      
      {/* LEFT SECTION – DESKTOP INFO */}
      <div className="hidden md:flex relative flex-col justify-center px-12 lg:px-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
        
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 drop-shadow-sm">
              Acadlinker
            </h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight pb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
            Grow together through <br /> skill-based networking.
          </h2>
          
          <p className="text-lg text-indigo-200/80 mb-10 max-w-lg">
            Connect with students across universities and collaborate on real-world projects in a secure environment.
          </p>

          <div className="space-y-4 max-w-lg">
            <FeatureCard 
              icon={Users} 
              title="Find Partners" 
              desc="Discover study buddies & project partners based on shared skills."
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Collaborate" 
              desc="Work on real academic projects with integrated tools."
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Platform" 
              desc="A verified, student-only environment you can trust."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION – AUTH FORM CONTAINER */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 relative overflow-hidden">
          
          {/* Decorative top accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center justify-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent pb-1">
              Acadlinker
            </h1>
            <div className="h-1.5 w-12 bg-indigo-600 rounded-full mt-1"></div>
          </div>

          {/* Render Login or Register Component based on state */}
          {view === 'login' ? (
            <LoginForm onSwitchView={() => setView('register')} />
          ) : (
            <RegisterForm onSwitchView={() => setView('login')} />
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthPage;