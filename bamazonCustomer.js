// Required Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require('colors');
const Table = require('cli-table');
let successful = false;

// Connection script
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(colors.cyan("Welcome!" + connection.threadId));
    //Call main function
    showTable()
});

function showTable() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;

        // Cli-Table display code with Color
        const table = new Table(
            {
                head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price".cyan.bold, "Quantity".cyan.bold],
                colWidths: [12, 75, 20, 12, 12],
            });

        // Loops through the inventory
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name,
                res[i].department_name,
                parseFloat(res[i].price).toFixed(2),
                res[i].stock_quantity]
            );
        }
        console.log(table.toString());

        if (!successful) {
            bamazon()
        } else {
            console.log("Thanks for coming!")
        }
    })
}

// Displays Inventory to select
function bamazon() {
    // Prompt Customers Input
    inquirer.prompt([
        {
            type: "number",
            name: "id",
            message: "Please enter the Product ID of the item that you would like to buy?".yellow
        },
        {
            type: "number",
            name: "quantity",
            message: "How many would you like to buy?".yellow
        },
    ]).then(function (answer) {

        const quantity = answer.quantity;
        const itemID = answer.id;

        connection.query('SELECT * FROM products WHERE id=' + itemID, function (err, selectedItem) {
            if (err) throw err;

            if ((selectedItem[0].stock_quantity - quantity) > 0) {

                console.log("Quantity in Stock: ".green +
                    selectedItem[0].stock_quantity + "\nOrder Quantity: ".green + quantity.yellow);

                console.log("Congratulations! Bamazon has suffiecient inventory of ".green +
                    selectedItem[0].product_name.yellow);

                // Calculate total sale, and fix 2 decimal places
                console.log("Thank You for your purchase. Your order total will be ".green + "$".yellow +
                    (answer.quantity * selectedItem[0].price).toFixed(2).yellow +
                    "\nThank you for shopping at Bamazon!".magenta);

                // Query to remove the purchased item from inventory.                       
                connection.query('UPDATE products SET stock_quantity=? WHERE id=?', [selectedItem[0].stock_quantity - quantity, itemID],

                    function (err, inventory) {
                        if (err) throw err;
                        // Runs the prompt again, so the customer can continue shopping.
                        successful = true
                        showTable();
                        // ends connection
                        connection.end();
                    });

            }
            // Low inventory warning
            else {
                console.log("INSUFFICIENT INVENTORY: \nBamazon only has ".red +
                    selectedItem[0].stock_quantity + " " +
                    selectedItem[0].product_name.cyan +
                    " in stock at this moment. \nPlease make another selection or reduce your quantity.".red, "\nThank you for shopping at Bamazon!".magenta);
                bamazon();

            }
        });
    });
};

