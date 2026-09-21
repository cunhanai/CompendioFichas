import { LoginForm } from '@/features/auth-forms';
import { AuthLayout } from './AuthLayout';

export function LoginPage({ onGoSignup }: { onGoSignup: () => void }) {
  return (
    <AuthLayout>
      <LoginForm onGoSignup={onGoSignup} />
    </AuthLayout>
  );
}
