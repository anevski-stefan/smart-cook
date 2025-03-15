'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Box, CircularProgress, Button } from '@mui/material';
import { supabase } from '@/utils/supabase-client';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';

export default function VerifyEmail() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const status = params?.get('status') ?? null;

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
        const token = params?.get('token') ?? null;
        
        let finalToken = token;
        if (!finalToken && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          finalToken = hashParams.get('access_token');
          console.log('Hash params:', Object.fromEntries(hashParams));
        }

        console.log('Verification token:', finalToken ? 'Found' : 'Not found');

        if (!finalToken) {
          // No token but also no user - this is an error
          setError(t('auth.verifyEmail.errors.generic'));
          setVerifying(false);
          return;
        }

        // Try to verify with the token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token: finalToken,
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
            setError(t('auth.verifyEmail.errors.expired'));
          } else {
            setError(t('auth.verifyEmail.errors.generic'));
          }
        } else {
          setError(t('auth.verifyEmail.errors.generic'));
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [router, params, status, t]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Container maxWidth="sm" sx={{ flex: 1 }}>
        <Box sx={{ mt: 8, mb: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            {status === 'check-email' ? (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  {t('auth.verifyEmail.title')}
                </Typography>
                <Typography>
                  {t('auth.verifyEmail.description')}
                </Typography>
                <Typography sx={{ mt: 2 }} color="text.secondary">
                  {t('auth.verifyEmail.spamNote')}
                </Typography>
              </>
            ) : verifying ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>{t('auth.verifyEmail.verifying')}</Typography>
              </>
            ) : error ? (
              <>
                <Typography variant="h6" color="error" gutterBottom>
                  {t('auth.verifyEmail.status')}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(t('auth.routes.login'))}
                >
                  {t('auth.verifyEmail.goToLogin')}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  {t('auth.verifyEmail.success')}
                </Typography>
                <Typography>
                  {t('auth.verifyEmail.redirecting')}
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
} 