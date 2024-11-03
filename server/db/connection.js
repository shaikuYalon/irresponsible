import mysql from "mysql2"
const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'warranty_management'
});
export default conection;
