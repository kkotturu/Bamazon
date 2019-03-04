-- Drops the db bamazon if it exists currently --
DROP DATABASE IF EXISTS bamazon;
-- Creates the "bamazon" database --
CREATE DATABASE bamazon;

-- Makes it so all of the following code will affect bamazon --
USE bamazon;

-- Creates the table "products" within bamazon --
CREATE TABLE products
(
  id INT(11) NOT NULL  AUTO_INCREMENT,
  product_name VARCHAR   (100) NOT NULL,
  department_name VARCHAR   (45) DEFAULT NULL,
  price DECIMAL   (10,2) DEFAULT NULL,
  stock_quantity INT   (100) DEFAULT NULL,
  PRIMARY KEY   (id)
);

  INSERT INTO products
    (product_name, department_name, price, stock_quantity)
  VALUES
    ("Cake", "Food & Grocery", 1.99, 25),
    ("Milk", "Food & Grocery", 3.99, 30),
    ("iPad4 mini", "Electronics", 599, 50),
    ("MacBook pro", "Electronics", 2599, 15),
    ("Soaps", "Health & Beauty", 599, 50),
    ("Cream", "Health & Beauty", 10.99, 40),
    ("Sweatshirt", "Clothing", 25.99, 10),
    ("Jeans", "Clothing", 37.99, 100),
    ("Watch", "Jwelery", 3.99, 30),
    ("Diamond Ear rings", "Jwelery", 599.99, 5);


