import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { ReadingListProvider } from '../../context/ReadingListContext.jsx';
import BookCard from '../BookCard.jsx';

const sampleBook = {
  _id: 'book-123',
  title: 'The Glass Orchard',
  author: 'Mara Ellison',
  coverImage: 'https://example.com/cover.jpg',
  genre: { name: 'Science Fiction' },
};

function renderBookCard() {
  return render(
    <MemoryRouter>
      <ReadingListProvider>
        <BookCard book={sampleBook} />
      </ReadingListProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => window.localStorage.clear());

describe('BookCard', () => {
  test('shows the book title, author, genre, cover, and detail link', () => {
    renderBookCard();

    expect(screen.getByRole('heading', { name: 'The Glass Orchard' })).toBeInTheDocument();
    expect(screen.getByText('Mara Ellison')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Cover of The Glass Orchard' })).toHaveAttribute('src', sampleBook.coverImage);
    expect(screen.getByRole('link', { name: 'View The Glass Orchard by Mara Ellison' })).toHaveAttribute('href', '/books/book-123');
  });

  test('toggles the reading-list control when clicked', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    renderBookCard();

    const addButton = screen.getByRole('button', { name: 'Add The Glass Orchard to reading list' });
    await user.click(addButton);
    expect(screen.getByRole('button', { name: 'Remove The Glass Orchard from reading list' })).toHaveAttribute('aria-pressed', 'true');
  });
});
