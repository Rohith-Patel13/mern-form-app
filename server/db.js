
const {MongoClient} = require('mongodb')

// mongodb compass connection string>   mongodb://127.0.0.1:27017/

let dbConnection;
module.exports = {
    connectToDb: (cb)=>{
        console.log("here")
        MongoClient.connect('mongodb+srv://rohithappala777:Atlas123@cluster0.vbr0tsa.mongodb.net/credentials')
          .then((client)=>{
            dbConnection=client.db()
            return cb() // call back function
          })
          .catch(err=>{
            console.log(err)
            return cb(err) // call back function
          })
    },//establish a connection to database 

    getDb:()=> dbConnection //return our database connection after we have already connected to it and that database will allow us to communicate with database 
}