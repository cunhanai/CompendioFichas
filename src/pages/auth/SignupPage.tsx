import { SignupForm } from '@/features/auth-forms';
import { AuthLayout } from './AuthLayout';

export function SignupPage({ onGoLogin }: { onGoLogin: () => void }) {
  return (
    <AuthLayout>
      <SignupForm onGoLogin={onGoLogin} />
    </AuthLayout>
  );
}
