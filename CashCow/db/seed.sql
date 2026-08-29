--\i seed.sql

INSERT INTO branches(id, name, location_region, capacity, supervisor_id) VALUES
    (1, 'Citi Miami Hub', 'US-South', 40, 101),
    (2, 'Citi Tampa Hub', 'US-West',25,102),
    (3, 'Citi Daytona Hub', 'US-North', 15, 103),
    (4, 'Citi Orlando Hub', 'US-East',85,104);

INSERT INTO technicians(id, name, branch_id) VALUES
    (201, 'J. Alvarez', 1),
    (202, 'M. Chen', 1);

INSERT INTO atms(id, serial_number, model, status, cash_level, branch_id) VALUES
    (1, 'ATM-1001', 'DN-Series-100D', 'Operational',1800.5,1),
    (2, 'ATM-1002', 'DN-Series-200D', 'Low-Cash',7600.0, 1),
    (3, 'ATM-2050', 'SelfServ-81', 'Offline', 900.0, 2),
    (4, 'ATM-1003', 'DN-Series-300D', 'Maintenance', 420.0, 2),
    (5, 'ATM-1004', 'DN-Series-100D', 'Operational',180.5,3),
    (6, 'ATM-1005', 'SelfServ-88', 'Offline',7006.0, 3),
    (7, 'ATM-2060', 'SelfServ-82', 'Low-Cash', 919.0, 4),
    (8, 'ATM-1006', 'SelfServ-84', 'Maintenance', 4122.0, 4);

INSERT INTO servicecalls(id, title, priority, status, atm_id, technician_id) VALUES
    (1, 'Pipeline Corrosion Sweep', 'Critical', 'Pending', 1, 201),
    (2, 'Warehouse Perimeter Patrol', 'Low', 'Completed', 3, 202);

INSERT INTO diagnostic_reports(call_id, file_url, notes) VALUES
    (1, 's3://robopulse-diagnostics/rx1001-001.pdf', 'Vibration sensor reading normal');


SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches));
SELECT setval('technicians_id_seq', (SELECT MAX(id) FROM technicians));
SELECT setval('atms_id_seq', (SELECT MAX(id) FROM atms));
SELECT setval('servicecalls_id_seq', (SELECT MAX(id) FROM servicecalls));