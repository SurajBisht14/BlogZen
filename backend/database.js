const mongoose = require('mongoose');
const url = process.env.MONGODB_CONNECTION_URL;

const conncect_Db = async ()=>{

    try{

        await mongoose.connect(url);

        console.log("Connection succesfull with database")
    }
    catch(error){
        console.log("Connection Failed with database",error)
    }

}
module.exports = conncect_Db ;
