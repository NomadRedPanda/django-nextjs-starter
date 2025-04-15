'use client';
import { useEffect, useState } from 'react'; // Import useState
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/authProvider';

export default function GoogleCallback() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null); // 1. Introduce error state
  const [isLoading, setIsLoading] = useState(true); // Optional: state for loading indicator

  useEffect(() => {
    const handleCallback = async () => {
      setError(null); // Reset error on new attempt
      setIsLoading(true); // Start loading
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        console.error('Missing code or state parameters');
        setError('Authentication failed: Missing required parameters.');
        setIsLoading(false);
        // Avoid immediate redirect here to show the error message
        // router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        let data = {};
        // Try to parse JSON only if the response seems okay and is JSON
        if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // 2. Use the setError state setter for JSON parsing error
            setError('Received an invalid response from the server.');
            setIsLoading(false);
            return; // Stop execution
          }
        } else if (!response.ok) {
          // Handle non-OK responses (might have error details in body)
          let errorMessage = `Login failed with status: ${response.status}.`;
          try {
             // Try reading error message from body even if not JSON
             const textData = await response.text();
             // Attempt to parse as JSON if possible, otherwise use text
             try {
                data = JSON.parse(textData);
                errorMessage = data?.message || textData || errorMessage;
             } catch {
                errorMessage = textData || errorMessage;
             }
          } catch (bodyError) {
             console.error('Error reading error response body:', bodyError);
          }
          // 2. Use the setError state setter
          setError(errorMessage);
          setIsLoading(false);
          return; // Stop execution
        }

        // If response.ok was true and JSON parsing succeeded (or wasn't needed)
        if (response.ok) {
          auth.login(data?.username); // Use optional chaining for safety
          router.push('/'); // Redirect to dashboard on success
          // No need to set loading false here as we are navigating away
        }
        // The 'else' case is now handled by the !response.ok block above

      } catch (networkError) {
        console.error('Error during authentication fetch:', networkError);
        // 2. Use the setError state setter for network/fetch errors
        setError('An error occurred while connecting to the server. Please try again.');
        setIsLoading(false);
        // Avoid immediate redirect here
        // router.push('/login');
      }
    };

    handleCallback();
    // Add auth to dependency array as it's used inside the effect
  }, [searchParams, router, auth]); // Include auth in dependencies

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-md w-full">
        {/* 3. Display loading or error message */}
        {isLoading && !error && (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">Authenticating...</h1>
            <p className="text-gray-600">Please wait while we complete your sign-in.</p>
            {/* You could add a spinner component here */}
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </>
        )}
        {error && (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Failed</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
            >
              Return to Login
            </button>
          </>
        )}
         {/* Optional: Message shown briefly after successful redirect starts */}
         {!isLoading && !error && (
             <>
                <h1 className="text-2xl font-semibold mb-4 text-green-600">Success!</h1>
                <p className="text-gray-600">Redirecting you now...</p>
             </>
         )}
      </div>
    </div>
  );
}
