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



    else if (q.pathname == "/users" && req.method === "GET") {
        let id = parseInt(q.query.id);
        let sql = id ? "SELECT id, username, email FROM users WHERE id = ?" : "SELECT id, username, email FROM users";
        let params = id ? [id] : [];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ message: "Database error" }));
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
        });
    }
    else if (q.pathname == "/users" && req.method === "POST") {
        let body = '';
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
            let data = JSON.parse(body);
            let { username, email, password } = data;
    
            if (!username || !email || !password) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ message: "Missing fields" }));
            }
    
            let sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            db.query(sql, [username, email, password], (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ message: "Database error" }));
                }
                res.end(JSON.stringify({ message: "User added", id: result.insertId }));
            });
        });
    }
    else if (q.pathname == "/users" && req.method === "PUT") {
        let id = parseInt(q.query.id);
        if (!id || id <= 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid ID" }));
        }
    
        let body = '';
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
            let data = JSON.parse(body);
            let { username, email, password } = data;
    
            if (!username || !email || !password) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ message: "Missing fields" }));
            }
    
            let sql = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
            db.query(sql, [username, email, password, id], (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ message: "Database error" }));
                }
    
                if (result.affectedRows == 1) {
                    res.end(JSON.stringify({ message: "User updated successfully" }));
                } else {
                    res.end(JSON.stringify({ message: "User not found" }));
                }
            });
        });
    }
    else if (q.pathname == "/users" && req.method === "DELETE") {
        let id = parseInt(q.query.id);
        if (!id || id <= 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid ID" }));
        }
    
        let sql = "DELETE FROM users WHERE id = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ message: "Database error" }));
            }
    
            if (result.affectedRows == 1) {
                res.end(JSON.stringify({ message: "User deleted successfully" }));
            } else {
                res.end(JSON.stringify({ message: "User not found" }));
            }
        });
    }
                

    // GET referrals - List all referrals or a single referral by ID
if (q.pathname == "/sales" && req.method === "GET") {
    // Ambil id dari query string (misalnya ?id=123)
    let id = q.query.id; 

    console.log(id);

    if (id === undefined) {
        // Jika id tidak diberikan, tampilkan semua referral
        let sql = "SELECT * FROM sales";
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
        let sql = "SELECT * FROM sales WHERE id = ?";
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


     // POST referrals - Add new product
else if(q.pathname == "/referrals" && req.method === "POST"){
    var body = '';

    req.on('data', function (data) {
        body += data;
        // Too much POST data, kill the connection!
        if (body.length > 1e6) req.connection.destroy();
    });

    req.on('end', function () {
        var postData = qs.parse(body);

        let referrer_id = postData.referrer_id;
        let referred_id = postData.referred_id;
        let created_at = postData.created_at;

        // Pastikan created_at menggunakan format YYYY-MM-DD, misalnya "2025-01-10"
        if (!/^\d{4}-\d{2}-\d{2}$/.test(created_at)) {
            res.end(JSON.stringify({ message: 'Invalid date format for created_at. Expected format: YYYY-MM-DD' }));
            return;
        }

        // Perbaiki SQL query
        let sql = `INSERT INTO referrals (referrer_id, referred_id, created_at) VALUES ('${referrer_id}', '${referred_id}', '${created_at}')`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({ message: 'Error inserting data' }));
                return;
            }

            if(result.affectedRows == 1){
                res.end(JSON.stringify({ message: 'success' }));  
            } else {
                res.end(JSON.stringify({ message: 'gagal' }));  
            }
        });
        });
    }

    
     // POST Sales - Add new sale
