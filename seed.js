require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Genre = require('./models/Genre');
const User = require('./models/User');

const librarianAccount = {
  username: 'librarian',
  email: 'librarian@example.com',
  password: 'LibraryAdmin123!',
  role: 'librarian',
};

const genres = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Historical Fiction', slug: 'historical-fiction' },
];

const books = [
  {
    title: 'The Glass Orchard',
    author: 'Mara Ellison',
    description: 'A botanist discovers a hidden garden that remembers every future that might have been.',
    genre: 'Science Fiction',
    totalCopies: 8,
    availableCopies: 6,
  },
  {
    title: 'Orbit of Ashes',
    author: 'Jonah Vale',
    description: 'A salvage crew follows a fading signal to a station abandoned at the edge of mapped space.',
    genre: 'Science Fiction',
    totalCopies: 5,
    availableCopies: 2,
  },
  {
    title: 'The Quiet Machine',
    author: 'Inez Calder',
    description: 'In a city run by predictive machines, one archivist finds a record the system cannot explain.',
    genre: 'Science Fiction',
    totalCopies: 7,
    availableCopies: 7,
  },
  {
    title: 'Tides of Europa',
    author: 'Theo March',
    description: 'Researchers beneath an icy moon must decide whether the ocean below is sending them a reply.',
    genre: 'Science Fiction',
    totalCopies: 4,
    availableCopies: 3,
  },
  {
    title: 'A Map of Emberfall',
    author: 'Liora Fen',
    description: 'A reluctant cartographer charts a kingdom whose roads rearrange themselves after sunset.',
    genre: 'Fantasy',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: 'The Moonkeeper’s Debt',
    author: 'Arden Sol',
    description: 'A village apprentice inherits an ancient promise tied to the changing phases of the moon.',
    genre: 'Fantasy',
    totalCopies: 9,
    availableCopies: 9,
  },
  {
    title: 'Beneath the Thorn Crown',
    author: 'Nessa Rowan',
    description: 'Two rival heirs join forces to uncover the truth behind a crown that chooses no ruler.',
    genre: 'Fantasy',
    totalCopies: 5,
    availableCopies: 1,
  },
  {
    title: 'The Lanterns of Vey',
    author: 'P. R. Ashcombe',
    description: 'A traveling lantern maker carries a forgotten spell into a town that has lost its stars.',
    genre: 'Fantasy',
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    title: 'The Last Train to Bellweather',
    author: 'Clara Wren',
    description: 'A stationmaster investigates a passenger who appears on a train that never arrived.',
    genre: 'Mystery',
    totalCopies: 7,
    availableCopies: 5,
  },
  {
    title: 'A Study in Blue Glass',
    author: 'Elias North',
    description: 'A conservator pieces together a decades-old disappearance from clues hidden in stained glass.',
    genre: 'Mystery',
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: 'The Orchard Lane Alibi',
    author: 'Mina Harlow',
    description: 'When a rare book vanishes, a small-town librarian finds every suspect has a convincing story.',
    genre: 'Mystery',
    totalCopies: 4,
    availableCopies: 0,
  },
  {
    title: 'Fog Over Red Harbor',
    author: 'Graham Pike',
    description: 'A detective returns to his coastal hometown to solve a case that was closed before it began.',
    genre: 'Mystery',
    totalCopies: 8,
    availableCopies: 5,
  },
  {
    title: 'The Cartographer’s Daughter',
    author: 'Amelie Laurent',
    description: 'In 18th-century France, a young mapmaker charts a journey that could change her family’s fortunes.',
    genre: 'Historical Fiction',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: 'Letters from the Amber Coast',
    author: 'Samuel Reed',
    description: 'A series of letters reveals the lives of a lighthouse keeper and a sailor during wartime.',
    genre: 'Historical Fiction',
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: 'The Clockmaker of Prague',
    author: 'Eva Moravec',
    description: 'A clockmaker and his apprentice become entangled in the political unrest of 1848 Prague.',
    genre: 'Historical Fiction',
    totalCopies: 7,
    availableCopies: 3,
  },
  {
    title: 'Winter at the Silk House',
    author: 'Nadia Bell',
    description: 'Three generations of a family navigate change and renewal in a 1920s textile town.',
    genre: 'Historical Fiction',
    totalCopies: 4,
    availableCopies: 2,
  },
];

function createIsbn13(sequence) {
  const body = `978${String(100000000 + sequence).padStart(9, '0')}`;
  const sum = [...body].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return `${body}${(10 - (sum % 10)) % 10}`;
}

async function seed() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  await mongoose.connect(MONGODB_URI);
  await Book.deleteMany({});
  await Genre.deleteMany({});

  const insertedGenres = await Genre.insertMany(genres);
  const genreIds = new Map(insertedGenres.map((genre) => [genre.name, genre._id]));
  const bookDocuments = books.map((book, index) => ({
    ...book,
    isbn: createIsbn13(index + 1),
    coverImage: `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`,
    genre: genreIds.get(book.genre),
  }));

  if (bookDocuments.some((book) => book.availableCopies > book.totalCopies)) {
    throw new Error('Seed data has availableCopies greater than totalCopies.');
  }

  await Book.insertMany(bookDocuments);

  await User.deleteMany({ role: 'librarian' });
  await User.create(librarianAccount);

  console.log(`Seeded ${insertedGenres.length} genres, ${bookDocuments.length} books, and one librarian account.`);
}

seed()
  .catch((error) => {
    console.error('Catalog seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
