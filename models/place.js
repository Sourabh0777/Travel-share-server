const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, required: true },//Image is not the actual file it is the URL which is stored. 
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    creator: { type: mongoose.Types.ObjectId,required:true,ref:'User'}
}) //Blue print of the document

module.exports = mongoose.model('Place', placeSchema); // Modal will return a constructor function later 
// First argument is the name of the modal 
