import {Component} from "react"
// import {v4 as uuIdV4} from "uuid"
import './App.css';
import io from 'socket.io-client'; // This line imports the io function from the 'socket.io-client' library. The io function is the primary method for creating a Socket.IO client.
const socket = io.connect("http://localhost:8389");// Initialize Socket Connection: Create a socket connection to the server running at http://localhost:8386 using the io.connect method. The resulting object (socket) will be used to interact with the Socket.IO server.
/*
io function:

io is the main function provided by the 'socket.io-client' library. It is used to create a new Socket.IO client.
.connect("http://localhost:3001"):

The connect method is called on the io function to establish a connection to a Socket.IO server. It takes a single argument, which is the URL of the server to which the client should connect. In this case, the server is expected to be running at http://localhost:3001.
const socket = ...:

The resulting object from the io.connect call is assigned to the variable socket. This object represents the WebSocket connection to the Socket.IO server. You can use the socket object to send and receive messages, emit events, and perform other actions related to the real-time communication with the server.
In summary, this line initializes a Socket.IO client by connecting it to a Socket.IO server running at http://localhost:8386. The socket object can then be used to interact with the server in real-time, facilitating bidirectional communication between the client and the server.
*/


class App extends Component{

  state = {
    userNameValue:"",passwordValue:"",loginSuccessPage:false
  }

  userNameTriggered= (event)=>{
    this.setState({userNameValue:event.target.value})
  }

  passwordTriggered = (event)=>{
    this.setState({passwordValue:event.target.value})
  }

  registerBtnClicked=()=>{
    const {userNameValue,passwordValue}=this.state
    if(userNameValue==="" || passwordValue===""){
      alert("Missed Some details...")
    }
    else{
      const newCredentials={
        username:userNameValue,
        password:passwordValue
      }
      this.setState({
        userNameValue:"",passwordValue:""
      });
      socket.emit("send_new_user_credentials",newCredentials) 
      socket.on("registration-response",(registrationResponseObject)=>{
        console.log(registrationResponseObject)
        if (registrationResponseObject.status === 200) {
          // Successful registration
          console.log(registrationResponseObject.message);
          alert(registrationResponseObject.message)
        } else {
          // Failed registration
          console.log(registrationResponseObject.message);
          alert(registrationResponseObject.message)
        }
      })
      socket.on("existing-user", (username) => {
        alert(`Username with ${username} already exists`);
      });
      socket.on("password-validation",(password)=>{
        alert(`your password: ${password}, So provide length of password greater than 6`)
      })
  
    }
  }

  loginBtnClicked=()=>{
    const {userNameValue,passwordValue}=this.state
    const loginDetails = {
      username:userNameValue,
      password:passwordValue
    }
    this.setState({
      userNameValue:"",passwordValue:""
    });

    // Emit "check_duplicate_login" event before sending login details
    socket.emit("check_duplicate_login", loginDetails.username);
    
    socket.on("logout", (reasonObject) => {
      alert(reasonObject.reason)
    })

    socket.emit("send_login_details",loginDetails)
    socket.on("login-response",(loginResponseObject)=>{
      if(loginResponseObject.status===400){
        alert(loginResponseObject.message)
      } 
    })
    socket.on("compare-password-res",(compareResObj)=>{
      console.log(socket.id)
      if(compareResObj.status===400){
        alert(compareResObj.message)
      }else{
        this.setState({loginSuccessPage:true})
      }
    })
    
  }


  render() {
    
    const {userNameValue,passwordValue,loginSuccessPage}=this.state
    const pageView=()=>{
      if(loginSuccessPage){
        return (
          <>
          <p>SOCKET ID OF CURRENT TAB: {socket.id}</p>
          <h2>Login Successful!</h2>
          <p>You are now logged in.</p>
          </>
        )
      }else{
        return (
        <>
        <h5>SOCKET ID OF CURRENT TAB: {socket.id}</h5>
        <div className="login-form">
          <input type="text" placeholder="Username" value={userNameValue} onChange={this.userNameTriggered}/>
          <input type="password" placeholder="Password" value={passwordValue} onChange={this.passwordTriggered} />
          <button className="loginBtn" type="button" onClick={this.loginBtnClicked} >Login</button>
          <button className="signUpBtn" type="button" onClick={this.registerBtnClicked}>Register</button>
        </div>
        </>
        )
      }
    }
    
    return (
    <div className="login-container">
      {pageView()}
    </div>
    )
  }
}
export default App;