import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { healthCheck } from '../services/api';

function TestPage() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthCheck();
      setApiStatus(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Backend Health Check</CardTitle>
          <CardDescription>Test the connection to your Node.js backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? 'Testing...' : 'Test API Connection'}
          </Button>

          {apiStatus && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Connected Successfully!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Status: {apiStatus.status}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Time: {new Date(apiStatus.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                ❌ Connection Failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TestPage;
