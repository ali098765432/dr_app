var express = require('express');
var router = express.Router();
var db  = require('../config/db');


//Get Doctor Reviews by Doctor id
router.get('/dr/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM rating_reviews WHERE dr_id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Rating review not found' });
        } else {
            res.json(results);
        }
    });
});


//Get Patient Given Reviews Patient id
router.get('/pa/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM rating_reviews WHERE pa_id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Rating review not found' });
        } else {
            res.json(results);
        }
    });
});


// Add Review & Ratings
router.post('/add', (req, res) => {
    const { dr_id, pa_id, rating, review } = req.body;
  
    const ratingReview = {
      dr_id,
      pa_id,
      rating,
      review,
    };
  
    db.query('INSERT INTO rating_reviews SET ?', ratingReview, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else {
        res.status(201).json({ message: 'Rating review created successfully' });
      }
    });
});
 

//Update the Patient Given Review
router.put('/pa/:id', (req, res) => {
    const { id } = req.params;
    const { dr_id, pa_id, rating, review } = req.body;
  
    const ratingReview = {
      dr_id,
      pa_id,
      rating,
      review,
    };
  
    db.query('UPDATE rating_reviews SET ? WHERE id = ? AND pa_id = ?', [ratingReview, id, pa_id], (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Rating review not found' });
      } else {
        res.json({ message: 'Rating review updated successfully' });
      }
    });
});
  

// Delete review by Patient
router.delete('/pa/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM rating_reviews WHERE id = ?', [id], (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Rating review not found' });
      } else {
        res.json({ message: 'Rating review deleted successfully' });
      }
    });
});
  
module.exports = router;
