const express=require("express");
const app=express()
const fs=require("fs")

const Message=require("./models/mongoMessageModel")

var bodyParser = require('body-parser');
const cors=require("cors");
const connectDB = require("./db/connectionDB");
const { router } = require("./routers/router");
//new here
const http = require("http");
const socketIO = require("socket.io");


const server = http.createServer(app);

const io = socketIO(server, {
  maxHttpBufferSize: 1e8, // Set your desired maxHttpBufferSize value
  
    cors: {
      origin: '*',
    },
  
});

// const http=require("http").createServer(app)
// const io=require("socket.io")(http)

require("dotenv").config();
const port = process.env.PORT || 5000;
const path = require("path");


  
  app.use(cors({origin: '*'}));

// app.use(cors({ origin: 'http://192.168.0.103:3000',}))
// app.use(cors("*"))
// app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1", router);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/img",express.static(path.join(__dirname,'images')))

// app.post("/fetchData",(req,res)=>{
//     user.find().then((result)=>{

//         res.send(result)
//     })

// })


// app.post("/message",(req,res)=>{
//     let{key,message}=req.body
//     const data=new userMessage({
//         key:key,
//         message:message
//     })
//     data.save().then(result=>{
//         res.send(result)
//     }).catch(err=>{
//         res.send(err)
//     })
// })

// app.post("/filterMessage",(req,res)=>{
//     let{key}=req.body
//     userMessage.find({key:key}).then(result=>{
//         res.send(result)
//     }).catch(err=>{
//         res.send(err)
//     })
// })

//  app.post("/get_last_msg", (req, res) => { 
//     let { Chat_Id1, Chat_Id2 } = req.body;
//      Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
//       .then((result) => { res.send(result[result.length-1]); })
//      .catch((err) => { res.send(err); }); });


