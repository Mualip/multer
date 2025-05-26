var http = require('http');
var url = require('url');
var qs = require('querystring');

var db = require("./db");

var port = 8080

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    
    var id = q.query.id;

    res.setHeader('Content-Type', 'application/json');

    // GET Products - List all products or a single product
    if(q.pathname == "/products" && req.method === "GET"){

        console.log(id);

        if(id === undefined){
            // List products
            let sql = "SELECT * FROM products";

            db.query(sql, (err, result) => {
                if (err) throw err;
                res.end(JSON.stringify(result));
            });

        } else if(id > 0){
            // Get a single product
            let sql = "SELECT * FROM products WHERE id = " + id;

            db.query(sql, (err, result) => {
                if (err) throw err;

                var product = result[0];

                res.end(JSON.stringify(product));
            });

        }
    }
    else if(q.pathname == "/products" && req.method === "POST"){
        var body = '';
    
        req.on('data', function (data) {
            body += data;
    
            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                req.connection.destroy();
        });
    
        req.on('end', function () {
    
            var postData = qs.parse(body);
    
            let name = postData.name;
            let price = postData.price;
            let description = postData.description;  // Pastikan data description diambil dengan benar
    
            let sql = `INSERT INTO products (name, price, description) VALUES ('${name}', '${price}', '${description}')`;
    
            db.query(sql, (err, result) => {
                if (err) throw err;
    
                if(result.affectedRows == 1){
                    res.end(JSON.stringify({message: 'success'}));  
                } else {
                    res.end(JSON.stringify({message: 'gagal'}));  
                }
    
            });
    
        });
    }

    else if (q.pathname == "/referrals" && req.method === "POST") {
        // Add referral
        var body = '';
        req.on('data', (data) => {
            body += data;
            if (body.length > 1e6) req.connection.destroy(); // Cegah terlalu banyak data
        });
        
        req.on('end', () => {
            var postData = qs.parse(body);
            
            // Ambil data dengan validasi
            let referrer_id = postData.referrer_id;
            let referred_id = postData.referred_id;
            let created_at = postData.created_at;
    
            // Validasi untuk memastikan data yang dibutuhkan ada
            if (!referrer_id || !referred_id || !created_at) {
                res.statusCode = 400; // Menetapkan status kode 400 (Bad Request)
                res.end(JSON.stringify({ message: 'Missing required fields', fields: ['referrer_id', 'referred_id', 'created_at'] }));
                return;
            }
    
            // Validasi format tanggal untuk created_at
            let datePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (!datePattern.test(created_at)) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: 'Invalid date format for created_at. Expected format: YYYY-MM-DD HH:MM:SS' }));
                return;
            }
    
            // Query untuk menambahkan data referral dengan parameterized query
            let sql = 'INSERT INTO referrals (referrer_id, referred_id, created_at) VALUES (?, ?, ?)';
            
            db.query(sql, [referrer_id, referred_id, created_at], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    res.statusCode = 500; // Internal server error
                    res.end(JSON.stringify({ message: 'Database error', error: err.message }));
                    return;
                }
    
                if (result.affectedRows === 1) {
                    res.statusCode = 201; // Status kode 201 untuk resource yang berhasil dibuat
                    res.end(JSON.stringify({ message: 'Referral added successfully', referral_id: result.insertId }));
                } else {
                    res.statusCode = 400; // Bad Request jika tidak ada baris yang terpengaruh
                    res.end(JSON.stringify({ message: 'Failed to add referral' }));
                }
            });
                });
    }

    // Penjualan GET and POST
    else if (q.pathname == "/penjualan" && req.method === "GET") {
        // List sales
        let sql = "SELECT * FROM penjualan";
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        });
    } else if (q.pathname == "/penjualan" && req.method === "POST") {
        // Add sale
        var body = '';
        req.on('data', (data) => {
            body += data;
            if (body.length > 1e6) req.connection.destroy(); // Cegah terlalu banyak data
        });
        req.on('end', () => {
            var postData = qs.parse(body);
            let product_id = postData.product_id;
            let quantity = postData.quantity;
            let total_price = postData.total_price;
            let sql = `INSERT INTO penjualan (product_id, kuantitas) VALUES (${product_id}, ${quantity})`;
            db.query(sql, (err, result) => {
                if (err) throw err;
                res.end(JSON.stringify({ message: result.affectedRows === 1 ? 'success' : 'gagal' }));
            });
        });
    }

    // PUT Products - Update product
    else if(q.pathname == "/products" && req.method === "PUT"){
        // Update product
        var body = '';

        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                req.connection.destroy();
        });

        req.on('end', function () {

            var postData = qs.parse(body);

            let name = postData.name;
            let price = postData.price;
            let description = postData.description;  // Added description

            let sql = `UPDATE products SET name = '${name}', price = '${price}', description = '${description}' WHERE id = ${id}`;

            db.query(sql, (err, result) => {
                if (err) throw err;

                if(result.affectedRows == 1){
                    res.end(JSON.stringify({message: 'success'}));  
                } else {
                    res.end(JSON.stringify({message: 'gagal'}));  
                }

            });

        });  
    }

    // DELETE Products - Delete product
    else if(q.pathname == "/products" && req.method === "DELETE"){
        // Delete product    

        let sql = `DELETE FROM products WHERE id = ${id}`;

        db.query(sql, (err, result) => {
            if (err) throw err;

            if(result.affectedRows == 1){
                res.end(JSON.stringify({message: 'success'}));  
            } else {
                res.end(JSON.stringify({message: 'gagal'}));  
            }

        });

    } else {
        res.end();
    }

}).listen(port);

