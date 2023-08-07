var express = require('express');
var router = express.Router();
var db  = require('../config/db');


// display user page
router.get('/list', (req, res)=> {
    db.query('SELECT * FROM pa_users ORDER BY id asc',function(err,rows) {
        if(err) {
            res.status('err',err);   
        } else {
            const patientList = rows.map((user) => {
                const imageData = (user.img !==null) ? user.img.toString('base64') : user.img
                return { ...user, img: imageData };
            });
            res.status(200).send({
            message: "Data fetched successfully",
            data: patientList
            });
        }
    });
});


// Get a specific user
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM pa_users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({...results[0], img: (results[0].img !==null) ? results[0].img.toString('base64') : results[0].img});
        }
    });
});


// Get a specific user on basis of Phone-No
router.post('/detail', (req, res) => {
    const { phone_no } = req.body;
    db.query('SELECT * FROM pa_users WHERE phone_no = ?', [phone_no], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(results[0]);
        }
    });
});

  
// Create a new user
router.post('/add', (req, res) => {
    const {
        f_name,
        l_name,
        phone_no,
        email,
        address,
        gender,
        image
    } = req.body;
    
    const img = Buffer.from(image, 'base64');

    const user = {
        f_name,
        l_name,
        phone_no,
        email,
        address,
        gender,
        img
    };
    
    db.query('INSERT INTO pa_users SET ?', user, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else {
            res.status(201).json({ message: 'User created successfully', id: result.insertId });
        }
    });
});


// Update an existing user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        f_name,
        l_name,
        phone_no,
        email,
        gender,
        address,
        image
    } = req.body;
    
    const img = Buffer.from(image, 'base64');
    
    const user = {
        f_name,
        l_name,
        phone_no,
        email,
        gender,
        address,
        img
    };
    
    db.query('UPDATE pa_users SET ? WHERE id = ?', [user, id], (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    });
});


// Delete a user
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM pa_users WHERE id = ?', [id], (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
});


module.exports = router;