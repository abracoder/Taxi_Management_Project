const express = require('express');
var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql');
const app = express();
var PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(flash());
app.use(session({
    cookie: { maxAge: 60000 },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}))

// conneccting to mysql database
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "skg1432"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE if not exists mydb", function(err, result) {
        if (err) throw err;
        // console.log("Database created");

    });
    con.query("use mydb");
    var sql = "create table if not exists drivers(id int not null auto_increment,d_name varchar(50) not null,phone bigint, address varchar(100),primary key(id))";
    con.query(sql, function(err, result) {
        if (err) throw err;
        // console.log("Drvier Table created");
    });
    con.query('create table if not exists taxi(id int not null auto_increment,license varchar(20) not null,model varchar(60),driv_id int,car_condition int check(car_condition between 0 and 10),primary key(id),FOREIGN KEY (driv_id) REFERENCES drivers(id))', function(err, result) {
        if (err) throw err;
        // console.log("Taxi table created");
    });
    con.query('create table if not exists expenses(id int not null auto_increment,exp_date date not null,amount int,driv_ID int,descrption varchar(100),primary key(id),FOREIGN KEY (driv_ID) REFERENCES drivers(id))', function(err, result) {
        if (err) throw err;
        // console.log("Expense table created successfully");
    });
    con.query('create table if not exists booking(book_id int not null primary key auto_increment,sorce varchar(100),destintion varchar(100),exp_date date not null,taxi int,clint_id int ,amount int,FOREIGN KEY (taxi) REFERENCES taxi(id))', function(err, result) {
        if (err) throw err;
        // console.log('booking table created');
    });
});

app.get('/', function(req, res) {
    res.render('index');
});
var res1 = [];
var res2 = [];
var res3 = [];
var res4 = [];
var values = [];
var values1 = [];
var values2 = [];
var values3 = [];
app.route('/driver')
    .get(
        function(req, res) {
            con.query("SELECT * FROM drivers", function(err, result, fields) {
                if (err) throw err;
                res1 = result;
                res.render('driver', { result: res1 });
            });
        })
    .post(function(req, res) {
        var name = req.body.fname;
        var phoneno = Number(req.body.phoneno);
        var address = req.body.address;
        values.push([name, phoneno, address]);
        var valins = "insert into drivers (d_name,phone,address) values ?";
        con.query(valins, [values], function(err, result) {
            if (err) throw err;
            res.redirect('/driver');
        })
    });

app.route('/taxi')
    .get(function(req, res) {
        con.query("SELECT * FROM taxi", function(err, result, fields) {
            if (err) throw err;
            res2 = result;
            res.render('taxi', { result: res2 });
        });

    })
    .post(function(req, res) {
        var license = req.body.license;
        var car_condition = Number(req.body.carCondition);
        var modelno = req.body.modelNo;
        var driverId = Number(req.body.driverID);

        values1.push([license, modelno, car_condition, driverId]);
        console.log(values);
        var valins = "insert into taxi(license,model,car_condition,driv_id)values ?";
        con.query(valins, [values1], function(err, result) {
            if (err) throw err;
            console.log("value inserted in taxi");
            res.redirect('/taxi');

        })

    });
app.route('/order')
    .get(function(req, res) {
        con.query("SELECT * FROM booking", function(err, result, fields) {
            if (err) throw err;
            res4 = result;
            res.render('order', { result: res4 });
        });
    })
    .post(function(req, res) {

        var exp_date = req.body.exp_date;
        var amount = Number(req.body.amount);
        var source = req.body.source;
        var clint_id = Number(req.body.clintId);
        var taxi = Number(req.body.taxi);
        var destination = req.body.destination;
        values3.push([taxi, exp_date, source, destination, amount, clint_id]);
        var valins = "insert into booking(taxi,exp_date,sorce,destintion,amount,clint_id) values ?";
        con.query(valins, [values3], function(err, result) {
            if (err) throw err;
            console.log("value inserted in Booking");
            res.redirect('/order');
        })
    });
app.route('/expense')
    .get(function(req, res) {
        con.query("SELECT * FROM expenses", function(err, result, fields) {
            if (err) throw err;
            res3 = result;
            res.render('expense', { result: res3 });
        });
    })
    .post(function(req, res) {
        var exp_date = req.body.exp_date;
        var amount = Number(req.body.amount);
        var description = req.body.description;
        var driverId = Number(req.body.driverID);


        values2.push([exp_date, amount, description, driverId]);
        var valins = "insert into expenses(exp_date,amount,descrption,driv_ID) values ?";
        con.query(valins, [values2], function(err, result) {
            if (err) throw err;
            console.log("value inserted in expenses");
            res.redirect('/expense');

        })

    });

