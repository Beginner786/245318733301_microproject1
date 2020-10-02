const express=require('express');
const app=express();

let server=require('./server');
let middleware=require('./middleware');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='ventilatormgnt';
let db
MongoClient.connect(url, {useUnifiedTopology:true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`connected to the database: ${url}`);
    console.log(`Database: ${dbName}`);
});
app.post('/addhosp', middleware.checkToken,(req,res)=>{
    var hn=req.body.hn;
    var hid=req.body.hid;
    var hloc=req.body.hloc;
    var haddr=req.body.haddr;
    var hcont=req.body.hcont;
    db.collection("hospital").insertOne({"hospname":hn,"hospid":hid, "hosplocation":hloc, "hospaddress":haddr, "hospcontact":hcont});
    res.send("1 hospital details inserted successfully.");
})
app.post('/addvent', middleware.checkToken, (req,res)=>{
    var hid=req.body.hid;
    var vtid=req.body.vtid;
    var vs=req.body.vs;
    var hn=req.body.hn;
    var data={hospid:hid, ventid:vtid, ventstat: vs, hospname:hn};
    db.collection("ventilator").insertOne(data,function(err,result){
        res.json("1 ventilator details inserted successfully.");
    });
});

app.get('/hospdet', middleware.checkToken,function(req,res){
    db.collection("hospital").find().toArray(function(err,result){
        if(err) throw err;
        res.send(result);
        });
    });
app.get('/hospdetbyid', middleware.checkToken,function(req,res){
        var hid=req.query.hid;
        db.collection("hospital").find({"hospid":hid}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.get('/hospdetbynm', middleware.checkToken,function(req,res){
        var hn=req.query.hn;
        db.collection("hospital").find({"hospname":new RegExp(hn,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.get('/hospdetbyloc', middleware.checkToken,function(req,res){
        var hloc=req.query.hloc;
        db.collection("hospital").find({"hosplocation":new RegExp(hloc,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.get('/hospdetbycont', middleware.checkToken,function(req,res){
        var hcont=req.query.hcont;
        db.collection("hospital").find({"hospcontact":hcont}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });

app.get('/ventdet', middleware.checkToken,function(req,res){
    db.collection("ventilator").find().toArray(function(err,result){
        if(err) throw err;
        res.send(result);
        });
    });
app.get('/ventdetbyid', middleware.checkToken,function(req,res){
        var vtid=req.query.vtid;
        db.collection("ventilator").find({"ventid":vtid}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });

    });
app.get('/ventdetbystat', middleware.checkToken,function(req,res){
        var vs=req.query.vs;
        db.collection("ventilator").find({"ventstat":vs}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.get('/ventdetbynm', middleware.checkToken,function(req,res){
        var hn=req.query.hn;
        db.collection("ventilator").find({"hospname":new RegExp(hn,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });

app.delete('/delvent', middleware.checkToken,(req,res)=>{
    var vtid=req.query.vtid;
    try{
        db.collection("ventilator").deleteMany({"ventid":vtid});
    }
    catch(e){res.send("Details not found for "+vtid+" to delete it!");console.log(e);}
    res.send("Details of Ventilator(s) having ventilator ID as "+vtid+" has been succesfully deleted");
});

app.put('/updateventbynm', middleware.checkToken,(req,res)=>{
    db.collection("ventilator").updateMany({"hospname":req.query.hn},[{$set:{"ventstat":req.query.vs}}]);
    res.send("Details of Ventilator(s) has been succesfully Updated");
});
app.put('/updateventbyid', middleware.checkToken,(req,res)=>{
        db.collection("ventilator").updateMany({"ventid":req.query.vtid},[{$set:{"ventstat":req.query.vs}}]);
    res.send("Details of Ventilator(s) has been succesfully Updated");
});

app.listen(3000);