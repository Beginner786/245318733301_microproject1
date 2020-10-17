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
app.post('/hospdetbyid', middleware.checkToken,function(req,res){
        var hid=req.body.hid;
        db.collection("hospital").find({"hospid":req.body.hid}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.post('/hospdetbynm', middleware.checkToken,function(req,res){
        var hn=req.body.hn;
        db.collection("hospital").find({"hospname":new RegExp(hn,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.post('/hospdetbyloc', middleware.checkToken,function(req,res){
        var hloc=req.body.hloc;
        db.collection("hospital").find({"hosplocation":new RegExp(hloc,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.post('/hospdetbycont', middleware.checkToken,function(req,res){
        var hcont=req.body.hcont;
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
app.post('/ventdetbyid', middleware.checkToken,function(req,res){
        var vtid=req.body.vtid;
        db.collection("ventilator").find({"ventid":vtid}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });

    });
app.post('/ventdetbystat', middleware.checkToken,function(req,res){
        var vs=req.body.vs;
        db.collection("ventilator").find({"ventstat":vs}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });
app.post('/ventdetbynm', middleware.checkToken,function(req,res){
        var hn=req.body.hn;
        db.collection("ventilator").find({"hospname":new RegExp(hn,'i')}).toArray(function(err,result){
            if(err) throw err;
            res.send(result);
            });
    });

app.delete('/delvent', middleware.checkToken,(req,res)=>{
    var vtid=req.body.vtid;
    try{
        db.collection("ventilator").deleteMany({"ventid":vtid});
    }
    catch(e){res.send("Details not found for "+vtid+" to delete it!");console.log(e);}
    res.send("Details of Ventilator(s) having ventilator ID as "+vtid+" has been succesfully deleted");
});

app.post('/updateventbynm', middleware.checkToken,(req,res)=>{
    db.collection("ventilator").updateMany({"hospname":req.body.hn},[{$set:{"ventstat":req.body.vs}}]);
    res.send("Details of Ventilator(s) has been succesfully Updated");
});
app.post('/updateventbyid', middleware.checkToken,(req,res)=>{
        db.collection("ventilator").updateMany({"ventid":req.body.vtid},[{$set:{"ventstat":req.body.vs}}]);
    res.send("Details of Ventilator(s) has been succesfully Updated");
});

app.listen(3000);