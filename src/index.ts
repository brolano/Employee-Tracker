import inquirer from 'inquirer';
import { Client } from 'pg';

const client = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

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
            await client.end();
            process.exit();
    }

    mainMenu();
}

async function viewDepartments() {
    const res = await client.query('SELECT * FROM departments');
    console.table(res.rows);
}

async function viewRoles() {
    const res = await client.query(`
        SELECT roles.id, roles.title, roles.salary, departments.name AS department
        FROM roles
        JOIN departments ON roles.department_id = departments.id
    `);
    console.table(res.rows);
}

async function viewEmployees() {
    const res = await client.query(`
        SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role,
        departments.name AS department, roles.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employees
        JOIN roles ON employees.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees AS manager ON employees.manager_id = manager.id
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
    await client.query('INSERT INTO departments (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added.`);
}

async function addRole() {
    const departments = await client.query('SELECT * FROM departments');
    const departmentChoices = departments.rows.map((dept: any) => ({
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

    await client.query(
        'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
        [title, salary, department_id]
    );
    console.log(`Role "${title}" added.`);
}

async function addEmployee() {
    const roles = await client.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map((role: any) => ({
        name: role.title,
        value: role.id,
    }));

    const employees = await client.query('SELECT * FROM employees');
    const managerChoices = employees.rows.map((emp: any) => ({
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

    await client.query(
        'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [first_name, last_name, role_id, manager_id]
    );
    console.log(`Employee "${first_name} ${last_name}" added.`);
}

async function updateEmployeeRole() {
    const employees = await client.query('SELECT * FROM employees');
    const employeeChoices = employees.rows.map((emp: any) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));

    const roles = await client.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map((role: any) => ({
        name: role.title,
        value: role.id,
    }));

    const { employee_id, role_id } = await inquirer.prompt([
        { type: 'list', name: 'employee_id', message: 'Select the employee:', choices: employeeChoices },
        { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices },
    ]);

    await client.query('UPDATE employees SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
    console.log('Employee role updated.');
}

(async function start() {
    try {
        await client.connect();
        console.log('Connected to the database.');
        mainMenu();
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
})();
