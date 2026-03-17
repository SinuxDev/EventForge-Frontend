'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Github, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type SignInInput = z.infer<typeof signInSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M21.35 11.1H12v2.98h5.35c-.23 1.51-1.36 2.79-2.89 3.64v2.42h4.67c2.73-2.52 4.3-6.23 4.3-10.14 0-.7-.06-1.37-.18-2.01z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.44l-4.67-2.42c-1.3.87-2.95 1.39-4.96 1.39-3.81 0-7.05-2.57-8.2-6.03H.98v2.5A10 10 0 0012 22z"
        fill="#34A853"
      />
      <path d="M3.8 12.5a6.01 6.01 0 010-3V7H.98a10 10 0 000 10l2.82-2.5z" fill="#FBBC05" />
      <path
        d="M12 5.47c1.47 0 2.8.5 3.83 1.49l2.87-2.87C16.97 2.49 14.7 1.5 12 1.5A10 10 0 00.98 7l2.82 2.5c1.15-3.46 4.39-6.03 8.2-6.03z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (!isOpen) {
    return null;
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  const handleCredentialSignIn = async (values: SignInInput) => {
    setErrorMessage(null);

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: '/',
    });

    if (!result?.ok) {
      setErrorMessage('Invalid credentials. Please try again.');
      toast({ title: 'Invalid credentials', variant: 'destructive' });
      return;
    }

    toast({ title: 'Signed in successfully' });
    onClose();
    window.location.reload();
  };

  const handleSignUp = async (values: SignUpInput) => {
    setErrorMessage(null);

    try {
      await apiClient.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        role: 'attendee',
      });

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: '/',
      });

      if (!result?.ok) {
        setErrorMessage('Account created, but auto sign-in failed. Please sign in manually.');
        toast({ title: 'Account created. Please sign in.', variant: 'destructive' });
        switchMode('signin');
        return;
      }

      toast({ title: 'Account created successfully' });
      onClose();
      window.location.reload();
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('email already')) {
        setErrorMessage('Email Already Registered');
        toast({ title: 'Email Already Registered', variant: 'destructive' });
        setMode('signin');
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account');
      toast({ title: 'Unable to create account', variant: 'destructive' });
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setIsSocialLoading(true);
    setErrorMessage(null);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } finally {
      setIsSocialLoading(false);
    }
  };

  const isSignInPending = signInForm.formState.isSubmitting;
  const isSignUpPending = signUpForm.formState.isSubmitting;
  const isActionPending = isSocialLoading || isSignInPending || isSignUpPending;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#11141d] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.58)] sm:min-h-160 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">EventForge</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 p-2 text-white/70 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'signin' ? 'bg-white text-[#10121a]' : 'text-white/70 hover:text-white'
            }`}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'signup' ? 'bg-white text-[#10121a]' : 'text-white/70 hover:text-white'
            }`}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/12" />
          <span className="text-xs text-white/50">with email</span>
          <span className="h-px flex-1 bg-white/12" />
        </div>

        {mode === 'signin' ? (
          <form className="space-y-3.5" onSubmit={signInForm.handleSubmit(handleCredentialSignIn)}>
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signInForm.register('email')}
            />
            {signInForm.formState.errors.email ? (
              <p className="text-xs text-[#ff9ac9]">{signInForm.formState.errors.email.message}</p>
            ) : null}

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signInForm.register('password')}
            />
            {signInForm.formState.errors.password ? (
              <p className="text-xs text-[#ff9ac9]">
                {signInForm.formState.errors.password.message}
              </p>
            ) : null}

            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-[#FF69B4] text-white shadow-[0_10px_24px_rgba(255,105,180,0.34)] hover:-translate-y-0.5 hover:bg-[#ff5ba9]"
              disabled={isActionPending}
            >
              {isSignInPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form className="space-y-3.5" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signUpForm.register('name')}
            />
            {signUpForm.formState.errors.name ? (
              <p className="text-xs text-[#ff9ac9]">{signUpForm.formState.errors.name.message}</p>
            ) : null}

            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signUpForm.register('email')}
            />
            {signUpForm.formState.errors.email ? (
              <p className="text-xs text-[#ff9ac9]">{signUpForm.formState.errors.email.message}</p>
            ) : null}

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signUpForm.register('password')}
            />
            {signUpForm.formState.errors.password ? (
              <p className="text-xs text-[#ff9ac9]">
                {signUpForm.formState.errors.password.message}
              </p>
            ) : null}

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
              {...signUpForm.register('confirmPassword')}
            />
            {signUpForm.formState.errors.confirmPassword ? (
              <p className="text-xs text-[#ff9ac9]">
                {signUpForm.formState.errors.confirmPassword.message}
              </p>
            ) : null}

            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-[#FF69B4] text-white shadow-[0_10px_24px_rgba(255,105,180,0.34)] hover:-translate-y-0.5 hover:bg-[#ff5ba9]"
              disabled={isActionPending}
            >
              {isSignUpPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/12" />
          <span className="text-xs text-white/50">or continue with</span>
          <span className="h-px flex-1 bg-white/12" />
        </div>

        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full cursor-pointer justify-start gap-2.5 border-white/20 bg-white/5 px-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
            onClick={() => handleSocialSignIn('google')}
            disabled={isActionPending}
          >
            <span className="relative z-10 inline-flex items-center gap-2.5">
              <GoogleIcon />
              Continue with Google
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full cursor-pointer justify-start gap-2.5 border-white/20 bg-white/5 px-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
            onClick={() => handleSocialSignIn('github')}
            disabled={isActionPending}
          >
            <span className="relative z-10 inline-flex items-center gap-2.5">
              <Github className="h-4 w-4" />
              Continue with GitHub
            </span>
          </Button>
        </div>

        {errorMessage ? <p className="mt-3 text-xs text-[#ff9ac9]">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
