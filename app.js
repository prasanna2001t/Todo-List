//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const req = require("express/lib/request");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));


mongoose.connect("mongodb+srv://Prasanna:Prasannades1!@cluster0.kapto.mongodb.net/todoDB")
var itemschema=mongoose.Schema({
  name:"string"
})
var Item=mongoose.model("Item",itemschema)
const listSchema=mongoose.Schema({
  name:"string",
  list:[itemschema]
})
const List = mongoose.model("List",listSchema)

app.get("/", function(req, res) {

const day = date.getDate();


Item.find({},(err,data)=>{
  if(data.length===0){
    Item.insertMany(data,(err,data)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log(data);
      }
    })
  }

  
  res.render("list", {listTitle: "Today", newListItems: data}); 

})
})



app.post("/", function(req, res){

  const item = req.body.newItem;
  const newItem= new Item({
    name:item
  })
if(req.body.list == "Today"){
 
  
  Item.insertMany(newItem)
  res.redirect("/")
  }
else{
  
List.findOne({name:req.body.list},(err,data)=>{
  if(!err){
    data.list.push(newItem)
    data.save()
    console.log(data);
    res.redirect("/list/"+req.body.list)
  }
})
}

})

app.post("/delete",(req,res)=>{
  const deleteItem= req.body.check;
  const deleteList=req.body.listname;
  if(deleteList==="Today"){
  Item.findByIdAndRemove(deleteItem,(err,data)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(data);
      res.redirect("/")
    }
  
  })
  }
  else{
    List.findOneAndUpdate({name:deleteList},{$pull:{list:{_id:deleteItem}}},(err,data)=>{
      if(err){         
        console.log(err);
      }
      else{
        console.log(data);
        res.redirect("/list/"+deleteList)
      }
    })
  }
})

app.get("/list/:type", function(req,res){
 
 const Type=_.capitalize(req.params.type)
  List.findOne({name:Type},(err,data)=>{
    if(err){
      console.log(err);
    }
    else{
    if(!data){
      const mainList= new List({
        name:Type,
        list:[{name:"This is our Todo List app"}]
      })
      mainList.save()
      res.redirect("/list/"+Type)
    }
    else{
      res.render("list",{listTitle:Type,newListItems:data.list})
    }
    }
  })
})


app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
