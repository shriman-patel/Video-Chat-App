import httpStatus from "http-status";
import  {User} from "../models/users_model.js";
import bcrypt, {hash} from "bcrypt";
import crypto from "crypto";


// login
const login = async (req,res) => {
const { username, password } = req.body;

if(!username || !password){
    return res.status(400).json({message: "Please Provide"});
}
try{
 const user = await User.findOne({ username });
 console.log("find user" ,user)
 if(!user){
    return res.status(httpStatus.NOT_FOUND).json({message: "User not Found"})
 }
let isPasswordCorrect = await bcrypt.compare(password, user.password);
 if(isPasswordCorrect) {
    let token = crypto.randomBytes(20).toString("hex");
   user.token = token;
   await user.save();
   return res.status(httpStatus.OK).json({ token : token})
}else{
   return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
}
}catch(e) {
     return res.status(500).json({ message: `Something went Wrong ${e}` });

}
}

// register
const register = async(req, res)=>{
    const { name, username, password }= req.body;
    console.log("Incoming register data:", req.body);

    try{
        const existingUser = await User.findOne({ username });
            console.log("Existing user:", existingUser);

   
        if(existingUser){
        return res.status(httpStatus.FOUND)
         .json({message: "User already exists!"});
     }
     const hashedPassword = await bcrypt.hash(password, 10);

     const newUser = new User({
        name : name,
        username : username,
        password : hashedPassword,
     });
    const savedUser =  await newUser.save();
        console.log("✅ User saved successfully:", savedUser);

     res.status(httpStatus.CREATED).json({ message: "User registered" });
        
    }catch (e) {
  console.error("Registration error:", e);
  return res.status(500).json({ message: "Registration failed", error: e.message });
}

}

const getUserHistory = async(req, res) => {
   const {token} = req.body;
   try{
      const user =  await User.findOne({token: token});
      const meetings =  await Meeting.find({user_id: user.username})
      res.json(meetings)
   }catch(e){
      res.json({message: `Something wend wrong ${e}`})
   }
}

const addToHistory =  async(req,res)=>{
   const { token, meeting_code} = req.body;
   try{
      const user =  await User.findOne({token: token});
      const newMeeting =  new Meeting({
         user_id: user.username,
         meeting_code: meeting_code
      })
      await newMeeting.save();
      res.status(httpStatus.CREATED).json({message: "Meeting added to history"});
   }catch(e){
   res.json({message:`something went wrong${e}`});
   }
}

export {login, register, getUserHistory, addToHistory};