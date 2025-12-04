
CREATE DATABASE IF NOT EXISTS library_db_1;
USE library_db_1;

CREATE TABLE publishers (
    publisher_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20) ,
    email VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    birth_date DATE,
    nationality VARCHAR(100),
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE genres (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    membership_start_date DATE NOT NULL,
    membership_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;
CREATE TABLE admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    national_id int CHECK (national_id = 16),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;
CREATE TABLE super_admins (
    super_admin_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    national_id int CHECK (national_id = 16),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- (depends on publishers)
CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    publication_date DATE,
    edition VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    page_count INT,
    description TEXT,
    image_uri VARCHAR(500),
    publisher_id INT,
	total_copies INT DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT DEFAULT 1 CHECK (available_copies >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id) ON DELETE SET NULL ON UPDATE CASCADE
) ;

-- (Many-to-Many: depends on books and genres)
CREATE TABLE book_genres (
    book_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
) ;

-- (Many-to-Many: depends on books and authors)
CREATE TABLE book_authors (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE CASCADE  ON UPDATE CASCADE
)  ;

-- (depends on books and members)
-- incase we added the functionality
CREATE TABLE borrowings (
    borrowing_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('Borrowed', 'Returned', 'Overdue', 'Lost') DEFAULT 'Borrowed',
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE RESTRICT,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE RESTRICT
) ;


-- ============================================================================
-- SAMPLE DATA INSERTION by chatgpt
-- ============================================================================

-- Insert Publishers
INSERT INTO publishers (name, address, phone, email, website) VALUES
('Penguin Random House', '1745 Broadway, New York, NY 10019, USA', '+1-212-782-9000', 'contact@penguinrandomhouse.com', 'https://www.penguinrandomhouse.com'),
('HarperCollins Publishers', '195 Broadway, New York, NY 10007, USA', '+1-212-207-7000', 'info@harpercollins.com', 'https://www.harpercollins.com'),
('Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020, USA', '+1-212-698-7000', 'contact@simonandschuster.com', 'https://www.simonandschuster.com'),
('Macmillan Publishers', '120 Broadway, New York, NY 10271, USA', '+1-646-307-5151', 'info@macmillan.com', 'https://www.macmillan.com'),
('Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104, USA', '+1-212-364-1100', 'contact@hachettebookgroup.com', 'https://www.hachettebookgroup.com');

-- Insert Authors
INSERT INTO authors (first_name, last_name, middle_name, birth_date, nationality, biography) VALUES
('George', 'Orwell', NULL, '1903-06-25', 'British', 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is characterised by lucid prose, biting social criticism, and opposition to totalitarianism.'),
('Jane', 'Austen', NULL, '1775-12-16', 'British', 'Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.'),
('Isaac', 'Asimov', NULL, '1920-01-02', 'American', 'Isaac Asimov was an American writer and professor of biochemistry at Boston University. He was known for his works of science fiction and popular science.'),
('J.K.', 'Rowling', NULL, '1965-07-31', 'British', 'Joanne Rowling, better known by her pen name J.K. Rowling, is a British author and philanthropist. She is best known for writing the Harry Potter fantasy series.'),
('Stephen', 'King', NULL, '1947-09-21', 'American', 'Stephen Edwin King is an American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.'),
('Agatha', 'Christie', NULL, '1890-09-15', 'British', 'Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections.'),
('Ernest', 'Hemingway', NULL, '1899-07-21', 'American', 'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style had a strong influence on 20th-century fiction.'),
('F. Scott', 'Fitzgerald', NULL, '1896-09-24', 'American', 'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age.'),
('Toni', 'Morrison', NULL, '1931-02-18', 'American', 'Chloe Anthony Wofford Morrison, known as Toni Morrison, was an American novelist, essayist, book editor, and college professor.'),
('Gabriel', 'García Márquez', NULL, '1927-03-06', 'Colombian', 'Gabriel José de la Concordia García Márquez was a Colombian novelist, short-story writer, screenwriter, and journalist, known affectionately as Gabo throughout Latin America.');

-- Insert Genres
INSERT INTO genres (name, description) VALUES
('Fiction', 'Imaginative or invented stories, not necessarily based on real events'),
('Non-Fiction', 'Factual and informative content based on real events and facts'),
('Science Fiction', 'Speculative fiction with scientific elements, futuristic settings, and advanced technology'),
('Mystery', 'Stories involving crime, investigation, and solving puzzles'),
('Romance', 'Stories focused on romantic relationships and emotional connections'),
('Biography', 'Accounts of people''s lives written by others'),
('History', 'Historical accounts, analysis, and narratives of past events'),
('Technology', 'Books about technology, computing, and digital innovation'),
('Horror', 'Stories designed to frighten, scare, or startle readers'),
('Fantasy', 'Fiction set in imaginary worlds with magical elements'),
('Literary Fiction', 'Fiction that emphasizes character development and literary merit'),
('Thriller', 'Fast-paced stories with suspense, tension, and excitement');

-- Insert Members
-- Didn't create members incase that conflicted with any password requirements 

-- Insert Books
INSERT INTO books (isbn, title, publication_date, edition, language, page_count, description, image_uri, publisher_id, total_copies, available_copies) VALUES
('978-0-452-28423-4', '1984', '1949-06-08', '1st Edition', 'English', 328, 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', 'https://i.pinimg.com/originals/c5/94/49/c59449aaffccfdcba684cee512339cd0.jpg', 1, 5, 3),
('978-0-14-143951-8', 'Pride and Prejudice', '1813-01-28', 'Modern Edition', 'English', 432, 'A romantic novel of manners that follows the character development of Elizabeth Bennet.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1664450095i/62821812.jpg', 1, 3, 2),
('978-0-553-29337-5', 'Foundation', '1951-05-01', '1st Edition', 'English', 255, 'The first novel in Isaac Asimov''s acclaimed Foundation series, a science fiction epic.', 'https://strangerthansf.com/scans/asimov-foundation.jpg', 2, 4, 4),
('978-0-439-02348-1', 'Harry Potter and the Philosopher''s Stone', '1997-06-26', '1st Edition', 'English', 223, 'The first novel in the Harry Potter series, following a young wizard and his friends.', 'https://media.harrypotterfanzone.com/philosophers-stone-adult-edition.jpg', 3, 6, 2),
('978-0-385-12167-5', 'The Shining', '1977-01-28', '1st Edition', 'English', 447, 'A horror novel about a writer who becomes the winter caretaker of an isolated hotel.', 'https://images1.the-dots.com/v1/952815.jpg?p=projectImageFullJpg', 2, 4, 1),
('978-0-06-112008-4', 'Murder on the Orient Express', '1934-01-01', 'Reprint', 'English', 288, 'A detective novel featuring Hercule Poirot investigating a murder on a train.', 'https://m.media-amazon.com/images/I/81tlk1inIhL._SL1500_.jpg', 2, 3, 3),
('978-0-684-80145-3', 'The Old Man and the Sea', '1952-09-01', '1st Edition', 'English', 127, 'A short novel about an aging Cuban fisherman and his struggle with a giant marlin.', 'https://hachette.imgix.net/books/9781472121134.jpg?auto=compress,format', 4, 5, 4),
('978-0-7432-7356-5', 'The Great Gatsby', '1925-04-10', 'Modern Edition', 'English', 180, 'A classic American novel about the Jazz Age and the American Dream.', 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781949846386/the-great-gatsby-large-print-9781949846386_hr.jpg', 3, 4, 2),
('978-1-4000-3341-4', 'Beloved', '1987-09-02', '1st Edition', 'English', 324, 'A novel about a former slave and her family dealing with the trauma of slavery.', 'https://cdn2.penguin.com.au/covers/original/9780099760115.jpg', 1, 3, 3),
('978-0-06-088328-7', 'One Hundred Years of Solitude', '1967-05-30', 'English Translation', 'English', 417, 'A multi-generational saga of the Buendía family in the fictional town of Macondo.', 'https://dwcp78yw3i6ob.cloudfront.net/wp-content/uploads/2016/12/12162813/100_Years_First_Ed_Hi_Res-768x1153.jpg', 2, 4, 4);

-- Link Books to Authors (Many-to-Many)
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), -- 1984 by George Orwell
(2, 2), -- Pride and Prejudice by Jane Austen
(3, 3), -- Foundation by Isaac Asimov
(4, 4), -- Harry Potter by J.K. Rowling
(5, 5), -- The Shining by Stephen King
(6, 6), -- Murder on the Orient Express by Agatha Christie
(7, 7), -- The Old Man and the Sea by Ernest Hemingway
(8, 8), -- The Great Gatsby by F. Scott Fitzgerald
(9, 9), -- Beloved by Toni Morrison
(10, 10); -- One Hundred Years of Solitude by Gabriel García Márquez

-- Link Books to Genres (Many-to-Many)
INSERT INTO book_genres (book_id, genre_id) VALUES
(1, 1), (1, 3), -- 1984: Fiction, Science Fiction
(2, 1), (2, 5), -- Pride and Prejudice: Fiction, Romance
(3, 1), (3, 3), -- Foundation: Fiction, Science Fiction
(4, 1), (4, 10), -- Harry Potter: Fiction, Fantasy
(5, 1), (5, 9), -- The Shining: Fiction, Horror
(6, 1), (6, 4), (6, 12), -- Murder on the Orient Express: Fiction, Mystery, Thriller
(7, 1), (7, 11), -- The Old Man and the Sea: Fiction, Literary Fiction
(8, 1), (8, 11), -- The Great Gatsby: Fiction, Literary Fiction
(9, 1), (9, 11), -- Beloved: Fiction, Literary Fiction
(10, 1), (10, 11); -- One Hundred Years of Solitude: Fiction, Literary Fiction



select * from books;