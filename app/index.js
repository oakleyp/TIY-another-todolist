const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const fs = require('fs');
const models = require('../models');

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

//Populate data obj arrays from database
models.Todo.findAll({where: {status: 'incomplete'}}).then((todoitems) => {
    for(var i = 0; i < todoitems.length; i++) {
        let item = todoitems[i];
        data.todos.push({
            id: item.id,
            text: item.textcontent
        });
    }
});

models.Todo.findAll({where: {status: 'complete'}}).then((doneitems) => {
    for(var i = 0; i < doneitems.length; i++) {
        let item = doneitems[i];
        data.done.push({
            id: item.id,
            text: item.textcontent
        });
    }
});

app.get('/', function(req, res) {
    res.render('index', data);
})

app.post('/', function(req, res) {
    if(req.body.addbtn != null) {
        let newitem = models.todo.build({
            textcontent: req.body.todo,
            status: 'incomplete'
        });
        
        newitem.save().then((createditem) => {
            data.todos.push({
                id: createditem.id,
                text: createditem.textcontent,
            })
        })
    } else if(req.body.markbtn != null) {
        let iid = req.body.todoid;
        models.todo.update(
            {status: 'complete'},
            {where: {id: iid}}
        ).then((todos) => {
            //find id in todos array in data obj and splice 
            for(var i = 0; i < data.todos.length; i++) {
                if(data.todos[i].id == iid) {
                    data.todos.splice(i, 1);
                    break;
                }
            }
            
            //add item to done array in data obj
            data.done.push({id: iid, text: req.body.todotext});
        });
        
    } else if(req.body.deletebtn != null) {
        let iid = req.body.todoid;
        models.todo.destroy({
            where: {
                id: iid
            }
        }).then(() => {
            //Find id in done array in data obj and splice out
            for(var i = 0; i < data.done.length; i++) {
                if(data.done[i].id == iid) {
                    data.done.splice(i, 1);
                    break;
                }
            }
        });
    }
    
    res.render('index', data);
})

app.listen(3000, function() {
    console.log("Running express app.");
})