import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRoot } from './AppRoot';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoot />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
