
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Code, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Attempting login with:', { email: formData.email, password: '***' });
    console.log('Supabase URL:', supabase.supabaseUrl);

    try {
      // Test connection first
      console.log('Testing Supabase connection...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error types
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          toast({
            title: "Koneksi Error",
            description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Gagal",
            description: "Email atau password salah.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('Login successful, user:', data.user.email);
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang kembali.",
        });
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = "Gagal masuk ke sistem";
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Email atau password salah.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log('Form data updated:', { [name]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Code className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Visual Media X</h2>
            <p className="text-gray-600 mt-2">
              Masuk ke Dashboard Admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Debug info - remove in production */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p>Debug: Supabase URL configured</p>
            <p>Status: {navigator.onLine ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
