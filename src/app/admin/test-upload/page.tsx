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

      const response = await fetch('/api/admin/test-upload', {
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
        <h2 className="text-lg font-semibold mb-2">Image Upload Test</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          This will test image optimization without actually uploading to Firebase
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
