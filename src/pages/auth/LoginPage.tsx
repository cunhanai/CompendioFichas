import { LoginForm } from '@/features/auth-forms';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
