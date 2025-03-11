'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Box, CircularProgress, Button } from '@mui/material';
import { supabase } from '@/utils/supabase-client';
import Navbar from '@/components/Navbar';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyEmail = async () => {
      // If status is check-email, show the check email message
      if (status === 'check-email') {
        setVerifying(false);
        return;
      }

      try {
        // Check if the user is already authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is authenticated, verification was successful
          console.log('User is authenticated:', user.email);
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        // If not authenticated, try to get token from URL
        console.log('Full URL:', window.location.href);
        let token = searchParams.get('token');
        
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          token = hashParams.get('access_token');
          console.log('Hash params:', Object.fromEntries(hashParams));
        }

        console.log('Verification token:', token ? 'Found' : 'Not found');

        if (!token) {
          // No token but also no user - this is an error
          setError('Please try logging in with your email and password');
          setVerifying(false);
          return;
        }

        // Try to verify with the token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token,
          type: 'signup',
          email: '' // The email is encoded in the token
        });

        if (verifyError) {
          throw verifyError;
        }

        // Wait a moment before redirecting
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (err) {
        console.error('Error verifying email:', err);
        if (err instanceof Error) {
          if (err.message.includes('expired')) {
            setError('Verification link has expired. Please request a new one.');
          } else {
            setError(`Please try logging in with your email and password`);
          }
        } else {
          setError('Please try logging in with your email and password');
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [router, searchParams, status]);

  return (
    <>
      <Navbar />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            {status === 'check-email' ? (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Check Your Email
                </Typography>
                <Typography>
                  We&apos;ve sent you an email with a verification link. Please check your inbox and click the link to verify your email address.
                </Typography>
                <Typography sx={{ mt: 2 }} color="text.secondary">
                  If you don&apos;t see the email, please check your spam folder.
                </Typography>
              </>
            ) : verifying ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Verifying your email...</Typography>
              </>
            ) : error ? (
              <>
                <Typography variant="h6" color="error" gutterBottom>
                  Verification Status
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push('/auth/login')}
                >
                  Go to Login
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Email Verified Successfully!
                </Typography>
                <Typography>
                  Redirecting you to the home page...
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
} 