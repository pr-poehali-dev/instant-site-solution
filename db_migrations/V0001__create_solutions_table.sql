CREATE TABLE IF NOT EXISTS solutions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    steps TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_solutions_created_at ON solutions(created_at DESC);
CREATE INDEX idx_solutions_subject ON solutions(subject);
