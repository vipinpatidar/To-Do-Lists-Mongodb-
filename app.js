

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/* -----------------------------------------------------------------------------------------------------------------------------------------*/
// Adding mongodb and mongoose
mongoose.connect("mongodb+srv://vipinpatidar:vipin18@cluster0.i7qzzdx.mongodb.net/todolistDB")
 
const itemSchema = new mongoose.Schema({
         name : String
});

const itemModel = mongoose.model("Todolist" , itemSchema);

const item1 = new itemModel({
      name : "Add Today To-Do :)"
})
// const item2 = new itemModel({
//       name : " Call Home"
// })
// const item3 = new itemModel({
//       name : "Add new file "
// })

const itemArray = [item1]
/* ----------------------------------------------------------------------------------------------------------------------- */
// Creating list schema and a new list document

const listSchema = new mongoose.Schema({
        name : String,
        itemsList : [itemSchema]
})

const listModel = mongoose.model("List" , listSchema);


/*const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];*/

/* ----------------------------------------------------------------------------------------------------------------------------------------------------- */

app.get("/", function(req, res) {
const day = date.getDate();

// Adding find() method here

itemModel.find({},function(err,doc){

  if(doc.length === 0) {
  //  throw new Error("this is error")
  // console.log(err)
  itemModel.insertMany(itemArray,(err) => {
    if(err){
      // throw new Error("Please check again")
      console.log(err)
    }
});

res.redirect("/");
  }
  else{
  //  console.log(doc);
  //  doc.forEach(function(item){
  //       console.log(item.name)  })
        // mongoose.connection.close();

        // rendering in find method
    res.render("list", {listDay: day, listTitle: "TO-DO LISTS", newListItems: doc });
  }
})

});
/* ------------------------------------------------------------------------------------------------------------ */
app.post("/", function(req, res){

  const inputItem = req.body.newItem;
  const listName = req.body.list ;

  const item = new itemModel({
       name : inputItem
  })
   
  if(listName === "TO-DO LISTS"){
    item.save();
    res.redirect("/");
  }
  else{
      listModel.findOne({name : listName}, (err, foundList)=> {
             foundList.itemsList.push(item);
             foundList.save();

             res.redirect("/" + listName)
      })
  }
  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

/*------------------------------------------------------------------------------------------------------------------*/ 

// CheckBox Post request 
app.post("/delete" , (req, res) => {
       const idOfItem = req.body.deleteBox
       const listNameHidden = req.body.hideListName

       if(listNameHidden === "TO-DO LISTS"){

       itemModel.findByIdAndDelete({_id : idOfItem}, (err) => {
            if(!err){
            // console.log("successfully deleted")
              res.redirect("/")
            }
       })

      }
      else{
        listModel.findOneAndUpdate({name : listNameHidden}, {$pull : {itemsList : {_id : idOfItem}}}, (err) =>{
                   if(!err){
                    // console.log("successfully deleted")
                    res.redirect("/" + listNameHidden);
                   }
                  
        })
      }
});

/*---------------------------------------------------------------------------------------------------------------------*/ 

// lists work start from here

app.get("/:coustomListName", function(req,res){
  const day = date.getDate();

    const coustomName = _.capitalize(req.params.coustomListName)
  
//  findOne() for lists because this will find object and find()  find a array

    listModel.findOne({name : coustomName }, (err, listDoc) => {
        if(!err){
           if(!listDoc){

          //  if list does not exist then create one

          const coustomList = new listModel({
            name : coustomName ,
            itemsList : itemArray
          })

          coustomList.save();

          res.redirect("/" + coustomName)
           }
           else{
          //  if list exist then 
            res.render("list", { listDay: day, listTitle: listDoc.name , newListItems: listDoc.itemsList })
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

app.listen(port, function() {
  console.log("Server started successfully :)");
});
