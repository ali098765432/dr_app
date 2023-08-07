const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtKey = 'ecomm';
const db = require('../config/db');
var router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());

// Create a new instance of the multer storage and set the destination for file uploads (if needed)
const upload = multer({ dest: 'uploads/' });

// Use the multer middleware to parse form data
router.use(upload.single('avatar'));

router.post('/login', async (req, resp) => {
  let email, password;
  if (req.body.email && req.body.password) {
    // If the request is JSON data, get the email and password from the JSON body
    email = req.body.email;
    password = req.body.password;
  } else if (req.file) {
    // If the request is form-data, get the email and password from the form-data fields
    email = req.body.get('email');
    password = req.body.get('password');
  } else {
    return resp.status(400).json({ result: 'Please provide email and password field both' });
  }

  try {
    const loginQuery = 'SELECT * FROM admin WHERE email = ?';
    db.query(loginQuery, [email], async (err, users) => {
      if (err) {
        console.error('Error while logging in:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'No user found.' });
      }

      const user = users[0];

      // Compare the hashed password with the provided password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        jwt.sign({ user }, jwtKey, { expiresIn: '2h' }, async (err, token) => {
          if (err) {
            console.error('Error while signing JWT:', err);
            return resp.status(500).json({ result: 'Something went wrong' });
          }

          // Update the token and status in the database for the logged-in user
          const updateUserQuery = 'UPDATE admin SET token = ?, status = ? WHERE email = ?';
          db.query(updateUserQuery, [token, 1, email], (err, result) => {
            if (err) {
              console.error('Error while updating user:', err);
              return resp.status(500).json({ error: 'Something went wrong, please try again.' });
            }

            resp.json({ result: 'Login successful!' });
          });
        });
      } else {
        resp.status(401).json({ result: 'Invalid password' });
      }
    });
  } catch (error) {
    console.error('Error while logging in:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.post('/logout', async (req, resp) => {
  const { email } = req.body;

  try {
    const findUserQuery = 'SELECT * FROM admin WHERE email = ?';
    db.query(findUserQuery, [email], async (err, users) => {
      if (err) {
        console.error('Error while finding user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'No user found.' });
      }

      // Update the token and status in the database for the logged-out user
      const updateUserQuery = 'UPDATE admin SET token = NULL, status = ? WHERE email = ?';
      db.query(updateUserQuery, [0, email], (err, result) => {
        if (err) {
          console.error('Error while updating user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'Logout successful!' });
      });
    });
  } catch (error) {
    console.error('Error while logging out:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.post('/register', async (req, resp) => {
  let { email, password, name, role } = req.body;

  // Validation: Check if all required fields are provided
  if (!email || !password || !name || !role) {
    return resp.status(400).json({ result: 'Please provide email, password, name, and role.' });
  }

  // Validation: Check if the email is in a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(emailRegex)) {
    return resp.status(400).json({ result: 'Invalid email format.' });
  }

  // Validation: Check if the password is strong enough (example: at least 6 characters)
  if (password.length < 6) {
    return resp.status(400).json({ result: 'Password should be at least 6 characters long.' });
  }

  try {
    // Check if the email already exists in the database
    const checkEmailQuery = 'SELECT * FROM admin WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, users) => {
      if (err) {
        console.error('Error while checking email:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length > 0) {
        return resp.status(409).json({ result: 'Email already exists.' });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Note: Remove the 'id' field from the query since it will be auto-generated by the database
      const registrationQuery = 'INSERT INTO admin (email, password, name, role) VALUES (?, ?, ?, ?)';
      db.query(registrationQuery, [email, hashedPassword, name, role], (err, result) => {
        if (err) {
          console.error('Error while registering user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'Registration successful!' });
      });
    });
  } catch (error) {
    console.error('Error while registering user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.get('/users', async (req, resp) => {
  try {
    // Fetch all users from the pa_user table
    const fetchUsersQuery = 'SELECT * FROM pa_users';
    db.query(fetchUsersQuery, (err, users) => {
      if (err) {
        console.error('Error while fetching users:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      // Return the users as the response
      resp.json({ users });
    });
  } catch (error) {
    console.error('Error while fetching users:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.delete('/users/:userId', async (req, resp) => {
  const userId = req.params.userId;

  try {
    // Check if the user exists in the database
    const findUserQuery = 'SELECT * FROM pa_users WHERE id = ?';
    db.query(findUserQuery, [userId], async (err, users) => {
      if (err) {
        console.error('Error while finding user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'User not found.' });
      }

      // Delete the user from the database
      const deleteUserQuery = 'DELETE FROM pa_users WHERE id = ?';
      db.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
          console.error('Error while deleting user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User deleted successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while deleting user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.patch('/users/:userId/status', async (req, resp) => {
  const userId = req.params.userId;
  const { status } = req.body;

  try {
    // Check if the user exists in the database
    const findUserQuery = 'SELECT * FROM pa_users WHERE id = ?';
    db.query(findUserQuery, [userId], async (err, users) => {
      if (err) {
        console.error('Error while finding user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'User not found.' });
      }

      // Update the status of the user in the database
      const updateUserQuery = 'UPDATE pa_users SET status = ? WHERE id = ?';
      db.query(updateUserQuery, [status, userId], (err, result) => {
        if (err) {
          console.error('Error while updating user status:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User status updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while updating user status:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});


//curd operation doctor

router.get('/doctors', async (req, resp) => {
  try {
    // Fetch all users from the pa_user table
    const fetchUsersQuery = 'SELECT * FROM dr_users';
    db.query(fetchUsersQuery, (err, users) => {
      if (err) {
        console.error('Error while fetching users:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      // Return the users as the response
      resp.json({ users });
    });
  } catch (error) {
    console.error('Error while fetching users:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.delete('/doctors/:userId', async (req, resp) => {
  const userId = req.params.userId;

  try {
    // Check if the user exists in the database
    const findUserQuery = 'SELECT * FROM dr_users WHERE id = ?';
    db.query(findUserQuery, [userId], async (err, users) => {
      if (err) {
        console.error('Error while finding user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'User not found.' });
      }

      // Delete the user from the database
      const deleteUserQuery = 'DELETE FROM dr_users WHERE id = ?';
      db.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
          console.error('Error while deleting user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User deleted successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while deleting user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.patch('/doctors/:userId/status', async (req, resp) => {
  const userId = req.params.userId;
  const { status } = req.body;

  try {
    // Check if the user exists in the database
    const findUserQuery = 'SELECT * FROM dr_users WHERE id = ?';
    db.query(findUserQuery, [userId], async (err, users) => {
      if (err) {
        console.error('Error while finding user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (users.length === 0) {
        return resp.status(404).json({ result: 'User not found.' });
      }

      // Update the status of the user in the database
      const updateUserQuery = 'UPDATE dr_users SET status = ? WHERE id = ?';
      db.query(updateUserQuery, [status, userId], (err, result) => {
        if (err) {
          console.error('Error while updating user status:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User status updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while updating user status:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});


module.exports = router;
