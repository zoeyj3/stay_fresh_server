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

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

//parse JSON file
function readFullInventoryList(){
    const inventoryList = fs.readFileSync('./data/inventory.json')
    const parsedInventoryList = JSON.parse(inventoryList)
    return parsedInventoryList
}

function addDaysToExpire(item){
    const today = new Date()
    const bestBeforeDate = new Date(item.best_before)
    const timeDiff = bestBeforeDate - today
    const days_to_expire = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return { ...item, days_to_expire };
}

//get full list
app.get("/inventory", (req, res) => {
    let parsedInventoryList = readFullInventoryList()
    parsedInventoryList = parsedInventoryList.map(item => addDaysToExpire(item))
    res.json(parsedInventoryList);
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
    individualInventory[0] = addDaysToExpire(individualInventory[0])
    res.json(individualInventory);
});

// get individual inventory by name
app.get("/inventory-name/:name", (req, res) => {
    const parsedInventoryList = readFullInventoryList()
    let individualInventory = parsedInventoryList.filter((item) => item.name.toUpperCase().includes(req.params.name.toUpperCase()))
    // name validation check
    if(!individualInventory || individualInventory.length === 0){
        return res.status(404).send('item not found');
    }
    individualInventory = individualInventory.map(item => addDaysToExpire(item))
    res.json(individualInventory)
    console.log(individualInventory);
});

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
        create_time:getCurrentDate(),
        updated_time:getCurrentDate(),
        best_before:req.body.best_before,
        servings:req.body.servings,
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
            parsedInventoryList[i].updated_time = getCurrentDate()
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

// delete inventory
app.delete("/inventory/:id", (req, res) => {
    const parsedInventoryList = readFullInventoryList()
    
    isinventoryDeleted = false

    for(let i=0; i<parsedInventoryList.length; i++)
    {
        if(parsedInventoryList[i].id==req.params.id){
            isinventoryDeleted = true
            parsedInventoryList.splice(i, 1)
            break;
        }
    }

    if(!isinventoryDeleted){
        return res.status(404).send('item not found');
    }
    //replace the new item
    fs.writeFileSync('./data/inventory.json',JSON.stringify(parsedInventoryList));
    res.status(201).json(parsedInventoryList);
});