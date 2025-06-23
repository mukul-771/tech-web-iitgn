'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function UploadTestPage() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/test-firebase');
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testImageUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirebaseUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/test-firebase-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      testImageUpload(file);
    }
  };

  const handleFirebaseTestSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      testFirebaseUpload(file);
    }
  };

  const handleEmergencyUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTestResult('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/emergency-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Emergency upload error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimpleUploadTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTestResult('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/simple-upload-test', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Simple upload test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimpleUploadTestNoDB = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTestResult('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/simple-upload-test-nodb', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Simple upload test (no DB update) error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Upload Test Page</h1>
        <p>Please log in to test upload functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Test & Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">User Session</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Firebase Connection Test</h2>
        <button
          onClick={testFirebaseConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Image Analysis Test</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          This will analyze the image file and test different Sharp configurations to identify the exact issue
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Firebase Upload Test</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFirebaseTestSelect}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          This will test the complete upload pipeline including Firebase Storage
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Diagnostic Tools</h2>
        <div className="space-x-2 mb-2">
          <button
            onClick={() => window.open('/api/admin/sharp-diagnostics', '_blank')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Sharp Diagnostics
          </button>
          <button
            onClick={() => window.open('/api/admin/debug-auth', '_blank')}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Auth Debug
          </button>
          <button
            onClick={() => window.open('/api/admin/test-firebase', '_blank')}
            className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
          >
            Firebase Test
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Click these buttons to open diagnostic endpoints in new tabs
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Emergency Upload (Bypass Sharp)</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleEmergencyUpload}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          This bypasses all image processing and uploads directly to Firebase - use only if regular upload fails
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Simple Upload Test</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleSimpleUploadTest}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          This performs a simple upload test to the server
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Simple Upload Test (No DB Update)</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleSimpleUploadTestNoDB}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          Tests the complete upload pipeline without updating team member database - isolates Firebase Storage issues
        </p>
      </div>

      {testResult && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Test Result</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
}
