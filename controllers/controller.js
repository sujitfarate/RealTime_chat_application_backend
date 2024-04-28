const user=require("../models/schema")

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Naming the uploaded file
  },
});
const upload = multer({ storage: storage }).single("file");

const uploadFile = async (req, res) => {
  // console.log(req.file);
  const file = req.file;
  console.log("file", file);
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  res.send("File uploaded!");
};


const registration = async (req, res) => {
  console.log("req",req.file)
    const { name, email, password, Cpassword,  } = req.body;
  
    // console.log("registered_email", req.body.name, req.body.email, req.file.path);
    const registered_email = await user.findOne({ email: email });
    console.log("registered_email", registered_email);
    if (registered_email) {
      return res.json({ status: "failed", message: "email already exists" });
    } else {
      if (name && email && password && Cpassword  ) {
        if(req.file==null){
          res.json({ status: false, message: "please choose profile image" });
        }else{
          if (password === Cpassword) {
            //   const salt = await bcrypt.genSalt(10);
            //   const hassPassword = await bcrypt.hash(password, salt);
              try {
                const data = new user({
                  name: name,
                  email: email,
                  password: password,
                  // tc: tc,
                  image: req.file.path,
                });
      
                await data.save();
                return res.json({
                  status: true,
                  message: "user registered successfully",
                });
              } catch (error) {
                res.json({ status: false, message: "unable to register" });
              }
            } else {
              res.json({
                status: false,
                message: "password and confirm password does not matched",
              });
            }
        }
       
      } else {
        res.json({ status: false, message: "all fields are required" });
      }
    }
  };


  
const fetchFile = async (req, res) => {
    const data = await user.find({});
    res.json({ status: true, data: data });
  };



const login=async(req,res)=>{
    console.log("ress=>",req.body)
    console.log("ress=>",typeof req.body)
        let {email,password}=req.body
    
        user.findOne({email:email}).then((result)=>{
            console.log(result)
          
          if(result){
            if(result.password==password){
                res.send( {status:true,message:"user login successfully",data:result})
            }else{
                res.send( {status:false,message:"password is incorrect"})
            }
           }else{
            res.send({status:false,message:"no record is existed"})
           }
        }).catch((err)=>{
            res.send(err)
        })
    
}

const register=async(req,res)=>{
    let {name,email,password}=req.body
    let data=new user({
        name:name,
        email:email,
        password:password,
        image: req.file.path,
    })
    data.save().then((result)=>{
    
        res.json({status:true,message:"user register successfully"})
    }).catch((err)=>{
        console.log(err)
        res.json({status:false,message:"user registration faild"})
    })
}

const fetchUsers_Except_Logined_User=async(req,res)=>{
    user.find({email:{$not: {$eq: req.body.email}}}).then((result)=>{
        res.send(result)
    }).catch((err)=>{
        res.send(err)
    })
}

const searchUser=async(req,res)=>{
    let data= await user.find({"$or":[{name:{$regex:req.params.name}}]})
    res.send(data)
}

const sendmail=(req,res)=>{



  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
     
    host: 'mail.emeetings.co.in',
    auth: {
      user: 'appsupport@emeetings.co.in',
      pass: 'Appsupport#2021',
      port:587
    }
  });
  
  var mailOptions = {
    from: 'appsupport@emeetings.co.in',
    to: 'sujitfarate10@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'whats up'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      // res.send("faild")
    } else {
      console.log('Email sent: ' + info.response);
      // res.send("sent mail")
    }
  });
}



module.exports={login,register,fetchUsers_Except_Logined_User,searchUser,registration,upload,uploadFile,fetchFile,sendmail}