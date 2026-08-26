CREATE TYPE atm_status AS ENUM('Operational', 'Low-Cash', 'Maintenance', 'Offline');
CREATE TYPE call_priority AS ENUM('Low', 'Medium', 'Critical');
CREATE TYPE call_status AS ENUM('Pending', 'In-Progress', 'Completed', 'Failed');


CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    supervisor_id INTEGER NOT NULL
);

CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id)
);

CREATE TABLE atms (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    model INTEGER NOT NULL,
    status atm_status NOT NULL DEFAULT 'Offline'
    cash_level NUMERIC(5,2) NOT NULL CHECK (cash_level BETWEEN 0 AND 10000),  
    branch_id INTEGER NOT NULL REFERENCES branches(id)
);

CREATE TABLE servicecalls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    priority call_priority NOT NULL DEFAULT 'Low',
    status call_status NOT NULL DEFAULT 'Pending'
    atm_id INTEGER NOT NULL REFERENCES atms(id)
    technician_id INTEGER NOT NULL REFERENCES technicians(id)
);


CREATE TABLE diagnostic_reports (
    id SERIAL PRIMARY KEY,
    call_id INTEGER NOT NULL REFERENCES service_calls(id),
    file_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
