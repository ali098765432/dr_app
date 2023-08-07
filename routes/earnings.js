var express = require('express');
var router = express.Router();
var db  = require('../config/db');

//Add Doctor earning
router.post('/dr/add', (req, res) => {
    const { dr_id, pa_id, visit_id, charges } = req.body;
  
    const earnings = {
      dr_id,
      pa_id,
      visit_id,
      charges,
    };
  
    db.query('INSERT INTO earnings SET ?', earnings, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else {
        res.status(201).json({ message: 'Earnings record added successfully' });
      }
    });
});

// Get Doctor Earnings
router.get('/dr/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM earnings WHERE dr_id = ?', [id], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'No record found' });
      } else {
        res.json(results);
      }
    });
});
  
module.exports = router