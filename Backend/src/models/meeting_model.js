import mongoose, { Schema } from "mongoose";



const meetingSchema =  new Schema({
    userId: {
        type: String,
        requied: true,
    },
    meetingCode: {
        type:String,
        requied: true,
    },
    date:{
        type: Date, 
        default: Date.now,
        required: true,
    },
})
 

const Meeting = mongoose.model("Meeting",meetingSchema);
 export{ Meeting };