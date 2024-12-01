const express = require('express')
const fs  = require('fs')
const users = require("./MOCK_DATA.json")
const app = express();
const port = 8000;
app.use(express.json());

//Middleware - Plugin
//The below one is a third party middleware ...prebuilt middleware
app.use(express.urlencoded({extended:false}))//this middleware process the data coming from the body and converts to an object and returns it to the req.body
app.use((req,res,next)=>{
    fs.appendFile("log.txt",`\n ${Date.now()}:${req.ip} : ${req.method}:${req.path}`,(err,data)=>{
        next();
    })
   console.log("This is middleware 1")
   req.myUserName ='Niharika'
//    return  res.end("this is middleware 1")

})

app.use((req,res,next)=>{
 
    console.log("Hello form middleware 2 "+req.myUserName);
   next()
    
})



//Routes
app.get("/users",(req,res)=>{
    const html = `
    <ul>
    ${users.map((user)=>`<li>${user.first_name} ${user.last_name}  ${user.id}</li> `).join("")}
    </ul>
    `;
    res.send(html);
 })
app.get("/api/users",(req,res)=>{
    console.log(req.headers);//This is request headers 
    
    res.setHeader('X-myName','Niharika');//This is a Custom response headers 
    //Always add X to custom headers
    return res.json(users);
})
// app.get("/api/users/:id",(req,res)=>{
//     const id =Number( req.params.id);
//     const user = users.find((users) =>users.id ===id )
//     // return res.json(user.first_name)
//     return res.json(user)
// })
app.route("/api/users/:id")
.get((req,res)=>{
    const id =Number( req.params.id);
    const user = users.find((users) =>users.id ===id )
    if(!user) return res.status(404).json({msg : "User doesnt exist"})
    // return res.json(user.first_name)
    return res.json(user)
})
.patch((req, res) => {
    const id = Number(req.params.id);
    const body = req.body;
    console.log(body);
    // if (!body || Object.keys(body).length === 0) {
    //     return res.status(400).json({ error: "Request body is empty" });
    // }
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    // Update the user
    const updatedUser = { ...users[userIndex], ...body, id };
    users[userIndex] = updatedUser;

    // Save the changes to the file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update user" });
        }
        res.json({ status: "Success", updatedUser });
        // console.log(updatedUser);
        
    });
})

.delete((req,res)=>{
        //To do :Delete the user using the id
        const id = Number(req.params.id);
        const userIndex = users.findIndex(user=>user.id===id)
        users.splice(userIndex,1);
        fs.writeFile("./MOCK_DATA.json",JSON.stringify(users),(err)=>{
            if(err){
                return res.status(500).json({error:"failed to delete user"})
            }
            else res.json({status:"Success",message:"User deleted"})
        })
        // res.json({ status:"pending"})
});
 app.post("/api/users",(req,res)=>{
    //To do :create new user
    const body = req.body;
    users.push({...body, id:users.length+1})
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data)=>{
  
        if(!body || !body.first_name || !body.last_name || !body.email || !body.last_name){
            return res.status(400).json({ msg :"All fields are required"})
        } 
        return res.status(201).json({ status:"success",id : users.length});
    })
    console.log(body);
  
})
// app.patch("/api/users/:id",(req,res)=>{
//     //To do : Edit the user with id
//     res.json({ status:"pending"})
// })
// app.delete("/api/users/:id",(req,res)=>{
//     //To do :Delete the user using the id
//     res.json({ status:"pending"})
// })
app.listen(port,()=>console.log('Server started !')
)