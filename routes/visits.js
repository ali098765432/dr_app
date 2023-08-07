var express = require('express');
var router = express.Router();
var db  = require('../config/db');

//Add Visit
router.post('/add', (req, res) => {
    const { dr_id, pa_id, visit_no, charges, date_time, detail} = req.body;
    const start_date_time = new Date(date_time)
    const visits = {
      dr_id,
      pa_id,
      visit_no,
      charges,
      start_date_time,
      detail: JSON.stringify(detail),
    };
  
    db.query('INSERT INTO visits SET ?', visits, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else {
        res.status(201).json({ message: 'Visits record added successfully' });
      }
    });
});


// Get Doctor Visits
router.get('/dr/:id', (req, res) => {
    const { id} = req.params;
    const { pending, rejected, done } = req.query
    var query = 'SELECT * FROM visits \
                LEFT JOIN dr_users ON dr_id = dr_users.id  \
                WHERE dr_id = ?'
    if (pending!== null && pending!== undefined){
      query += " AND is_pending= " + pending
    }
    if (rejected!== null && rejected!== undefined){
      query += " AND is_rejected= " + rejected
    }
    if (done!== null && done!== undefined){
      query += " AND is_done= " + done
    }
    db.query(query, [id], (error, results) => {
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


// Get Patient Visits
router.get('/pa/:id', (req, res) => {
    const { id } = req.params;
    const { pending, rejected, done } = req.query
    var query = 'SELECT * FROM visits \
                LEFT JOIN pa_users ON pa_id = pa_users.id  \
                WHERE pa_id = ?'
    if (pending!== null && pending!== undefined){
      query += " AND is_pending= " + pending
    }
    if (rejected!== null && rejected!== undefined){
      query += " AND is_rejected= " + rejected
    }
    if (done!== null && done!== undefined){
      query += " AND is_done= " + done
    }
    db.query(query, [id], (error, results) => {
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


//Update Visit detail
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { dr_id, pa_id, visit_no, charges, date_time, detail, is_pending, is_done, is_rejected } = req.body;
    const start_date_time = new Date(date_time);
   
    const notification = {
      dr_id,
      pa_id,
      visit_no,
      charges, 
      start_date_time,
      detail, 
      is_pending, 
      is_done, 
      is_rejected 
    };
  
    db.query('UPDATE visits SET ? WHERE id = ?', [notification, id], (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Notification not found' });
      } else {
        res.json({ message: 'Visit updated successfully' });
      }
    });
});
  
module.exports = router