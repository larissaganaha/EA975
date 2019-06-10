var mongoose = require("mongoose");
conn3 = mongoose.createConnection('mongodb://localhost:27017/restaurantDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var menuSchema = new Schema({
    "name": String,
    "price": Number,
    "calories": Number,
    "nutritionInfo": String,
    "cusine": String
});
module.exports = conn3.model('dishes', menuSchema);
