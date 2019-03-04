// Required Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
var Table = require('cli-table');

// Connection script
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});
console.log("connected");

const prompts = {
  managerPrompt: {
    type: "list",
    name: "managerOptions",
    message: "Select an option: ".yellow,
    choices: ["View Products", "View low inventory", "Add Inventory", "Add New Product", "Exit"]
  },
  productIDPrompt: {
    type: "input",
    name: "productID",
    message: "Please enter the Product ID to stock: ".yellow
  },
  productNamePrompt: {
    type: "input",
    name: "productName",
    message: "Please enter the Product name to add to the stock: ".yellow

  },
  departmentNamePrompt: {
    type: "input",
    name: "departmentName",
    message: "Please enter the product's department name: ".yellow
  },
  productPricePrompt: {
    type: "input",
    name: "productPrice",
    message: "Please enter the Product's price: ".yellow
  },
  numOfUnitsPrompt: {
    type: "input",
    name: "numOfUnits",
    message: "Please enter number of units you want to add to the stock: ".yellow
  }
};

connection.connect(function (err) {
  if (err) throw err;
  console.log(colors.cyan("Welcome!" + connection.threadId));
  selectOption();
})

const selectOption = function () {
  inquirer.prompt(prompts.managerPrompt)
    .then(function (answer) {
      switch (answer.managerOptions) {

        case "View Products":
          viewProducts();
          break;

        case "View low inventory":
          viewLowInventory();
          break;

        case "Add Inventory":
          addInventory();
          break;

        case "Add New Product":
          addNewProduct();
          break;

        case "Exit":
          endShopping();
          break;

      }
    });
};

// Presents all products
const viewProducts = function () {
  console.log('------------------');
  console.log("\nSelecting all products...\n");
  connection.query("SELECT * FROM products", function (error, res) {
    if (error) throw error;
    const table = new Table(
      {
        head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price".cyan.bold, "Quantity".cyan.bold],
        colWidths: [12, 75, 20, 12, 12],
      });

    // Loops through the inventory
    for (var i = 0; i < res.length; i++) {
      table.push(
        [res[i].id,
        res[i].product_name,
        res[i].department_name,
        parseFloat(res[i].price).toFixed(2),
        res[i].stock_quantity]
      );
    }
    console.log(table.toString());
    selectOption();
  });
};

// low inventoory check
const viewLowInventory = function () {
  console.log("-------------------------");
  console.log("Searching for low inventory..\n".green);
  let query = "SELECT * FROM products HAVING stock_quantity <= 3 ORDER BY id";

  connection.query(query, function (err, results) {
    if (err) throw err;

    if (results.length === 0) {
      console.log("No Low inventory.");
      selectOption();
    }
    else if (results.length > 0) {
      results.forEach(function (element) {
        console.log("Product ID: ".yellow + element.id +
          "\nName: ".yellow + element.product_name.red.bold +
          "\nQuantity: ".yellow + element.stock_quantity + "\n");
      });
      selectOption();
    }
  });
};

// Add to the inventory
const addInventory = function () {
  console.log('------------------');
  inquirer.prompt([prompts.productIDPrompt, prompts.numOfUnitsPrompt])
    .then(function (answer) {
      console.log('------------------');
      console.log("\nUpdating stock quantities...\n".green);
      let query = "SELECT id, product_name, stock_quantity FROM products WHERE ?";
      connection.query(query, {
        id: answer.productID
      },
        function (error, results) {

          if (results.length === 0) {

            console.log("Product ID not found\n".red);
            selectOption();

          }
          else if (results.length > 0) {

            let updatedStockQuantity = parseInt(answer.numOfUnits) + results[0].stock_quantity;
            let productName = results[0].product_name;

            let query = "UPDATE products SET ? WHERE ?";
            connection.query(query, [{
              stock_quantity: updatedStockQuantity
            },
            {
              id: answer.productID
            }
            ],
              function (error, results) {
                console.log('Updated "'.magenta + productName + '" quantity to '.magenta + updatedStockQuantity + '\n');
                selectOption();
              });
          }
        });
    });
};

// Add new product to the inventory
const addNewProduct = function () {
  console.log('------------------');
  inquirer.prompt([prompts.productNamePrompt, prompts.departmentNamePrompt, prompts.productPricePrompt, prompts.numOfUnitsPrompt])
    .then(function (answer) {


      let query = "SELECT * FROM products WHERE ?";
      connection.query(query, {
        product_name: answer.productName
      },
        function (error, results) {

          if (results.length > 0) {
            console.log('------------------');
            console.log("\nProduct already exists in inventory\n".green)
            selectOption();

          }
          else if (results.length === 0) {

            console.log('------------------');
            console.log("\nInserting a new product...\n".green);
            let query = "INSERT INTO products SET ?";

            connection.query(query, {
              product_name: answer.productName,
              department_name: answer.departmentName,
              price: answer.productPrice,
              stock_quantity: answer.numOfUnits,
            }, function (err, res) {
              if (err) throw err;
              else {
                console.log("\nYour product has been added!\n".magenta);
                selectOption();
              }

            });
          }
        });

    });
}

// Ends connection to database
const endShopping = function () {
  console.log("\See you.");
  connection.end();
}
