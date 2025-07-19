import React from 'react';
import { Users, TrendingUp, Target, Award, Zap, CheckCircle } from 'lucide-react';

interface FloatingCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  position: string;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ icon, title, subtitle, color, delay, position }) => (
  <div 
    className={`absolute ${position} bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 animate-fade-in hover-scale`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-gray-800 text-sm">{title}</div>
        <div className="text-gray-600 text-xs">{subtitle}</div>
      </div>
    </div>
  </div>
);

const AnimatedHero: React.FC = () => {
  return (
    <div className="relative h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col justify-center items-center p-8 text-white">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Transform Your
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Lead Management
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Convert prospects into customers with our powerful CRM platform
          </p>
        </div>

        {/* Floating Cards */}
        <FloatingCard
          icon={<Users className="h-4 w-4 text-emerald-600" />}
          title="Sarah M."
          subtitle="New lead added"
          color="bg-emerald-100"
          delay={0.5}
          position="top-20 left-8"
        />

        <FloatingCard
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          title="Revenue +25%"
          subtitle="This month"
          color="bg-blue-100"
          delay={1}
          position="top-40 right-12"
        />

        <FloatingCard
          icon={<CheckCircle className="h-4 w-4 text-purple-600" />}
          title="Deal Closed"
          subtitle="$15,000 won"
          color="bg-purple-100"
          delay={1.5}
          position="bottom-32 left-12"
        />

        <FloatingCard
          icon={<Award className="h-4 w-4 text-orange-600" />}
          title="Goal Achieved"
          subtitle="Monthly target hit"
          color="bg-orange-100"
          delay={2}
          position="bottom-20 right-8"
        />

        {/* Animated Stats */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-8 animate-fade-in" style={{ animationDelay: '2.5s' }}>
          <div className="text-center">
            <div className="text-2xl font-bold">2.5k+</div>
            <div className="text-sm text-white/70">Leads Managed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-white/70">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-white/70">Support</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default AnimatedHero;