else if (q.pathname == "/sales" && req.method === "POST") {
    var body = '';

    req.on('data', function (data) {
        body += data;
        // Too much POST data, kill the connection!
        if (body.length > 1e6) req.connection.destroy();
    });

    req.on('end', function () {
        var postData = qs.parse(body);

        let users_id = postData.users_id;
        let product_id = postData.product_id;   // Mengambil nilai dari postData
        let quantity = postData.quantity;       // Mengambil nilai dari postData
        let original_price = postData.original_price; // Mengambil nilai dari postData
        let discount = postData.discount;       // Mengambil nilai dari postData
        let created_at = postData.created_at;   // Mengambil nilai created_at

        // Pastikan created_at menggunakan format YYYY-MM-DD
        if (created_at && !/^\d{4}-\d{2}-\d{2}$/.test(created_at)) {
            res.end(JSON.stringify({ message: 'Invalid date format for created_at. Expected format: YYYY-MM-DD' }));
            return;
        }

        // Perbaiki SQL query
        let sql = `INSERT INTO sales (users_id, product_id, quantity, original_price, discount, created_at) 
                   VALUES ('${users_id}', '${product_id}', '${quantity}', '${original_price}', '${discount}', '${created_at ? created_at : 'CURRENT_DATE'}')`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({ message: 'Error inserting data', error: err.message }));
                return;
            }

            if(result.affectedRows == 1){
                res.end(JSON.stringify({ message: 'success' }));  
            } else {
                res.end(JSON.stringify({ message: 'gagal' }));  
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

   // PUT Referral - Update referral
else if (q.pathname == "/referrals" && req.method === "PUT") {
    var body = '';
    
    req.on('data', function (data) {
        body += data;
        if (body.length > 1e6) req.connection.destroy(); // prevent too much data
    });

    req.on('end', function () {
        var postData = qs.parse(body);

        let id = q.query.id;  // Ambil id dari query string atau URL parameter
        let referrer_id = postData.referrer_id;
        let referred_id = postData.referred_id;
        let created_at = postData.created_at;

        // Validasi ID
        if (!id || id <= 0) {
            res.statusCode = 400; // Bad Request
            return res.end(JSON.stringify({ message: 'Invalid or missing ID' }));
        }

        // Validasi format created_at (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(created_at)) {
            res.statusCode = 400; // Bad Request
            return res.end(JSON.stringify({ message: 'Invalid date format for created_at. Expected format: YYYY-MM-DD' }));
        }

        // SQL query untuk UPDATE
        let sql = "UPDATE referrals SET referrer_id = ?, referred_id = ?, created_at = ? WHERE id = ?";
        db.query(sql, [referrer_id, referred_id, created_at, id], (err, result) => {
            if (err) {
                // Log error untuk lebih detail
                console.error("Error during database update:", err.message);
                res.statusCode = 500; // Internal Server Error
                return res.end(JSON.stringify({ message: 'Error updating referral', error: err.message }));
            }

            // Jika ada baris yang diperbarui
            if (result.affectedRows === 1) {
                res.end(JSON.stringify({ message: 'success' }));
            } else {
                res.end(JSON.stringify({ message: 'Referral not found or no change made' }));
            }
        });
        });  
    }

    // PUT Sale - Update sale
else if (q.pathname == "/sales" && req.method === "PUT") {
    var body = '';

    req.on('data', function (data) {
        body += data;
        if (body.length > 1e6) req.connection.destroy(); // Prevent too much data
    });

    req.on('end', function () {
        var postData = qs.parse(body);

        let id = q.query.id;  // Ambil id dari query string atau URL parameter
        let product_id = postData.product_id;
        let quantity = postData.quantity;
        let original_price = postData.original_price;
        let discount = postData.discount;

        // Validasi ID
        if (!id || id <= 0) {
            res.statusCode = 400; // Bad Request
            return res.end(JSON.stringify({ message: 'Invalid or missing ID' }));
        }

        // SQL query untuk UPDATE
        let sql = "UPDATE sales SET product_id = ?, quantity = ?, original_price = ?, discount = ? WHERE id = ?";
        db.query(sql, [product_id, quantity, original_price, discount, id], (err, result) => {
            if (err) {
                // Log error untuk lebih detail
                console.error("Error during database update:", err.message);
                res.statusCode = 500; // Internal Server Error
                return res.end(JSON.stringify({ message: 'Error updating sale', error: err.message }));
            }

            // Jika ada baris yang diperbarui
            if (result.affectedRows === 1) {
                res.end(JSON.stringify({ message: 'Sale updated successfully' }));
            } else {
                res.end(JSON.stringify({ message: 'Sale not found or no change made' }));
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

// DELETE Sale - Delete sale
else if (q.pathname == "/sales" && req.method === "DELETE") {
    let id = q.query.id;  // Ambil id dari query string

    if (id === undefined || id <= 0) {
        res.statusCode = 400; // Bad Request
        res.end(JSON.stringify({ message: 'Invalid or missing ID' }));
        return;
    }

    // SQL query untuk menghapus data sale berdasarkan ID
    let sql = "DELETE FROM sales WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.statusCode = 500; // Internal Server Error
            res.end(JSON.stringify({ message: 'Error deleting sale' }));
            return;
        }

        // Jika affectedRows == 1 berarti data berhasil dihapus
        if (result.affectedRows == 1) {
            res.end(JSON.stringify({ message: 'Succes' }));
        } else {
            // Jika tidak ada data yang dihapus, berarti ID tidak ditemukan
            res.end(JSON.stringify({ message: 'Sale not found' }));
        }
    });
}
}).listen(port);

console.log('Server is running on http://localhost:' + port);
