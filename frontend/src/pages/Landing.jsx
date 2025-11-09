import { Link } from 'react-router-dom';
import { 
  FiCheck, 
  FiArrowRight, 
  FiZap, 
  FiUsers, 
  FiTrendingUp, 
  FiShield,
  FiClock,
  FiDollarSign,
  FiBarChart,
  FiTarget
} from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const Landing = () => {
  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Streamline your project workflow with our intuitive interface',
      color: '#fb923c'
    },
    {
      icon: FiUsers,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team in real-time',
      color: '#a855f7'
    },
    {
      icon: FiTrendingUp,
      title: 'Analytics & Reports',
      description: 'Get insights with powerful analytics and reporting tools',
      color: '#14b8a6'
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your sensitive data',
      color: '#f43f5e'
    },
    {
      icon: FiClock,
      title: 'Time Tracking',
      description: 'Track time spent on projects and tasks efficiently',
      color: '#06b6d4'
    },
    {
      icon: FiDollarSign,
      title: 'Billing Made Easy',
      description: 'From planning to billing in one integrated platform',
      color: '#6366f1'
    }
  ];

  const benefits = [
    'Unlimited projects and tasks',
    'Real-time collaboration',
    'Advanced analytics dashboard',
    'Time tracking & timesheets',
    'Invoice generation',
    'Custom workflows',
    'Mobile app access',
    '24/7 customer support'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#0a0118,#1a0b2e,#2d1b4e)' }}>
      {/* Animated Background with particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Morphing blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-30 gradient-bg-purple blob-animate" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-25 gradient-bg-blue blob-animate" style={{ filter: 'blur(80px)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 gradient-bg-pink blob-animate" style={{ filter: 'blur(90px)', animationDelay: '4s' }} />
        
        {/* Cosmic particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="cosmic-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Cyber grid */}
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between glass-effect rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center space-x-3 animate-slide-in-right group cursor-pointer">
              <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold text-lg shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all relative overflow-hidden">
                {/* Rotating border */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-spin" style={{ animationDuration: '3s' }}></div>
                <span className="relative z-10">P2B</span>
              </div>
              <span className="text-2xl font-black holographic">Plan-to-Bill</span>
            </div>
            <div className="flex items-center space-x-4 animate-slide-in-right delay-100">
              <ThemeToggle />
              <Link 
                to="/login" 
                className="px-6 py-2 rounded-lg font-medium transition-all hover-scale text-white/80 hover:text-white"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-3 rounded-xl font-bold text-white gradient-bg-primary shadow-2xl hover-lift liquid-btn relative overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <span className="px-6 py-3 rounded-full text-sm font-bold text-white shadow-2xl inline-block glass-effect border border-white/20 hover-scale cursor-pointer group">
                <span className="animate-pulse inline-block mr-2">🚀</span>
                <span className="holographic">The Complete Project Management Solution</span>
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black mb-8 animate-slide-up leading-tight">
              <span className="text-white">From </span>
              <span className="holographic">Planning</span>
              <span className="text-white"> to </span>
              <span className="holographic">Billing</span>
              <br />
              <span className="text-white/90">All in </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient gradient-animated">
                One Place
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-16 animate-slide-up delay-100 text-white/70 max-w-3xl mx-auto leading-relaxed">
              Streamline your entire project lifecycle with <span className="text-purple-400 font-semibold">powerful tools</span> for planning, tracking, 
              collaboration, and invoicing. Built for <span className="text-blue-400 font-semibold">modern teams</span>.
            </p>
            
            {/* Floating stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto animate-slide-up delay-400">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '99.9%', label: 'Uptime' },
                { value: '500K+', label: 'Projects Delivered' }
              ].map((stat, idx) => (
                <div key={idx} className="glass-effect rounded-2xl p-6 border border-white/10 hover-lift group cursor-pointer">
                  <div className="text-4xl font-black holographic group-hover:scale-110 transition-transform">{stat.value}</div>
                  <div className="text-sm text-white/60 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-white">
              Everything You Need to{' '}
              <span className="holographic">Succeed</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Powerful features designed to help your team work <span className="text-purple-400 font-semibold">smarter</span> and <span className="text-blue-400 font-semibold">faster</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl transition-all hover-lift cursor-pointer group animate-fade-in relative overflow-hidden glass-effect border border-white/10 tilt-3d"
                style={{ 
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${feature.color}, transparent)` }}
                />
                
                {/* Glowing border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    boxShadow: `0 0 30px ${feature.color}50, inset 0 0 20px ${feature.color}20`,
                    border: `1px solid ${feature.color}40`
                  }}
                />
                
                {/* Icon with glow effect */}
                <div className="relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}cc)` }}
                  >
                    {/* Rotating ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-spin" style={{ animationDuration: '3s' }}></div>
                    
                    {/* Icon */}
                    <feature.icon className="w-8 h-8 text-white relative z-10 drop-shadow-2xl" />
                    
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity"
                      style={{ background: feature.color }}
                    ></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Animated arrow */}
                  <div className="mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2"
                    style={{ color: feature.color }}
                  >
                    Learn more <FiArrowRight className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-2xl border border-white/10">
            {/* Animated gradient background */}
            <div className="absolute inset-0 gradient-bg-primary opacity-90 gradient-animated" style={{ backgroundSize: '200% 200%' }}></div>
            
            {/* Morphing blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl blob-animate"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl blob-animate" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Floating particles */}
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                style={{
                  left: `${10 + i * 10}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animation: `cosmic-float ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                  Why Choose <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">Plan-to-Bill</span>?
                </h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Join thousands of teams who have transformed their project management 
                  workflow with our all-in-one platform.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 text-white animate-slide-in-right"
                      style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl p-8 glass-effect backdrop-blur-xl border border-white/20 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/10">
                      <div className="flex items-center space-x-3">
                        <FiBarChart className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">Active Projects</span>
                      </div>
                      <span className="text-2xl font-bold text-white">245</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/10">
                      <div className="flex items-center space-x-3">
                        <FiUsers className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">Team Members</span>
                      </div>
                      <span className="text-2xl font-bold text-white">1.2K+</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/10">
                      <div className="flex items-center space-x-3">
                        <FiTarget className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">Completion Rate</span>
                      </div>
                      <span className="text-2xl font-bold text-white">98%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'rgb(var(--text-primary))' }}>
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl mb-10" style={{ color: 'rgb(var(--text-secondary))' }}>
              Join thousands of teams already using Plan-to-Bill to manage their projects efficiently
            </p>
            <Link 
              to="/signup" 
              className="inline-block px-10 py-5 rounded-xl font-bold text-white text-lg gradient-bg-primary shadow-2xl hover-lift group"
            >
              Get Started for Free
              <FiArrowRight className="inline-block ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8" style={{ borderColor: 'rgb(var(--border-color))' }}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center text-white font-bold">
                  P2B
                </div>
                <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                  Plan-to-Bill
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                © 2025 Plan-to-Bill. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
