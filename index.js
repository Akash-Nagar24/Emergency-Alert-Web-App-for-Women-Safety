const express=require("express");
const mongoose=require("mongoose");
const multer=require("multer");
const cors=require("cors");
const fs=require("fs");
const axios=require("axios");
const path=require("path");
if(!fs.existsSync("uploads")){
  fs.mkdirSync("uploads");
  console.log("'uploads' folder created automatically");
}
const app=express();
app.use(cors({origin:"*"}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads',
express.static(path.join(__dirname,"uploads")));

//MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/womenSafety",{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
.then(()=>{
  console.log("MongoDB Connected Successfully!");
})
.catch((error)=>{
console.log("MongoDB Connection Error!",error);
});
 
//MongoDB Schema
const alertSchema=new mongoose.Schema({
name:String,
contact:String,
sms:String,
latitude:Number,
longitude:Number,
location:String,
audioPath:String,
},{timestamps:true});

//MongoDB Model
const Alert=mongoose.model("Alert",alertSchema);

//Get Location Name
const getLocationName=(async (latitude,longitude)=>{
 try{
  const url=`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  const response=await axios.get(url,{
    headers:{
      "User-Agent":"EmergencyAlertApp/1.0(aakashnagar477@gmail.com)",
      "Accept-Language":"en"
    },
    timeout:10000
  });
  if(response.data && response.data.display_name){
    return response.data.display_name;
  }else{
    return "Unknown Location";
  }
 }catch(error){
  console.log("Error fetching location: ",error.message);
  return "Unknown location";
 }
});

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,"uploads/");
    },
   filename:(req,file,cb)=>{cb(null,Date.now()+"--"+file.originalname);
    },
});
const uploads=multer({storage});
app.post("/send-alert",
    uploads.single("audio"),async(req,res)=>{
     try{
     const{name,contact,sms,latitude,longitude}=req.body;
     const audio=req.file;
     const locationName=await getLocationName(latitude,longitude);
     const newAlert=new Alert({
      name,
      contact,
      sms,
      latitude,
      longitude,
      location:locationName,
      audioPath:audio?`/uploads/${audio.filename}`:null,
     });
     await newAlert.save();
     console.log("Data saved to MongoDB successfully!");
     res.json({message:"Alert received successfully and saved successfully!"});
    }catch(error){
     console.log("Error saving data: ",error);
     res.status(500).json({error:"Server Error"});
    }
    });

app.get("/",(req,res)=>{
  res.send("server is running correctly!");
})

app.listen(5000,()=>{
console.log(`Server is running on http://localhost:${5000}`);
});