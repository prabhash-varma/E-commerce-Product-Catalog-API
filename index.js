const express = require('express');
const app = express();
const port = 3000;
const Item = require('./models/Item');
const mongoose = require('mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce Product Catalog API',
            description: 'Ecommerce API Information',
            version: '1.0.0',
            contact: {
                name: 'Prabhash Varma'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
            }
        ],
    },
    apis: ['./index.js']
};


/**
 * @swagger
 *  components:
 *     schemas:
 *         Item:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  name:
 *                      type: string
 *                  description:
 *                      type: string
 *                  price:
 *                      type: number
 *                  category:
 *                      type: string
 *                  availability:
 *                      type: string
 * 
 *              example:
 *                  _id: 6481573c30d755290fed5fe9
 *                  name: Bluetooth Speaker
 *                  description: A portable speaker with wireless Bluetooth connectivity for on-the-go music
 *                  price: 49.99
 *                  category: Electronics
 *                  availability: In stock
 * 
 * */

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
// swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL }));




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



mongoose.connect('mongodb+srv://prabhash:prabhash@cluster0.snfesgf.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('Connected to database');
}).catch((err)=>{
    console.log(err);
});



app.get('/', (req, res) => {
    res.send('API Working fine');
});


// app.post('/additem', (req, res) => {
//     const item = new Item({
//         name: req.body.name,
//         description: req.body.description,
//         price: req.body.price,
//         category: req.body.category,
//         availability: req.body.availability
//     });
//     item.save().then((result) => {
//         res.send(result);
//     }).catch((err) => {
//         console.log(err);
//     });





/**
 * @swagger
 * /items/{id}:
 *  get:
 *     summary: Get item by id
 *     description: Get item by mongodb id
 *     parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: mongodb id of item
 *
 *     responses:
 *        200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Item'
 *        404:
 *              description: Item not found
 *        500:
 *              description: Internal Server Error
 * 
 * 
 * */
app.get('/items/:id', (req, res) => {
    // fetching using mongodb id
    Item.findById(req.params.id).then((result) => {
        if(!result){
            res.status(404).json({ message: 'Item not found' });
        }
        else{
            res.status(200).json(result);
        }
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    });
});





/**
 * @swagger
 * /items:
 *  get:
 *     summary: Get list of items
 *     description: Get all items and filter by category, availability, price, name and sort by name, price 
 *     parameters:
 *          - in: query
 *            name: pageno
 *            description: Enter page number you want to fetch
 *            schema:
 *              type: integer
 *          - in: query
 *            name: search
 *            description: search by name
 *            schema:
 *              type: string
 *          - in: query
 *            name: category
 *            description: category of item
 *            schema:
 *              type: string
 *          - in: query
 *            name: availability
 *            description: availability of item
 *            schema:
 *              type: string
 *          - in: query
 *            name: lowprice
 *            description: lower limit of price
 *            schema:
 *              type: integer
 *          - in: query
 *            name: highprice
 *            description: higher limit of price
 *            schema:
 *              type: integer
 *          - in: query
 *            name: sortbyname
 *            description: sort by name(Input true or false)
 *            schema:
 *              type: boolean
 *          - in: query
 *            name: sortbyprice
 *            description: sort by price(Input true or false)
 *            schema:    
 *              type: boolean
 *          
 * 
 *
 *
 *     responses:
 *        200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Item'
 *        404:
 *              description: Item not found
 *        500:
 *              description: Internal Server Error
 * 
 * 
 * */
app.get('/items', (req, res) => {
    let perpage =  10
    let pageno = (parseInt(req.query.pageno) || 1) -1;
    let options = {};
    let query = {};
    let sort = {};
    let category = req.query.category;
    let availability = req.query.availability;
    let lowprice = parseInt(req.query.lowprice);
    let highprice = parseInt(req.query.highprice);
    let sortbyname = req.query.sortbyname;
    let sortbyprice = req.query.sortbyprice;
    let search = req.query.search;


    if (category) {
        query.category = category;
    }
    if (availability) {
        query.availability = availability;
    }
    if (lowprice && highprice) {
        query.price = { $gte: lowprice, $lte: highprice };
    }
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
   
    if (sortbyname==="true") {
        sort.name = 1;
    }
    if (sortbyprice==="true") {
        sort.price = 1;
    }

    Item.find(query).skip(pageno*perpage).limit(perpage).sort(sort).then((result) => {

        if(result.length==0){
            res.status(404).json({ message: 'Items not found' });
        }
        else{
            res.status(200).json(result);
        }
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    }
    );
});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
