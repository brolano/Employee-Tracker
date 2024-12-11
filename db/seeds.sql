INSERT INTO department (name)
VALUES ('Sales'),
       ('Finance'),
       ('Engineering'),
       ('Legal');


INSERT INTO role (title, salary, department_id)
VALUES ('Sales Agent ', 60000, 1),
       ('Sales Lead', 80000, 1),
       ('Accountant', 90000, 2),
       ('Developer', 120000, 3),
       ('Lead Dev', 200000, 3),
       ('Lawyer', 100000, 4),
       ('Lead Lawyer', 150000, 4);



INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Janice', 'Rogers', 1, 2),
       ('Bryce', 'Smith', 2, NULL),
       ('Greg', 'Walters', 3, NULL),
       ('Xian', 'Rodriguez', 4, 5),
       ('Bob', 'Cho', 5, NULL),
       ('Christy', 'Rains', 6, 7),
       ('Stephanie', 'Lawler', 7, NULL);
