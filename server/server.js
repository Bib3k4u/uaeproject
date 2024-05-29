const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config(); 
const { Sequelize, DataTypes } = require('sequelize');

// Sequelize setup
// const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// Model definition
const Pdf = sequelize.define('Pdf', {
  ServiceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ChooseService: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING, // Adding City field
    allowNull: false
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  }
});

// Express setup
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// PDF upload endpoint
app.post('/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { ServiceName, ChooseService, contactNo, Name, email } = req.body;
    const { originalname, buffer } = req.file;

    const pdf = await Pdf.create({
      ServiceName,
      ChooseService,
      contactNo,
      Name,
      email,
      name: originalname,
      data: buffer
    });

    res.status(201).json(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});




// Get all PDF entries
// Get all PDF entries
app.get('/pdf', async (req, res) => {
  try {
    const pdfList = await Pdf.findAll();
    res.json(pdfList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Model definition for ContactForms
const ContactForm = sequelize.define('ContactForm', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// POST endpoint for form submission
app.post('/submit-contact-form', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    const contactFormEntry = await ContactForm.create({
      name,
      phone,
      email,
      subject,
      message
    });
    res.status(201).json(contactFormEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET endpoint to retrieve all contact form entries
app.get('/contact-forms', async (req, res) => {
  try {
    const contactForms = await ContactForm.findAll();
    res.json(contactForms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username, password } });
    if (admin) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.get('/pdf/:id', async (req, res) => {
  try {
    const pdf = await Pdf.findByPk(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Sync database and start server
sequelize.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch(err => console.error('Error syncing database:', err));