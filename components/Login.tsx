import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, Lock, Mail, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type LoginProps = {
  onLogin: (user: { name: string; role: string; email: string }) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo credentials for different roles
  const demoUsers = [
    { email: 'admin@powerplant.com', password: 'admin123', name: 'System Admin', role: 'Administrator' },
    { email: 'manager@powerplant.com', password: 'manager123', name: 'Zhang Wei', role: 'Maintenance Manager' },
    { email: 'technician@powerplant.com', password: 'tech123', name: 'Li Ming', role: 'Maintenance Worker' },
    { email: 'safety@powerplant.com', password: 'safety123', name: 'Zhou Yu', role: 'Safety Officer' },
    { email: 'viewer@powerplant.com', password: 'viewer123', name: 'Chen Jian', role: 'Viewer' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        onLogin({ name: user.name, role: user.role, email: user.email });
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (userEmail: string) => {
    const user = demoUsers.find(u => u.email === userEmail);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-white">AI CMS</h1>
              <p className="text-blue-200">AI-Driven Computerised Maintenance System</p>
            </div>
          </div>
          
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1635145613344-3e59b1e8afd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMHBsYW50JTIwdHVyYmluZXxlbnwxfHx8fDE3NjE1NTY1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Power Plant"
            className="w-full h-64 object-cover rounded-lg shadow-2xl"
          />
          
          <div className="space-y-4">
            <h2 className="text-2xl text-white">Maintenance Operations</h2>
            <p className="text-blue-200 leading-relaxed">
              Comprehensive asset management, predictive maintenance, and real-time monitoring 
              for industrial equipment. Optimize your operations with AI-powered insights.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Asset Health Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Automated Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to access your dashboard</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@powerplant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-slate-600 mb-3">Demo Accounts - Quick Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickLogin('admin@powerplant.com')}
                className="text-xs"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickLogin('manager@powerplant.com')}
                className="text-xs"
              >
                Manager
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickLogin('technician@powerplant.com')}
                className="text-xs"
              >
                Technician
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickLogin('safety@powerplant.com')}
                className="text-xs"
              >
                Safety Officer
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Click any role to auto-fill credentials
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account? 
              <a href="#" className="text-blue-600 hover:underline">
                Contact Administrator
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
