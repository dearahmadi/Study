const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');


const { notFound, errorHandler } = require('./src/middlewares');

require('dotenv').config();

const schema = require('./src/db/schema');
const db = require('./src/db/connection');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

/* Get all Products */
app.get('/products', async (req, res, next) => {
    
    try {
        // buat query sql
    const querySql = 'SELECT * FROM Products';

    // jalankan query
    db.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
    } catch(error) {
        next(error);
    }
});

/* Get a specific Products */
app.get('/product/:id', async (req, res, next) => {
    try {
        // buat query sql
    const querySql = `SELECT * FROM Products where id=${req.params.id}`;

    // jalankan query
    db.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
    } catch(error) {
        next(error);
    }
});

/* Create a new Products */
app.post('/products', async (req, res, next) => {
    try {
        
        
        const { name, description, price } = req.body;
        // console.log(req.body);
        await schema.validateAsync({ name, description, price });

        const products = await products.findOne({
            name,
            description,
            price
        });

        // Product already exists
        if (products) {
            res.status(409); // conflict error
            const error = new Error('Product already exists');
            return next(error);
        } 

        const newProduct = await products.insertOne({
            name,
            description,
            price: String(price), // Convert price to string
            
        });

        console.log('New product has been created');
        res.status(201).json(newProduct);
    } catch(error) {
        next(error);
    }
});

// /* Update a specific employee */
// app.put('/:id', async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { name, job } = req.body;
//         const result = await schema.validateAsync({ name, job });
//         const employee = await employees.findOne({
//             _id: id
//         });

//         // Employee does not exist
//         if(!employee) {
//             return next();
//         }

//         const updatedEmployee = await employees.update({
//             _id: id,
//             }, {  
//             $set: result},
//             { upsert: true }
//         );

//         res.json(updatedEmployee);
//     } catch(error) {
//         next(error);
//     }
// });

// /* Delete a specific employee */
// app.delete('/:id', async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const employee = await employees.findOne({
//             _id: id
//         });

//         // Employee does not exist
//         if(!employee) {
//             return next();
//         }
//         await employees.remove({
//             _id: id
//         });

//         res.json({
//             message: 'Success'
//         });

//     } catch(error) {
//         next(error);
//     }
// });

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});