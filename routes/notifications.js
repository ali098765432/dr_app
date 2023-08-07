var express = require('express');
var router = express.Router();
var db  = require('../config/db');


//Get Doctor related & General Notifications
router.get('/dr/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM notifications WHERE dr_id = ? OR (dr_id is Null AND pa_id is Null)', [id], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Notification not found' });
      } else {
        res.json(results);
      }
    });
});


//Get Patient related & General Notifications
router.get('/pa/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM notifications WHERE pa_id = ? OR (dr_id is Null AND pa_id is Null)', [id], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Notification not found' });
      } else {
        res.json(results);
      }
    });
});
  
// Add notifications
// It can be related to specific Doctor
// It can be related to specific Patient
// It can be general
router.post('/add', (req, res) => {
    const { dr_id, pa_id, event, detail } = req.body;
  
    var notification;
    if (dr_id !== null && dr_id !== undefined){
        notification = {
            dr_id,
            event,
            detail,
        };
    }else if(pa_id !== null && pa_id !== undefined){
        notification = {
            pa_id,
            event,
            detail,
        };
    }else{
        notification = {
            event,
            detail,
        };
    }
    db.query('INSERT INTO notifications SET ?', notification, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else {
        res.status(201).json({ message: 'Notification created successfully' });
      }
    });
});
  
module.exports = router