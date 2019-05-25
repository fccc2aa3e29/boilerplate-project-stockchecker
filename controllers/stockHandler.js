var expect = require('chai').expect;
var MongoClient = require('mongodb');
const request = require('request-promise-native');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


module.exports = function(req, res){
  
  const sym = [].concat(req.query.stock);  
  const like = req.query.like;
  const ip = req.ip;
    
  MongoClient.connect(CONNECTION_STRING, async function(err, db){
    if (err) res.send("error");
        
    let likes = [];
    let prices = [];
    
    for (let i = 0; i < sym.length; i++){
      prices[i] = await request({uri: `https://api.iextrading.com/1.0/stock/${sym[i]}/price`, json: true});
      likes[i] = 0;
          
      const data = await db.collection('stocks').findOne({stock: sym[i]});
      if (data){
        likes[i] = data.likes;
        if (!data.ips.includes(ip) && like){
          likes[i]++;
          db.collection('stocks').updateOne({stock: sym[i]}, {$inc: {likes: 1}, $push: {ips: ip}}, (err, data) => {
            if (err) res.send("error");
          }); 
        } 
      }
      else if (!data && like){
        likes[i]++;
        db.collection('stocks').insertOne({stock: sym[i], likes: 1, ips: [ip]}, (err, data) => {
          if (err) res.send("error");
        }); 
      }
    }
    
    if (sym.length === 1){
      res.json({stockData: {stock: sym[0], price: prices[0].toString(), likes: likes[0]}});
    }
    else{
      const s = [];
      sym.forEach((x, i) => s.push({stock: sym[i], price: prices[i].toString(), rel_likes: likes[i] - likes[(i+1)%2]}));
      res.json({stockData: s});
    }
  });  
}
