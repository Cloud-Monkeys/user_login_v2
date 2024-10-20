const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'oh_user_db'
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

    db.query('INSERT INTO users SET ?', { user_id: user_id, last: last, first: first, email: email, password: hashedPassword, role_id: role_id }, (error, results) => {
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
    } else {
      return res.render('login', {
        message: 'Login successful'
      });
    }
  });
};