console.log('Server is running on http://localhost:' + port);





var http = require('http');
var url = require('url');
var qs = require('querystring');

var db = require("./db");

var port = 8080;

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    
    var id = q.query.id;

    res.setHeader('Content-Type', 'application/json');

    // GET Products - List all products or a single product
    if(q.pathname == "/products" && req.method === "GET"){
        console.log(id);
        if(id === undefined){
            // List products
            let sql = "SELECT * FROM products";
            db.query(sql, (err, result) => {
                if (err) throw err;
                res.end(JSON.stringify(result));
            });
        } else if(id > 0){
            // Get a single product
            let sql = "SELECT * FROM products WHERE id = " + id;
            db.query(sql, (err, result) => {
                if (err) throw err;
                var product = result[0];
                res.end(JSON.stringify(product));
            });
        }
    }
    // GET referrals - List all referrals or a single referral by ID
if (q.pathname == "/referrals" && req.method === "GET") {
    // Ambil id dari query string (misalnya ?id=123)
    let id = q.query.id; 

    console.log(id);

    if (id === undefined) {
        // Jika id tidak diberikan, tampilkan semua referral
        let sql = "SELECT * FROM referrals";
        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({ message: 'Error fetching referrals' }));
                return;
            }
            res.end(JSON.stringify(result));
        });
    } else if (id > 0) {
        // Jika id diberikan dan valid, ambil referral berdasarkan id
        let sql = "SELECT * FROM referrals WHERE id = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({ message: 'Error fetching referral' }));
                return;
            }

            // Periksa jika data ditemukan
            if (result.length > 0) {
                var referral = result[0];
                res.end(JSON.stringify(referral));
            } else {
                res.end(JSON.stringify({ message: 'Referral not found' }));
            }
        });
    } else {
        res.end(JSON.stringify({ message: 'Invalid ID format' }));
    }
    }

    // POST Product - Add new product
    else if(q.pathname == "/products" && req.method === "POST"){
        var body = '';
    
        req.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            if (body.length > 1e6) req.connection.destroy();
        });
    
        req.on('end', function () {
            var postData = qs.parse(body);
    
            let name = postData.name;
            let price = postData.price;
            let description = postData.description;
    
            let sql = `INSERT INTO products (name, price, description) VALUES ('${name}', '${price}', '${description}')`;
    
            db.query(sql, (err, result) => {
                if (err) throw err;
    
                if(result.affectedRows == 1){
                    res.end(JSON.stringify({message: 'success'}));  
                } else {
                    res.end(JSON.stringify({message: 'gagal'}));  
                }
            });
        });
    }


    
    
    // PUT Product - Update product
    else if(q.pathname == "/products" && req.method === "PUT"){
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on('end', function () {
            var postData = qs.parse(body);

            let name = postData.name;
            let price = postData.price;
            let description = postData.description;

            let sql = `UPDATE products SET name = '${name}', price = '${price}', description = '${description}' WHERE id = ${id}`;
            db.query(sql, (err, result) => {
                if (err) throw err;

                if(result.affectedRows == 1){
                    res.end(JSON.stringify({message: 'success'}));  
                } else {
                    res.end(JSON.stringify({message: 'gagal'}));  
                }
            });
        });  
    }
    // PUT Product - Update product
    else if(q.pathname == "/referrals" && req.method === "PUT"){
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on('end', function () {
            var postData = qs.parse(body);

            let  = postData.name;
            let price = postData.price;
            let description = postData.description;

            let sql = `UPDATE products SET name = '${name}', price = '${price}', description = '${description}' WHERE id = ${id}`;
            db.query(sql, (err, result) => {
                if (err) throw err;

                if(result.affectedRows == 1){
                    res.end(JSON.stringify({message: 'success'}));  
                } else {
                    res.end(JSON.stringify({message: 'gagal'}));  
                }
            });
        });  
    }


    // DELETE Product - Delete product
else if (q.pathname == "/products" && req.method === "DELETE") {
    let sql = `DELETE FROM products WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;

        if (result.affectedRows == 1) {
            res.end(JSON.stringify({ message: 'success' }));
        } else {
            res.end(JSON.stringify({ message: 'gagal' }));
        }
    });
}

// DELETE Referral - Delete referral
else if (q.pathname == "/referrals" && req.method === "DELETE") {
    let id = q.query.id;  // Ambil id dari query string

    if (id === undefined || id <= 0) {
        res.statusCode = 400; // Bad Request
        res.end(JSON.stringify({ message: 'Invalid or missing ID' }));
        return;
    }

    let sql = "DELETE FROM referrals WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.statusCode = 500; // Internal Server Error
            res.end(JSON.stringify({ message: 'Error deleting referral' }));
            return;
        }

        if (result.affectedRows == 1) {
            res.end(JSON.stringify({ message: 'Referral deleted successfully' }));
        } else {
            res.end(JSON.stringify({ message: 'Referral not found' }));
        }
    });
}

    
    
}).listen(port);

console.log('Server is running on http://localhost:' + port);
