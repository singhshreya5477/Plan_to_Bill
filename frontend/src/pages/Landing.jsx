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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#ffffff,#f8f7ff)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 gradient-bg-purple animate-float" style={{ filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-14 gradient-bg-primary" style={{ filter: 'blur(90px)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-12 gradient-bg-purple" style={{ filter: 'blur(90px)', animation: 'float 12s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                P2B
              </div>
              <span className="text-2xl font-bold gradient-text-primary">Plan-to-Bill</span>
            </div>
            <div className="flex items-center space-x-4 animate-slide-in-right delay-100">
              <Link 
                to="/login" 
                className="px-6 py-2 rounded-lg font-medium transition-all hover-scale"
                style={{ color: 'rgb(var(--text-primary))' }}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2 rounded-lg font-medium text-white gradient-bg-primary shadow-lg hover-lift"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 animate-fade-in">
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg inline-block" style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)' }}>
                🚀 The Complete Project Management Solution
              </span>
            </div>
            <h1 className="text-6xl font-bold mb-6 animate-slide-up" style={{ color: '#2b2540' }}>
              From <span style={{ color: '#6D28D9' }}>Planning</span> to{' '}
              <span style={{ color: '#6D28D9' }}>Billing</span>
              <br />All in One Place
            </h1>
            <p className="text-xl mb-10 animate-slide-up delay-100" style={{ color: 'rgb(var(--text-secondary))' }}>
              Streamline your entire project lifecycle with powerful tools for planning, tracking, 
              collaboration, and invoicing. Built for modern teams.
            </p>
            <div className="flex items-center justify-center space-x-4 animate-slide-up delay-200">
              <Link 
                to="/signup" 
                className="px-8 py-4 rounded-xl font-bold text-white shadow-xl hover-lift group text-lg"
                style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)' }}
              >
                Start Free Trial
                <FiArrowRight className="inline-block ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <button 
                className="px-8 py-4 rounded-xl font-medium transition-all hover-scale shadow-lg"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  color: 'rgb(var(--text-primary))'
                }}
              >
                Watch Demo
              </button>
            </div>
            <p className="mt-6 text-sm animate-fade-in delay-300" style={{ color: 'rgb(var(--text-tertiary))' }}>
              ✨ No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
              Everything You Need to{' '}
              <span className="gradient-text-primary">Succeed</span>
            </h2>
            <p className="text-xl" style={{ color: 'rgb(var(--text-secondary))' }}>
              Powerful features designed to help your team work smarter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition-all hover-lift cursor-pointer group animate-fade-in relative overflow-hidden"
                style={{ 
                  backgroundColor: '#ffffff',
                  animationDelay: `${index * 0.1}s`,
                  border: '1px solid rgb(var(--border-color))'
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${feature.color}, transparent)` }}
                />
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#2b2540' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b677d' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="rounded-3xl p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 gradient-bg-primary opacity-90"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Why Choose Plan-to-Bill?
                </h2>
                <p className="text-white/90 text-lg mb-8">
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
