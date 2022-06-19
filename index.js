
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

//Connexion à la BDD
//-------------------------------------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",           // <<<< A modifier
    database: 'chicken_run'
})

db.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL");
})
//-------------------------------------------------

//Initialisation du serveur
//-------------------------------------------------
const app = express()
const port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
//-------------------------------------------------


//Routage
//==============================================================================================

//Lecture
//-------------------------------------------------

//Retourne tous les éléments
app.get('/chicken', (req, res)=>{
    db.query('SELECT * FROM chickens', function (error, results, fields) {

        if (error) throw error
        res.send({ error: false, data: results })
    });
})

//Retourne un chicken par son nom
app.get('/chicken/name/:value', (req, res)=>{
    let name = req.params.value

    db.query('SELECT * FROM chickens WHERE NAME = ? ', name, function (error, results, fields) {
        if (error) throw error
        res.send({ error: false, data: results })
    });
})

//Retourne un chicken par son ID
app.get('/chicken/:id', (req, res)=>{
    let id = req.params.id
    
    db.query('SELECT * FROM chickens WHERE ID = ? ', id, function (error, results, fields) {
        if (error) throw error
        res.send({ error: false, data: results })
    });
})

//Suppression
//-------------------------------------------------
app.delete('/chicken/:id', function (req, res) {
    let id = req.params.id;
    
    db.query('DELETE FROM chickens WHERE id = ?', [id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, message: 'Le chicken a été supprimé.' });
    });
}); 

//Ajouter un chicken
//-------------------------------------------------
app.post('/chicken', (req, res) => {
    let chicken = req.body.chicken;
    if (!chicken) 
        return res.status(400).send({ error: true, message: 'Vous devez fournir les caracteristiques du chicken '});

    let name = chicken.NAME;
    let date = chicken.BIRTHDAY;
    let weight = chicken.WEIGHT;
    let farm = chicken.FARM_ID;
    if (!farm) 
        farm = null;

    db.query('INSERT INTO chickens(NAME, BIRTHDAY, WEIGHT, FARM_ID)'+ 
            'VALUES (?, ?, ?, (SELECT ID FROM farmyard WHERE NAME = ?))', [name, date, weight, farm], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, message: 'Le chicken a été ajouté à la BDD.' });    
    })
})

//Modifier un chicken
//-------------------------------------------------
app.put('/chicken/:id', function (req, res) {
    let id = req.params.id;
    let chicken = req.body.chicken;

    if (!id || !chicken) 
        return res.status(400).send({ error: true, message: "Vous devez founrir l'id et les parametres à modifier" });
    
    db.query("UPDATE chickens SET ? WHERE id = ?", [chicken, id], function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, message: 'Le chicken a été modifié.' });
    });
});

//Service "Chicken Run"
//-------------------------------------------------
app.patch('/chicken/run/:id', function (req, res) {
    let id = req.params.id;

    if (!id) 
        return res.status(400).send({ error: true, message: 'Vous devez fournir un id' });    

    db.query('UPDATE chickens SET IS_RUNNING = 1, STEPS = STEPS + 1 WHERE ID = ? ', [id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, message: 'Le chicken vient de faire un pas.' });
    });

})

//Lancement du serveur
//===================================================================================
app.listen(port, ()=>{
    console.log(`Lancement du serveur sur le port ${port}`);
})



//curl localhost:3000/chicken/name/zhang
//curl -d @test_request.json -H "Content-Type: application/json"  localhost:3000/chicken
