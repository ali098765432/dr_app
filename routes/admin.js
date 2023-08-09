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
// router.post('/login', async (req, resp) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return resp.status(400).json({ result: 'Please provide email and password field both' });
//   }

//   try {
//     const loginQuery = 'SELECT * FROM admin WHERE email = ?';
//     db.query(loginQuery, [email], async (err, users) => {
//       if (err) {
//         console.error('Error while logging in:', err);
//         return resp.status(500).json({ error: 'Something went wrong, please try again.' });
//       }

//       if (users.length === 0) {
//         return resp.status(404).json({ result: 'No user found.' });
//       }

//       const user = users[0];

//       // Compare the hashed password with the provided password
//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (passwordMatch) {
//         resp.json({ result: 'Login successful!' });
//       } else {
//         resp.status(401).json({ result: 'Invalid password' });
//       }
//     });
//   } catch (error) {
//     console.error('Error while logging in:', error);
//     resp.status(500).json({ error: 'Something went wrong, please try again.' });
//   }
// });
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
s
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

router.get('/patients', async (req, resp) => {
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

router.delete('/patients/:userId', async (req, resp) => {
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

router.put('/doctors/:userId', async (req, resp) => {
  const userId = req.params.userId;
  const updatedFields = req.body;

  // Validation: Check if the userId is provided
  if (!userId) {
    return resp.status(400).json({ result: 'Please provide the user ID to update.' });
  }

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

      // Generate the SQL update query dynamically based on the provided fields in the request body
      let updateQuery = 'UPDATE dr_users SET ';
      const updateValues = [];

      for (const [key, value] of Object.entries(updatedFields)) {
        updateQuery += `${key} = ?, `;
        updateValues.push(value);
      }

      // Remove the trailing comma and space
      updateQuery = updateQuery.slice(0, -2);

      updateQuery += ' WHERE id = ?';
      updateValues.push(userId);

      // Update the user details in the database
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error('Error while updating user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User details updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while updating user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

//update users
router.put('/patients/:userId', async (req, resp) => {
  const userId = req.params.userId;
  const updatedFields = req.body;

  // Validation: Check if the userId is provided
  if (!userId) {
    return resp.status(400).json({ result: 'Please provide the user ID to update.' });
  }

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

      // Generate the SQL update query dynamically based on the provided fields in the request body
      let updateQuery = 'UPDATE pa_users SET ';
      const updateValues = [];

      for (const [key, value] of Object.entries(updatedFields)) {
        updateQuery += `${key} = ?, `;
        updateValues.push(value);
      }

      // Remove the trailing comma and space
      updateQuery = updateQuery.slice(0, -2);

      updateQuery += ' WHERE id = ?';
      updateValues.push(userId);

      // Update the user details in the database
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error('Error while updating user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User details updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Error while updating user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.post('/doctors', async (req, resp) => {
  const {
    f_name,
    l_name,
    phone_no,
    email,
    address,
    gender,
    profession,
    hospital,
    experience,
    fee,
    status,
    created_at,
    updated_at,
  } = req.body;

  // Validation: Check if all required fields are provided
  if (!f_name || !l_name || !phone_no || !email || !address || !gender || !profession || !hospital || !experience || !fee || !status || !created_at || !updated_at) {
    return resp.status(400).json({ result: 'Please provide all required user details.' });
  }

  try {
    // Insert the new user into the database
    const insertUserQuery =
      'INSERT INTO dr_users (f_name, l_name, phone_no, email, address, gender, profession, hospital, experience, fee, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(
      insertUserQuery,
      [
        f_name,
        l_name,
        phone_no,
        email,
        address,
        gender,
        profession,
        hospital,
        experience,
        fee,
        status,
        created_at,
        updated_at,
      ],
      (err, result) => {
        if (err) {
          console.error('Error while adding user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User added successfully!' });
      }
    );
  } catch (error) {
    console.error('Error while adding user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.post('/patients', async (req, resp) => {
  const {
    f_name,
    l_name,
    phone_no,
    email,
    address,
    gender,
    status,
    created_at,
    updated_at,
  } = req.body;

  // Validation: Check if all required fields are provided
  if (!f_name || !l_name || !phone_no || !email || !address || !gender || !status || !created_at || !updated_at) {
    return resp.status(400).json({ result: 'Please provide all required user details.' });
  }

  try {
    // Insert the new user into the database
    const insertUserQuery =
      'INSERT INTO pa_users (f_name, l_name, phone_no, email, address, gender, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(
      insertUserQuery,
      [f_name, l_name, phone_no, email, address, gender, status, created_at, updated_at],
      (err, result) => {
        if (err) {
          console.error('Error while adding user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        resp.json({ result: 'User added successfully!' });
      }
    );
  } catch (error) {
    console.error('Error while adding user:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.post('/rating-review', async (req, resp) => {
  const { pa_id, dr_id, rating, review } = req.body;

  // Validation: Check if all required fields are provided
  if (!pa_id || !dr_id || !rating || !review) {
    return resp.status(400).json({ result: 'Please provide pa_id, dr_id, rating, and review.' });
  }

  try {
    // Check if the pa_user and dr_user exist in the database
    const checkPaUserQuery = 'SELECT * FROM pa_users WHERE id = ?';
    const checkDrUserQuery = 'SELECT * FROM dr_users WHERE id = ?';

    db.query(checkPaUserQuery, [pa_id], async (err, paUsers) => {
      if (err) {
        console.error('Error while checking pa_user:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      if (paUsers.length === 0) {
        return resp.status(404).json({ result: 'Patient not found.' });
      }

      db.query(checkDrUserQuery, [dr_id], async (err, drUsers) => {
        if (err) {
          console.error('Error while checking dr_user:', err);
          return resp.status(500).json({ error: 'Something went wrong, please try again.' });
        }

        if (drUsers.length === 0) {
          return resp.status(404).json({ result: 'Doctor not found.' });
        }

        // Insert the new rating and review into the database
        const insertRatingReviewQuery =
          'INSERT INTO rating_reviews (pa_id, dr_id, rating, review) VALUES (?, ?, ?, ?)';

        db.query(insertRatingReviewQuery, [pa_id, dr_id, rating, review], (err, result) => {
          if (err) {
            console.error('Error while adding rating and review:', err);
            return resp.status(500).json({ error: 'Something went wrong, please try again.' });
          }

          resp.json({ result: 'Rating and review added successfully!' });
        });
      });
    });
  } catch (error) {
    console.error('Error while adding rating and review:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.get('/doctors/rating-reviews', async (req, resp) => {
  try {
    const fetchDoctorRatingQuery =
      'SELECT dr_users.id AS doctor_id, dr_users.f_name AS doctor_first_name, dr_users.l_name AS doctor_last_name, AVG(rating) AS average_rating, COUNT(*) AS total_reviews,rating_reviews.id ' +
      'FROM rating_reviews ' +
      'INNER JOIN dr_users ON rating_reviews.dr_id = dr_users.id ' +
      'GROUP BY dr_users.id, dr_users.f_name, dr_users.l_name';

    db.query(fetchDoctorRatingQuery, (err, results) => {
      if (err) {
        console.error('Error while fetching doctor ratings and reviews:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      resp.json({ results });
    });
  } catch (error) {
    console.error('Error while fetching doctor ratings and reviews:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});
router.get('/patients/rating-reviews', async (req, resp) => {
  try {
    const fetchDoctorRatingQuery =
      'SELECT dr_users.id AS doctor_id, dr_users.f_name AS doctor_first_name, dr_users.l_name AS doctor_last_name, ' +
      'pa_users.id AS patient_id, pa_users.f_name AS patient_first_name, pa_users.l_name AS patient_last_name, rating, review,rating_reviews.id ' +
      'FROM rating_reviews ' +
      'INNER JOIN dr_users ON rating_reviews.dr_id = dr_users.id ' +
      'INNER JOIN pa_users ON rating_reviews.pa_id = pa_users.id';

    db.query(fetchDoctorRatingQuery, (err, results) => {
      if (err) {
        console.error('Error while fetching doctor ratings and reviews:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      resp.json({ results });
    });
  } catch (error) {
    console.error('Error while fetching doctor ratings and reviews:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.get('/doctors/earnings', async (req, resp) => {
  try {
    const fetchDoctorEarningsQuery =
      'SELECT dr_users.id AS doctor_id, dr_users.f_name AS doctor_first_name, dr_users.l_name AS doctor_last_name, ' +
      'SUM(charges) AS total_earnings ' +
      'FROM earnings ' +
      'INNER JOIN dr_users ON earnings.dr_id = dr_users.id ' +
      'GROUP BY dr_users.id, dr_users.f_name, dr_users.l_name';

    db.query(fetchDoctorEarningsQuery, (err, results) => {
      if (err) {
        console.error('Error while fetching doctor earnings:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      resp.json({ results });
    });
  } catch (error) {
    console.error('Error while fetching doctor earnings:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.get('/locations', async (req, resp) => {
  try {
    const fetchLocationsQuery =
      'SELECT hospital, COUNT(*) AS total_doctors FROM dr_users GROUP BY hospital';

    db.query(fetchLocationsQuery, (err, results) => {
      if (err) {
        console.error('Error while fetching hospital attributes:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      resp.json({ results });
    });
  } catch (error) {
    console.error('Error while fetching hospital attributes:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

router.get('/doctors-details-button', async (req, resp) => {
  try {
    const fetchDoctorsQuery = 'SELECT * FROM dr_users';

    db.query(fetchDoctorsQuery, (err, results) => {
      if (err) {
        console.error('Error while fetching doctors:', err);
        return resp.status(500).json({ error: 'Something went wrong, please try again.' });
      }

      resp.json({ doctors: results });
    });
  } catch (error) {
    console.error('Error while fetching doctors:', error);
    resp.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});


module.exports = router;