app.post("/delete", function(req, res) {
    var checkedItemId = Number(req.body.checkbox);
    var sql1 = 'delete from drivers where id=?';
    console.log("checked", checkedItemId);
    con.query(sql1, [checkedItemId], function(err, result) {
        if (err) {
            req.flash('error', err);
        };
        console.log("successfully deleted form driver");
        res.redirect('/driver');
    });
});
app.post("/deletetaxi", function(req, res) {
    var checkedItemId = Number(req.body.checkbox);
    var listName = req.body.listName;
    con.query('delete from taxi where id=?', [checkedItemId], function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("successfully deleted from taxi where id =", checkedItemId);
        res.redirect('/taxi');
    });
});
app.post("/deleteexpense", function(req, res) {
    var checkedItemId = Number(req.body.checkbox);
    con.query('delete from expenses where id=?', [checkedItemId], function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("successfully deleted from expense");
        res.redirect('/expense');
    });
});
app.post("/deleteorder", function(req, res) {
    var checkedItemId = Number(req.body.checkbox);
    con.query('delete from booking where book_id=?', [checkedItemId], function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("successfully deleted from booking");
        res.redirect('order');
    });
});
// Editing begins here
app.get('/editdriver/(:id)', function(req, res, next) {

    let id = (req.params.id);

    con.query('SELECT * FROM drivers WHERE id = ' + id, function(err, rows, fields) {
        if (err) {
            req.flash('error', err);
        }
        if (rows.length <= 0) {
            res.redirect('/driver')
        } else {
            console.log(id);
            res.render('editdriver', {
                id: rows[0].id,
                name: rows[0].d_name,
                phone: rows[0].phone,
                address: rows[0].address
            })
        }
    })
});
// 
app.post('/updatedriver/:id', function(req, res, next) {

    let id = req.params.id;
    var name = req.body.fname;
    var ph = Number(req.body.phoneno);
    var address = req.body.address;
    console.log(ph);

    var form_data = {
        d_name: name,
        phone: ph,
        address: address
    };
    console.log(form_data);
    con.query('UPDATE drivers SET ? WHERE id = ' + id, form_data, function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("Driver value successfully updated");
        res.redirect('/driver');
    })
})
app.get('/editexpense/(:id)', function(req, res, next) {
    let id = Number(req.params.id);
    con.query('SELECT * FROM expenses WHERE id = ' + id, function(err, rows, fields) {
        if (err) {
            req.flash('error', err);
        }
        if (rows.length <= 0) {
            res.redirect('/expense')
        } else {
            res.render('editexpense', {
                id: rows[0].id,
                date: rows[0].exp_date,
                driverid: rows[0].driv_ID,
                amount: rows[0].amount,
                description: rows[0].descrption
            })
        }
    })
});
app.post('/updateexpense/:id', function(req, res, next) {

    let id = req.params.id;
    var expdate = req.body.exp_date;
    var driverid = Number(req.body.driverID);
    var amount = Number(req.body.amount);
    var descrption = req.body.description;

    var form_data = {
        exp_date: expdate,
        amount: amount,
        descrption: descrption,
        driv_ID: driverid
    };
    console.log(form_data);
    con.query('UPDATE expenses SET ? WHERE id = ' + id, form_data, function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("expense value successfully updated");
        res.redirect('/expense');
    });
});
//
app.get('/edittaxi/(:id)', function(req, res, next) {
    let id = Number(req.params.id);
    con.query('SELECT * FROM taxi WHERE id = ' + id, function(err, rows, fields) {
        if (err) {
            req.flash('error', err);
        }
        if (rows.length <= 0) {
            res.redirect('/expense')
        } else {
            res.render('edittaxi', {
                id: rows[0].id,
                license: rows[0].license,
                driverid: rows[0].driv_id,
                carcond: rows[0].car_condition,
                model: rows[0].model
            })
        }
    })
});
app.post('/updatetaxi/:id', function(req, res, next) {

    let id = req.params.id;
    var license = req.body.license;
    var driverid = Number(req.body.driverID);
    var carcond = Number(req.body.carCondition);
    var model = req.body.modelNo;

    var form_data = {
        license: license,
        driv_id: driverid,
        car_condition: carcond,
        model: model
    };
    console.log(form_data);
    con.query('UPDATE taxi SET ? WHERE id = ' + id, form_data, function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("taxi value successfully updated");
        res.redirect('/taxi');
    });
});
//
app.get('/editorder/(:id)', function(req, res, next) {

    let id = Number(req.params.id);

    con.query('SELECT * FROM booking WHERE book_id = ' + id, function(err, rows, fields) {
        if (err) {
            req.flash('error', err);
        }
        if (rows.length <= 0) {
            res.redirect('/expense')
        } else {
            res.render('editorder', {
                id: rows[0].book_id,
                date: rows[0].exp_date,
                clintid: rows[0].clint_id,
                taxiid: rows[0].taxi,
                source: rows[0].sorce,
                destination: rows[0].destintion,
                amount: rows[0].amount
            })
        }
    })
});
app.post('/updateorder/:id', function(req, res, next) {

    let id = req.params.id;
    var date = req.body.exp_date;
    var clintid = Number(req.body.clintId);
    var taxiid = Number(req.body.taxi);
    var amount = Number(req.body.amount);
    var source = req.body.source;
    var destination = req.body.destination;

    var form_data = {
        exp_date: date,
        clint_id: clintid,
        taxi: taxiid,
        sorce: source,
        destintion: destination,
        amount: amount
    };
    console.log(form_data);
    con.query('UPDATE booking SET ? WHERE book_id = ' + id, form_data, function(err, result) {
        if (err) {
            req.flash('error', err);
        }
        console.log("order value successfully updated");
        res.redirect('/order');
    });
});
// 
app.listen(PORT, function() {
    console.log("The server has started on port", PORT);
});