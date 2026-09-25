import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppToastProvider } from '@/shared/ui/organisms';
import { AppProviders } from './providers';
import { AppRoot } from './AppRoot';

function App() {
  return (
    <BrowserRouter>
      <AppToastProvider>
        <AppProviders>
          <AppRoot />
        </AppProviders>
      </AppToastProvider>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
