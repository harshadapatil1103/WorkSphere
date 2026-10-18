-- Run this in MySQL Workbench or the mysql command line.
-- It's actually OPTIONAL: application.properties already has
-- createDatabaseIfNotExist=true, so Spring Boot will create the
-- database automatically the first time it runs.
-- Use this file only if you prefer to create it yourself first.

CREATE DATABASE IF NOT EXISTS employee_db;

-- You do NOT need to create the `employees` table yourself.
-- Hibernate (spring.jpa.hibernate.ddl-auto=update) will create it
-- automatically based on the Employee.java class the first time
-- the backend starts.
