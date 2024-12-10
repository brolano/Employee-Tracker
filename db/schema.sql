SELECT 'Database rebuild started...';
DROP DATABASE IF EXISTS temp;
CREATE DATABASE temp;

\c temp;

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'employeeTracker_db'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;

\c employeeTracker_db;

CREATE TABLE Department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE Role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES Department(id) ON DELETE CASCADE
);

CREATE TABLE Employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES Employee(role_id) ON DELETE SET NULL
);