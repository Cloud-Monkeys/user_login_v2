const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

exports.register = (req, res) => {
  console.log(req.body);
  const { user_id, last, first, email, password, confirm_password, role_id } = req.body;
  db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id], async (error, results) => {
    if (error) {
      console.log(error);
    }

    if (results.length > 0) {
      return res.render('register', {
        message: 'That UNI is already in use'
      });
    } else if (password !== confirm_password) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO users SET ?', { user_id: user_id, last_name: last, first_name: first, email: email, password: hashedPassword, role_id: role_id }, (error, results) => {
      if (error) {
        console.log(error);
        return res.render('register', {
          message: 'An error occurred'
        });
      } else {
        console.log(results);
        return res.render('register', {
          message: 'User registered'
        });
      }
    });
  });
};

exports.login = (req, res) => {
  const { user_id, password } = req.body;

  db.query('SELECT * FROM users WHERE user_id = ?', [user_id], async (error, results) => {
    if (error) {
      console.log(error);
      return res.render('login', {
        message: 'An error occurred'
      });
    }

    if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
      return res.render('login', {
        message: 'Email or Password is incorrect'
      });
    } 
     const role = results[0].role_id;
     const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

     if (role === 1) {
      console.log("st")
       return res.status(200).json({ message: 'Login successful', role: 'student', redirectUrl: '/student/home', token: token });
     } else if (role === 0) {
      console.log("teacher")
       return res.status(200).json({ message: 'Login successful', role: 'teacher', redirectUrl: '/teacher/home', token: token });
     } else {
       return res.status(400).json({ message: 'Unknown role' });
     }
   } 
  )};
