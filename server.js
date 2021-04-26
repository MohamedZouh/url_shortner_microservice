require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const dns = require('dns');
const urlparser = require('url');
const db_uri = process.env.DB_URI;
// Basic Configuration
const port = process.env.PORT || 3000;
try{
  mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("connection success")
}
catch( e ){
  console.log("echec while connecting with error : ");
  console.log(e);
}
console.log(mongoose.connection.readyState);
const schema = new mongoose.Schema({url: 'String'});
const Url = mongoose.model('Url', schema);

app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const bodyurl = req.body.url;
  console.log(bodyurl);
  const adr = dns.lookup(urlparser.parse(bodyurl).hostname,(err,address)=>{
    if(!address){
      res.json({error: 'invalid url'});
    }
    else{
      const url_db = new Url({url:bodyurl});
      console.log('url_db',url_db);
      url_db.save(function(err,data){
        if(err){
          console.log('error',err);
        }
        else{
          console.log('data',data);
          try{
          const data_url = data.url;
          const data_id = data.id;
          res.json({ 
            original_url: data_url, 
            short_url: data_id 
          });
          }
          catch(e){
            console.log(e);
          }
        }
         
      });
    }
    console.log('dns', err);
    console.log('adressd', address);
  });
  console.log('thing', adr);
});

app.get('/api/shorturl/:id_url',(req,res)=>{
  const id_url = req.params.id_url;
  
  Url.findById(id_url,(err,data)=>{
    if(!data){
      res.json({error: 'invalid url'});
    }
    else{
      res.redirect(data.url);
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});