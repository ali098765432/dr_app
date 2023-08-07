var express = require('express');
var router = express.Router();
var db  = require('../config/db');


//Get Auth Detail
router.post('/add', (req, res) => {
    const { phone_no } = req.body;
  
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
  
    // Check if record already exists for the phone number
    db.query('SELECT * FROM auth WHERE phone_no = ?', [phone_no], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length > 0) {
        // Update the existing record with the new OTP
        db.query('UPDATE auth SET otp = ? WHERE phone_no = ?', [otp, phone_no], (error, result) => {
          if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
          } else {
            res.status(200).json({ message: 'OTP updated successfully' });
          }
        });
      } else {
        // Insert a new record with the phone number and OTP
        const authData = {
          phone_no,
          otp,
        };
  
        db.query('INSERT INTO auth SET ?', authData, (error, result) => {
          if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Something went wrong' });
          } else {
            res.status(201).json({ message: 'OTP generated and saved successfully' });
          }
        });
      }
    });
});
  

//Login Doctor
router.post('/dr/check', (req, res) => {
    const { phone_no, otp } = req.body;
  
    db.query('SELECT * FROM auth WHERE phone_no = ? ', [phone_no], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Phone number not exist' });
      } else {
        if (results[0].otp === otp)
        { 
            db.query('SELECT * FROM dr_users WHERE phone_no = ?', [phone_no], (error, drResults) => {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).json({ error: 'Something went wrong' });
            } else if (drResults.length === 0) {
                res.status(404).json({ error: 'Doctor not found' });
            } else {
                const doctor = drResults[0];
                res.json(doctor);
            }
            });
        }else{
            res.status(404).json({ error: 'Authentication Failed' });
        }
      }
    });
});
  


//Login Patient 
router.post('/pa/check', (req, res) => {
    const { phone_no, otp } = req.body;
  
    db.query('SELECT * FROM auth WHERE phone_no = ? ', [phone_no], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Something went wrong' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Phone number not exist' });
      } else {
        if (results[0].otp === otp)
        { 
            db.query('SELECT * FROM pa_users WHERE phone_no = ?', [phone_no], (error, paResults) => {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).json({ error: 'Something went wrong' });
            } else if (paResults.length === 0) {
                res.status(404).json({ error: 'Patient record not found' });
            } else {
                const doctor = paResults[0];
                res.json(doctor);
            }
            });
        }else{
            res.status(401).json({ error: 'Authentication Failed' });
        }
      }
    });
});
  
  
module.exports = router 
 