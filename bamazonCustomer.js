var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "password",
    database: "bamazondb"
});
//establishing db connection, call the program
connection.connect(function (err) {
    if (err) throw (err);
    runProg();
});

//displays all products in the  and call prompt user fn
function runProg() {
    connection.query("select * from products", {}, function (err, res) {
        if (err) throw (err);
        console.table(res);
        promptUsers();
    })
};

//promtps the user to enter the id stores in "id" , then prompts to enter quantity stores in "qty"
function promptUsers() {
    //prompt for item id
    inquirer.prompt([{
        type: "input",
        name: "id",
        message: "Enter the ID of the item you would like to buy: "
    }]).then(function (response1) {
        var id = response1.id;
        //prompt for qty
        inquirer.prompt([{
            type: "input",
            name: "quantity",
            message: "how many units would you like to buy: "
        }]).then(function (response2) {
            var qty = response2.quantity;
            // query to check quantity available
            var queryForQty = "select stock_quantity,price from products where?";
            connection.query(queryForQty, { item_id: id }, function (err, qtyRes) {
                if (err) throw (err);
                var quantityAvailable = qtyRes[0].stock_quantity;
                var price = qtyRes[0].price;
                console.log("Available Quantity: " + quantityAvailable);
                console.log("qty requested: " + qty);
                console.log("id requested: " + id);
                console.log("price of id requested: " + price);
                // calls customerOrder function to proces the order if quantity available >quantity requested 
                if (quantityAvailable > qty) {
                    customerOrder(id, qty, price);
                }
                else {
                    console.log("Insufficient Quantity!");
                    //end db connection
                    cleanUp();
                }
            });

        });
    });
};

function customerOrder(id, qty, price) {
    console.log("processing Customer Order");
    var itemOrdered = id;
    var quantityOrdered = qty;
    var priceOfItem = price;
    queryUpdateOrder = "update products set stock_quantity=stock_quantity-? where item_id=?";
    connection.query(queryUpdateOrder, [quantityOrdered, itemOrdered], function (err, orderResult) {
        if (err) throw (err);
        console.log(orderResult.message);
        console.log("total amount for " + quantityOrdered + " of " + itemOrdered + " is: " + priceOfItem * quantityOrdered);
        // call to end db connection
        cleanUp();
    });
};

function cleanUp() {
    connection.end();
}
