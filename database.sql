CREATE DATABASE todo;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Date DATE 
);

CREATE TABLE Cards (
    card_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    tag VARCHAR(50) NOT NULL DEFAULT 'General',
    Date DATE 
);