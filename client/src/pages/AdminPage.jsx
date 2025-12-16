import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { userService } from '../services/api';

// Secret admin password - change this to your preferred password
const ADMIN_SECRET_PASSWORD = 'admin123';

function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Account creation form
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    role: 'Staff',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  const fetchAccounts = async () => {
    try {
      const response = await userService.getAll();
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Password salah!');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!newAccount.username || !newAccount.password) {
      setError('Harap lengkapi semua field!');
      setLoading(false);
      return;
    }

    try {
      const response = await userService.create(newAccount);
      if (response.data.success) {
        setNewAccount({ username: '', password: '', role: 'Staff' });
        setSuccessMessage(`Akun "${response.data.data.username}" berhasil dibuat!`);
        await fetchAccounts();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Yakin ingin menghapus akun ini?')) return;
    
    try {
      await userService.delete(id);
      await fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal menghapus akun');
    }
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">🔐 Admin Access</CardTitle>
            <CardDescription className="text-gray-400">
              Masukkan password untuk mengakses halaman admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Masuk
              </Button>
              <Button 
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Kembali ke Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">🔐 Admin Panel</h1>
            <p className="text-sm text-gray-400">Halaman rahasia untuk membuat akun</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 sm:flex-none bg-gray-700 text-white border-gray-600 hover:bg-gray-600 text-xs sm:text-sm px-3 py-2"
            >
              ← Kembali
            </Button>
            <Button 
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="flex-1 sm:flex-none bg-red-600 text-white border-red-500 hover:bg-red-700 text-xs sm:text-sm px-3 py-2"
            >
              Logout Admin
            </Button>
          </div>
        </div>

        {/* Create Account Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Buat Akun Baru</CardTitle>
            <CardDescription className="text-gray-400">
              Buat akun untuk member baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    placeholder="Masukkan username"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={newAccount.role}
                  onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              {successMessage && (
                <p className="text-green-400 text-sm">{successMessage}</p>
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading ? 'Membuat...' : '+ Buat Akun'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Daftar Akun ({accounts.length})</CardTitle>
            <CardDescription className="text-gray-400">
              Akun yang telah dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Belum ada akun yang dibuat</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {accounts.map((account) => (
                  <div 
                    key={account.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg gap-2 sm:gap-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm sm:text-base">{account.username}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          account.role === 'Manager' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {account.role}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">ID: #{account.id}</p>
                    </div>
                    <Button
                      onClick={() => handleDeleteAccount(account.id)}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 w-full sm:w-auto text-sm"
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>⚠️ Halaman ini hanya untuk admin. Jangan bagikan URL ini.</p>
          <p className="mt-1">URL: /secret-admin</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
