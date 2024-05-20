const mysql = require("mysql2");
const conn = mysql.createConnection({
    user:"avnadmin",
    port:22381,
    host: "cmsservice-jayarora312002-b407.l.aivencloud.com",
password: "AVNS_a5rNnk6rA5y8VrLctgp",
database: "defaultdb"
});
conn.connect((err)=>{
if(err) throw err;
console.log("DB connected");
})

module.exports = conn;