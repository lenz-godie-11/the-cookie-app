// the depency credential in our kitchen project 

const express = require('express');
const sqlites3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');


const app = express();

app.use(cors());

app.use(express.json());

//path to the file here,just ensuring that the connection credentials are correct to the respect files i should remember this 

const dbPath = path.resolve(__dirname,'database' , 'kitchen.db');

const db = new sqlites3.Database(dbPath,(err) => {
    if(err)
        return console.error("Database connection:" , err.message);
    console.log('connected to kitchen Database at:' ,dbPath);

});

// initiliazing the table 

db.serialize(() =>{
    db.run('CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY , count INTEGER)');
    db.run('INSERT OR IGNORE INTO inventory (id, count) VALUES(1 ,10)');
});



app.get('/api/stock', (req, res) => {
    db.get("SELECT count FROM inventory WHERE id = 1", (err, row) => {
        res.json(row);
    });
});



app.post('/api/consume',(req,res) =>{
    db.run("UPDATE inventory SET count = count-1 WHERE id=1 AND count > 0",
        function(err) {
            if(this.changes > 0) {
                res.json({ success:true, message: "consumed"});
            }
            else {
                res.status(400).json({ success:false, message: "kitchen is empty"});
            }
        }
    )
}); 


app.listen(5000,() => console.log('Backend running on port 5000'));