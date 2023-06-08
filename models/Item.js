var mongoose = require('mongoose');
var mongoosepaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ItemSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    availability:{
        type: String,
        required: true,
    }
});

ItemSchema.plugin(mongoosepaginate);
module.exports = mongoose.model('Item', ItemSchema);
