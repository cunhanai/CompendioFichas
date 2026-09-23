import { BrowserRouter } from 'react-router-dom';
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
    </BrowserRouter>
  );
}

export default App;
