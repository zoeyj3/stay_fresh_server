const express = require("express");
const app = express();
const PORT = 8080;
const fs = require("fs");
const uniqid = require("uniqid");
const cors = require("cors")


app.use(express.json());
app.use(cors());
app.use("/static-files", express.static("public"));

app.listen(8080, function() {
    console.log("Server is running on port " + 8080);
});



//parse JSON file
function readFullInventoryList(){
    const inventoryList = fs.readFileSync('./data/inventory.json')
    const parsedInventoryList = JSON.parse(inventoryList)
    return parsedInventoryList
}

//get full list
app.get("/inventory", (req, res) => {
    res.json(readFullInventoryList());
});

//get individual inventory by id
app.get("/inventory/:id", (req, res) => {
    const parsedInventoryList = readFullInventoryList()
    const individualInventory = parsedInventoryList.filter((item) => item.id == req.params.id)
    // id validation check
    const inventoryChecked = parsedInventoryList.find((item) => item.id == req.params.id)
    if(!inventoryChecked){
        return res.status(404).send('item not found');
    }
    res.json(individualInventory);
});
// get individual inventory by name
app.get("")




app.use((req, res, next) => {
    console.log("Middleware running on router");
    next();
});

// add inventory
app.post("/add", (req, res) =>{
    const parsedInventoryList = readFullInventoryList()
    const inventoryRepeatList = parsedInventoryList.find((item) => item.name.toUpperCase() == req.body.name.toUpperCase())
    if(inventoryRepeatList){
        return res.status(409).json(inventoryRepeatList)
    }

    const newInventory ={
        id:uniqid(),
        name:req.body.name,
        storing_place:req.body.storing_place,
        create_time:req.body.create_time,
        best_before:req.body.best_before,
        servings:req.body.servings,
        is_deleted:req.body.is_deleted
    };
    const newList = readFullInventoryList();
    newList.push(newInventory);
    fs.writeFileSync('./data/inventory.json',JSON.stringify(newList));
    res.status(201).json(newList);
})

// update inventory
app.put("/inventory/:id", (req, res) => {
    const parsedInventoryList = readFullInventoryList()
    
    isinventoryChecked = false

    for(let i=0; i<parsedInventoryList.length; i++)
    {
        if(parsedInventoryList[i].id==req.params.id){
            isinventoryChecked = true
            parsedInventoryList[i].name = req.body.name
            parsedInventoryList[i].create_time = req.body.create_time
            parsedInventoryList[i].storing_place = req.body.storing_place
            parsedInventoryList[i].best_before = req.body.best_before
            parsedInventoryList[i].servings = req.body.servings
        }
    }

    if(!isinventoryChecked){
        return res.status(404).send('item not found');
    }
    //replace the new item
    fs.writeFileSync('./data/inventory.json',JSON.stringify(parsedInventoryList));
    res.status(201).json(parsedInventoryList);
});