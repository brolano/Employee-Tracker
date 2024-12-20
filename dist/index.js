import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';
async function mainMenu() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit',
            ],
        },
    ]);
    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
    }
    mainMenu();
}
async function viewDepartments() {
    const res = await pool.query('SELECT id AS "Department ID", name AS "Department Name" FROM department');
    console.table(res.rows);
}
async function viewRoles() {
    const res = await pool.query(`
        SELECT role.id AS "Role ID", role.title AS "Job Title", department.name AS "Department", role.salary AS "Salary"
        FROM role
        JOIN department ON role.department_id = department.id
    `);
    console.table(res.rows);
}
async function viewEmployees() {
    const res = await pool.query(`
        SELECT employee.id AS "Employee ID", employee.first_name AS "First Name", employee.last_name AS "Last Name", 
               role.title AS "Job Title", department.name AS "Department", role.salary AS "Salary", 
               CONCAT(manager.first_name, ' ', manager.last_name) AS "Manager"
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `);
    console.table(res.rows);
}
async function addDepartment() {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:',
        },
    ]);
    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added.`);
}
async function addRole() {
    const department = await pool.query('SELECT * FROM department');
    const departmentChoices = department.rows.map((dept) => ({
        name: dept.name,
        value: dept.id,
    }));
    const { title, salary, department_id } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the role title:' },
        { type: 'number', name: 'salary', message: 'Enter the role salary:' },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department:',
            choices: departmentChoices,
        },
    ]);
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
    console.log(`Role "${title}" added.`);
}
async function addEmployee() {
    const role = await pool.query('SELECT * FROM role');
    const roleChoices = role.rows.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const employee = await pool.query('SELECT * FROM employee');
    const managerChoices = employee.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));
    managerChoices.unshift({ name: 'None', value: null });
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        { type: 'input', name: 'first_name', message: 'Enter the first name:' },
        { type: 'input', name: 'last_name', message: 'Enter the last name:' },
        { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Select the manager:',
            choices: managerChoices,
        },
    ]);
    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
    console.log(`Employee "${first_name} ${last_name}" added.`);
}
async function updateEmployeeRole() {
    const employee = await pool.query('SELECT * FROM employee');
    const employeeChoices = employee.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));
    const role = await pool.query('SELECT * FROM role');
    const roleChoices = role.rows.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const { employee_id, role_id } = await inquirer.prompt([
        { type: 'list', name: 'employee_id', message: 'Select the employee:', choices: employeeChoices },
        { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices },
    ]);
    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
    console.log('Employee role updated.');
}
(async function start() {
    try {
        await connectToDb();
        console.log('Connected to the database.');
        mainMenu();
    }
    catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
})();
