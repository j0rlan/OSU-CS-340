var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 10,
	host			: 'classmysql.engr.oregonstate.edu',
	user			: 'cs340_bethelju',
	password		: '1758', 
	database		: 'cs340_bethelju'
});
module.exports.pool = pool;
