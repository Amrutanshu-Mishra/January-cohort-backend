import { Mongoose } from "mongoose";
const {Schema} = mongoose;

const Language = new Schema({ name: String , level: String});

const UserSchema = new Schema({
     name: String,
     email:String,
     password:String,
     skills: [{
          languages: [Language],
          
     }]
});