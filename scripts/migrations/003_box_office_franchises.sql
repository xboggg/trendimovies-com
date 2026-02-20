-- Box Office Weekly Data
CREATE TABLE IF NOT EXISTS box_office_weekly (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    rank INTEGER NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    tmdb_id INTEGER,
    poster_path VARCHAR(255),
    three_day_gross DECIMAL(15, 2),
    four_day_gross DECIMAL(15, 2),
    total_gross DECIMAL(15, 2),
    weeks_in_release INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_start, rank)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_box_office_week ON box_office_weekly(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_box_office_tmdb ON box_office_weekly(tmdb_id);

-- Franchises table
CREATE TABLE IF NOT EXISTS franchises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tmdb_collection_id INTEGER,
    logo_path VARCHAR(255),
    description TEXT,
    total_movies INTEGER DEFAULT 0,
    total_box_office DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Franchise movies junction table
CREATE TABLE IF NOT EXISTS franchise_movies (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    release_date DATE,
    box_office DECIMAL(15, 2),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(franchise_id, tmdb_id)
);

CREATE INDEX IF NOT EXISTS idx_franchise_movies_franchise ON franchise_movies(franchise_id);
CREATE INDEX IF NOT EXISTS idx_franchise_movies_tmdb ON franchise_movies(tmdb_id);

-- Insert initial box office data (Feb 13-16, 2026)
INSERT INTO box_office_weekly (week_start, week_end, rank, movie_title, three_day_gross, four_day_gross, total_gross, weeks_in_release)
VALUES
    ('2026-02-13', '2026-02-16', 1, 'Wuthering Heights', 34800000, 40000000, 40000000, 1),
    ('2026-02-13', '2026-02-16', 2, 'GOAT', 26000000, 32000000, 32000000, 1),
    ('2026-02-13', '2026-02-16', 3, 'Crime 101', 15400000, 17700000, 17700000, 1),
    ('2026-02-13', '2026-02-16', 4, 'Send Help', 8900000, 10700000, 49600000, 3),
    ('2026-02-13', '2026-02-16', 5, 'Solo Mio', 6800000, 8000000, 18500000, 2),
    ('2026-02-13', '2026-02-16', 6, 'Zootopia 2', 3700000, 5000000, 420600000, 9),
    ('2026-02-13', '2026-02-16', 7, 'Good Luck, Have Fun, Don''t Die', 3600000, 4100000, 4100000, 1),
    ('2026-02-13', '2026-02-16', 8, 'Avatar: Fire and Ash', 3300000, 3800000, 396500000, 10),
    ('2026-02-13', '2026-02-16', 9, 'Iron Lung', 3300000, 3700000, 37900000, 4),
    ('2026-02-13', '2026-02-16', 10, 'Dracula', 3000000, 3500000, 9500000, 2)
ON CONFLICT (week_start, rank) DO NOTHING;

-- Insert initial franchises
INSERT INTO franchises (name, slug, description, total_movies)
VALUES
    ('Marvel Cinematic Universe', 'mcu', 'The Marvel Cinematic Universe is an American media franchise centered on superhero films and other series.', 35),
    ('DC Extended Universe', 'dceu', 'The DC Extended Universe is an American media franchise of superhero films and other content.', 15),
    ('Star Wars', 'star-wars', 'Star Wars is an American epic space opera multimedia franchise.', 12),
    ('Harry Potter / Wizarding World', 'wizarding-world', 'The Wizarding World is a fantasy media franchise including the Harry Potter series.', 11),
    ('Fast & Furious', 'fast-furious', 'The Fast & Furious franchise includes street racing action films.', 11),
    ('Jurassic Park / World', 'jurassic', 'The Jurassic franchise features genetically engineered dinosaurs.', 7),
    ('James Bond 007', 'james-bond', 'James Bond is a British secret agent in a series of spy films.', 27),
    ('Mission: Impossible', 'mission-impossible', 'Mission: Impossible follows IMF agent Ethan Hunt on impossible missions.', 8),
    ('Transformers', 'transformers', 'Transformers features sentient alien robots that can transform into vehicles.', 7),
    ('Spider-Man (Sony)', 'spider-man-sony', 'Sony''s Spider-Man films featuring the iconic web-slinger.', 9),
    ('X-Men', 'x-men', 'X-Men films follow mutant superheroes led by Professor X.', 13),
    ('Planet of the Apes', 'planet-apes', 'Planet of the Apes is a science fiction franchise about intelligent apes.', 10),
    ('The Lord of the Rings', 'lotr', 'The Lord of the Rings is a fantasy franchise based on J.R.R. Tolkien''s novels.', 6),
    ('Pirates of the Caribbean', 'pirates-caribbean', 'Pirates of the Caribbean follows Captain Jack Sparrow''s adventures.', 5),
    ('John Wick', 'john-wick', 'John Wick follows a legendary hitman forced back into action.', 4),
    ('The Conjuring Universe', 'conjuring', 'The Conjuring Universe features paranormal investigators Ed and Lorraine Warren.', 9),
    ('Despicable Me / Minions', 'despicable-me', 'Despicable Me follows supervillain Gru and his Minions.', 6),
    ('Shrek', 'shrek', 'Shrek features the adventures of a lovable green ogre.', 5),
    ('Toy Story', 'toy-story', 'Toy Story follows Woody, Buzz, and their toy friends.', 5),
    ('Avatar', 'avatar', 'Avatar explores the world of Pandora and its Na''vi inhabitants.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions for PostgREST
GRANT SELECT ON box_office_weekly TO web_anon;
GRANT SELECT ON franchises TO web_anon;
GRANT SELECT ON franchise_movies TO web_anon;
GRANT ALL ON box_office_weekly TO authenticator;
GRANT ALL ON franchises TO authenticator;
GRANT ALL ON franchise_movies TO authenticator;