io.on('connection',(socket)=>{
    console.log("socket is connected")



    // socket.on("disconnect",()=>{
    //     console.log("socket is disconnected")
    // })
   
    socket.on("recieveMsg",async(data)=>{
        console.log("datarecieve",data)
    
        // console.log("datarecieve",typeof data)
        try {
            let { Chat_Id1, Chat_Id2 } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
             .then((result) => { 
                 console.log("recievd",result)
                 if(result.length==0){
                    // socket.join(result[0].Chat_Id)
                  socket.emit("getData",result)
                    return
                //     socket.join(result[0].Chat_Id)
                //   io.to(result[0].Chat_Id).emit("getData",result)
                 }
                 socket.join(result[0].Chat_Id)
                  io.to(result[0].Chat_Id).emit("getData",result)
                //  socket.join(result[0].Chat_Id)
                //  socket.emit("getData",result)
                // socket.emit("getData",result)
                // res.send(result); 
                
            })
        } catch (error) {
            console.log("error",err)
        }
       
        // .catch((err) => { 
        //     console.log("error",err)
        //     // res.send(err);
        //  });
    })




socket.on("storeData",async(data)=>{
console.log("data", data) 
 let { from, to,message, Chat_Id,type } = data
if(data.type=="text"){
// let { from, to,message, Chat_Id } = data;
    // socket.join(Chat_Id)
    //    if (!message || !from || !to) { 
    //        // res.send({ message: "Please provide all the required fields" });
    //        return 
    //  } 
     const chat_id = await Message.findOne({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] });  
        console.log(chat_id);
         if (chat_id == null) { 
            Chat_Id = `${from}_${to}`; 
        } else {
             Chat_Id = chat_id.Chat_Id; 
            }
             const msg = new Message({ message: message, from: from, to: to, Chat_Id: Chat_Id, });
          msg.save() .then((result) => { 
            console.log("message sent succefully",result)

            // let { Chat_Id1, Chat_Id2 } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] })
             .then((result) => { 
                 console.log("recievd",result[0].Chat_Id)
                 socket.join(result[0].Chat_Id)
                 io.to(result[0].Chat_Id).emit("getData",result)
                //  socket.emit("getData",result)

                // socket.emit("getData",result)
                // res.send(result); 
                
            })
            .catch((err) => { 
                console.log("error",err)
                // res.send(err);
             });

            // res.send(result);
         }) 
         .catch((err) => { 
            console.log("error",err)
            // res.send({ message: "internal server error" }); 
        }); 
}else{
    // let { from, to,message, Chat_Id,type } = data
    console.log("data===>",data);
    const chat_id = await Message.findOne({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] });  
    console.log("ChatId1===>",chat_id);
     if (chat_id == null) { 
        Chat_Id = `${from}_${to}`; 
    } else {
         Chat_Id = chat_id.Chat_Id;  
        }
    console.log("ChatId2===>",chat_id);
        const imgfile=new Buffer(data.message)
 // Create a unique filename based on timestamp
 const uniqueFileName = `file_${Date.now()}.jpg`;

 const folderPath = path.join(__dirname, 'images',`${Chat_Id}`);

 // Check if the 'images' folder exists, if not, create it
 if (!fs.existsSync(folderPath)) {
     fs.mkdirSync(folderPath);
 }

 const filePath = path.join(folderPath, uniqueFileName);

 fs.writeFile(filePath, imgfile, (err) => {
     if (err) {
         console.error("Error:", err);
     } else {
         console.log("Image stored successfully at:", filePath);
         const store=async()=>{

            // let { from, to,message, Chat_Id,type } = data;

            // socket.join(Chat_Id)
            //    if (!message || !from || !to) { 
            //        // res.send({ message: "Please provide all the required fields" });
            //        return 
            //  } 
        
             const chat_id = await Message.findOne({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] });  
                console.log(chat_id);
                 if (chat_id == null) { 
                    Chat_Id = `${from}_${to}`; 
                } else {
                     Chat_Id = chat_id.Chat_Id; 
                    }
                     const msg = new Message({ message: uniqueFileName, from: from, to: to, Chat_Id: Chat_Id,type:type });
                  msg.save() .then((result) => { 
                    console.log("message sent succefully",result)
        
                    // let { Chat_Id1, Chat_Id2 } = JSON.parse(data);
                    Message.find({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] })
                     .then((result) => { 
                         console.log("recievd",result[0].Chat_Id)
                         socket.join(result[0].Chat_Id)
                         io.to(result[0].Chat_Id).emit("getData",result)
                        //  socket.emit("getData",result)
        
                        // socket.emit("getData",result)
                        // res.send(result); 
                        
                    })
                    .catch((err) => { 
                        console.log("error",err)
                        // res.send(err);
                     });
        
                    // res.send(result);
                 }) 
                 .catch((err) => { 
                    console.log("error",err)
                    // res.send({ message: "internal server error" }); 
                }); 
         }
         store()
     }
 });
}
    
        


console.log(data)




})

socket.on("isTyping",(data)=>{
console.log(data);
     
        try {
            let { Chat_Id1, Chat_Id2 ,isTyping } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
             .then((result) => { 
                 console.log("recievd",result)
                 if(result.length==0){
                   
                 
                    return
              
                 }
                 socket.join(result[0].Chat_Id)
                 console.log(`user joined room ${result[0].Chat_Id}`)
                 socket.broadcast.to(result[0].Chat_Id).emit("checkTyping",{chatId:result[0].Chat_Id,isTyping:isTyping})
              
                
            })
        } catch (error) {
            console.log("error",err)
        }




          
              
        
})

socket.on("img",(data)=>{
    console.log("data===>",data);
//     const imgfile=new Buffer(data.message)
//  // Create a unique filename based on timestamp
//  const uniqueFileName = `file_${Date.now()}.jpg`;

//  const folderPath = path.join(__dirname, 'images');

//  // Check if the 'images' folder exists, if not, create it
//  if (!fs.existsSync(folderPath)) {
//      fs.mkdirSync(folderPath);
//  }

//  const filePath = path.join(folderPath, uniqueFileName);

//  fs.writeFile(filePath, imgfile, (err) => {
//      if (err) {
//          console.error("Error:", err);
//      } else {
//          console.log("Image stored successfully at:", filePath);
//      }
//  });
   
})


})




const Start = async () => {
    try {
      await connectDB();
      server.listen(port, () => {
        console.log(`listening port ${port}`);
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  
  Start();


// http.listen(4000,()=>{
//     console.log("listening port 4000")
// })

// app.listen(4000,()=>{
//     console.log("listening port 4000")
// })

