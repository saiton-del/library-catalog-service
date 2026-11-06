import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import SearchBar from '../SearchBar.jsx';

afterEach(() => vi.useRealTimers());

describe('SearchBar', () => {
  test('debounces the query callback while the user types', async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search books by title or author' }), {
      target: { value: '  dune  ' },
    });

    await act(async () => { await vi.advanceTimersByTimeAsync(399); });
    expect(onSearch).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('dune');
  });
});
