import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NavigationProvider } from './NavigationProvider';
import { useNavigation } from './useNavigation';

function Consumer() {
  const { route, goSystems, goProfile } = useNavigation();
  return (
    <div>
      <p>route:{route.name}</p>
      <button onClick={goSystems}>go-systems</button>
      <button onClick={goProfile}>go-profile</button>
    </div>
  );
}

describe('NavigationProvider', () => {
  beforeEach(() => {
    history.replaceState(null, '');
  });

  it('pushes a history entry per navigation so the browser back/forward buttons walk through them', async () => {
    render(
      <NavigationProvider>
        <Consumer />
      </NavigationProvider>,
    );
    expect(screen.getByText('route:dashboard')).toBeInTheDocument();

    fireEvent.click(screen.getByText('go-systems'));
    expect(screen.getByText('route:systems')).toBeInTheDocument();

    fireEvent.click(screen.getByText('go-profile'));
    expect(screen.getByText('route:profile')).toBeInTheDocument();

    await act(async () => {
      history.back();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.getByText('route:systems')).toBeInTheDocument();

    await act(async () => {
      history.back();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.getByText('route:dashboard')).toBeInTheDocument();

    await act(async () => {
      history.forward();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.getByText('route:systems')).toBeInTheDocument();
  });
});
