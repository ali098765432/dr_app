var express = require('express');
var router = express.Router();
var db  = require('../config/db');

router.post('/add', (req, res) => {
    const { dr_id, detail, week_date } = req.body;
  
    const availabilityData = {
      dr_id,
      detail: JSON.stringify(detail),
      week_date: new Date(week_date),
    };
  
    db.query('INSERT INTO availability SET ?', availabilityData, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else {
            res.status(201).json({ message: 'Availability added successfully' });
        }
    });
});


// Availability of Individual Doctor
router.post('/dr/:id', (req, res) => {
    const { id } = req.params;
    const { week_date, day } = req.body;
  
    db.query('SELECT * FROM availability WHERE dr_id = ? AND week_date = ?', [id, new Date(week_date)], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Availability not found' });
      } else {
        const availability = results[0];
        var detail = JSON.parse(availability.detail);
        if (day !== null && day!== undefined){
            // Filter the detail based on the provided date and day
            detail = detail[day] ? detail[day] : {};
        }
  
        const response = {
          id: availability.id,
          dr_id: availability.dr_id,
          detail: detail,
          date: availability.date,
        };
  
        res.json(response);
      }
    });
});


// Get Availability list of all Doctor
router.post('/list', (req, res) => {
    const { week_date } = req.body;
  
    db.query('SELECT * FROM availability WHERE week_date = ?', [new Date(week_date)], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Availability not found' });
      } else {  
        res.json(results);
      }
    });
});



//Update Availability detail
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { dr_id, detail, week_date} = req.body;
  
    db.query('UPDATE availability SET detail = ? WHERE id = ? AND dr_id = ? AND week_date = ?', 
        [JSON.stringify(detail), id, dr_id, new Date(week_date)], (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Availability record not found' });
      } else {
        res.json({ message: 'Availability updated successfully'});
      }
    });
});
  


module.exports = router;