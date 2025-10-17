CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  dob DATE,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS followers (
  follower_id INT REFERENCES users(id) ON DELETE CASCADE,
  followee_id INT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, followee_id)
);
