const mysql = require("mysql2");
const conn = mysql.createConnection({
    user:"",
    port:,
    host: "",
password: "",
database: ""
});
conn.connect((err)=>{
if(err) throw err;
console.log("DB connected");
})

module.exports = conn;