var mongoose = require("mongoose");
conn2 = mongoose.createConnection('mongodb://localhost:27017/usersDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "user": String,
    "key": String,
    "role" : String
});
module.exports = conn2.model('users', userSchema);
