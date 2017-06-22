const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const fs = require('fs');

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(express.static('public'));

// Set app to use bodyParser()` middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let data = {
    todos: [],
    done: []
}
let save_file = "mainsave.save";

//See if JSON file exists, if so read it into data obj
fs.readFile(save_file, 'utf8', function(err, fdata) {
    if(err) console.log("Error reading file data: ", err);
    else {
        data = JSON.parse(fdata);
    }
})

function writeToJSONFile(json_obj) {
    fs.writeFile(save_file, JSON.stringify(data, null, 4), 'utf-8', function(err) {
        if(err) console.log("Error writing file data: ", data, err);
    })
}


let todosct = data.todos.length;

app.get('/', function(req, res) {
    res.render('index', data);
})

app.get('/clear', function(req, res) {
    data.todos = [];
    data.done = [];
    res.render('index', data);
    writeToJSONFile({});
})

app.post('/', function(req, res) {
    let newtodo = req.body.todo;
    if(req.body.addbtn != null) {
        //Add item to list
        data.todos.push({"id":`${todosct}`, "text": `${newtodo}`});
        res.render('index', data);
        todosct++;
    } else {
        //Mark as complete
        let todoid = req.body.todoid;
        
        //Take out of todos list and put in donw
        for(var i = 0; i < data.todos.length; i++) {
            if(data.todos[i]["id"] == todoid) {
                data.done.push(data.todos[i]);
                data.todos.splice(i, 1);
                break;

            }
        }
        
        res.render('index', data);
    }
    
    //Write to file
    writeToJSONFile(data);
    
})

app.listen(3000, function() {
    console.log("Running express app.");
})