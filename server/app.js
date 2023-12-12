const connectedUsers={};
const express = require("express")
const {connectToDb,getDb} = require("./db")
const {ObjectId} = require("mongodb")
const app = express()

const http = require("http"); // Imports the built-in Node.js http module, which is used to create an HTTP server.
const {Server} = require("socket.io"); // Destructures the Server class from the socket.io module. socket.io is a library for real-time web applications, and the Server class is used to create a WebSocket server.

app.use(express.json())
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require('cors');
app.use(cors()); // Enable CORS for all routes
const server = http.createServer(app); // Creates an HTTP server using the Express application (app). This server will handle HTTP requests.

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",// client running url 
    },
}); // Creates a new instance of the Server class from socket.io and attaches it to the existing HTTP server (server). It also configures CORS for WebSocket connections. In this case, it allows connections from http://localhost:3000


const registerQueries = async (data,socket)=>{
    const {username,password}=data
    try{
        const existingUser = await db.collection("registeredUsers").findOne({ username: username });
        if(existingUser){
            console.log("He is an existing user:", existingUser);
            socket.emit("existing-user",username)
            return;
        }
        else{
            console.log("He is not existing user:", username);
            if (password.length < 6) {
                socket.emit("password-validation",password)
                return;
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                console.log(hashedPassword)
                db.collection("registeredUsers")
                .insertOne({username,hashedPassword})
                .then((result)=>{
                  console.log(result,`on ${socket.id}`)
                  socket.emit("registration-response",{status:200,message: "User registered successfully"})
                })
                .catch((err)=>{
                    socket.emit("registration-response",{status:400,message: `User registered UnSuccessfully ${err}`})
                }) 
            }
        }
    }
    catch(error){
        console.log(error)
    }
}

const loginQueries = async (loginData,socket)=>{
    const {username,password}=loginData
    const dbResponse= await db.collection("registeredUsers").findOne({ username: username });
    console.log(dbResponse)
    if(dbResponse === null){
        socket.emit("login-response",{status:400,message:"Invalid User"})
    }
    else{
        const comparePassword = await bcrypt.compare(password, dbResponse.hashedPassword);
        console.log(comparePassword)
        if(!comparePassword){
            socket.emit("compare-password-res",{status:400,message:"Invalid password"})
        }else{
            console.log(dbResponse,"login successful")
            /*
            const payload = {
                username: dbResponse.username,
                user_id: dbResponse._id,
            };
            const jwtCreatedToken = await jwt.sign(payload, "MY_SECRET_TOKEN_STRING");
            const tokenObject={
                jwtToken: jwtCreatedToken,
            };
            */
            socket.emit("compare-password-res",{status:200,message:"login successfull"});   
        }
    }
}

io.on("connection",(socket)=>{
    console.log(`user connected: ${socket.id}`);
    socket.on("send_new_user_credentials",(data)=>{
        console.log(data,`for ${socket.id}`)
        registerQueries(data,socket)
        // loginQueries(data,socket)
    })
    socket.on("send_login_details",(loginData)=>{
        console.log(loginData,`for ${socket.id}`)
        loginQueries(loginData,socket)
    })

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`);
        // Remove user from connectedUsers when disconnected
        delete connectedUsers[socket.id];
        
      });

    // Check if the user is already connected from another socket
    socket.on("check_duplicate_login", (username) => {
        const existingSocketId = Object.keys(connectedUsers).find((key) => connectedUsers[key] === username);
        if (existingSocketId) {
            // Emit a logout event to the existing socket
            socket.to(existingSocketId).emit("logout", {
                reason: `Logged in from another tab with socket id: ${socket.id}`,
            });
            // Remove user from connectedUsers
            delete connectedUsers[existingSocketId];
        }
        // Add the current user to connectedUsers
        connectedUsers[socket.id] = username; // example=> { 'g-s5Kb--03IDKF9CAAAD': 'ranvir' }
        console.log(connectedUsers,"connected users")
    });  
}) //  this code sets up an event listener for the "connection" event on the Socket.IO server. When a client connects, the callback function is executed, and it logs a message to the console indicating the successful connection along with the unique identifier (socket.id) of the connected client. This is a common pattern in Socket.IO applications to perform actions when clients connect, such as setting up event listeners for further communication.


// database connection 
let db
connectToDb((err)=>{
    console.log("in app.js")
    if(!err){
        server.listen(8389,()=>{
            console.log("app listening on port number 8389")
        })
        db = getDb()
    }
})


