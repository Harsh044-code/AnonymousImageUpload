const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');

const app = express();

const staticPath = path.join(__dirname, '../public');
const PORT = 4000;

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, shortid.generate() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the public directory
app.use(express.static(staticPath));

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    const uniqueCode = shortid.generate();
    // Do something with the uploaded file and unique code here (e.g. save them to a database)
    res.send(uniqueCode);
});

// Handle file retrievals
app.get('/retrieve/:code', (req, res) => {
    const code = req.params.code;
    // Do something with the code here (e.g. look up the file in a database)
    // If the file exists, you can send it to the client using res.sendFile()
    // If the file does not exist, you can send an error message to the client using res.status(404).send('File not found')
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account key file
const serviceAccount = require('../serviceAccountkey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://anonymous-data-sharing-default-rtdb.asia-southeast1.firebasedatabase.app' // Replace with your project's database URL
});

// Get a reference to the Firebase Realtime Database
const db = admin.database();

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    const uniqueCode = shortid.generate();
    const fileRef = db.ref('files/' + uniqueCode);
    const file = {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
    };
    fileRef.set(file).then(() => {
        res.send(uniqueCode);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Internal server error');
    });
});

app.get('/retrieve/:code', (req, res) => {
    const code = req.params.code;
    const fileRef = db.ref('files/' + code);
    fileRef.once('value').then((snapshot) => {
        const file = snapshot.val();
        if (file) {
            res.sendFile(path.join(__dirname, 'uploads', file.filename));
        } else {
            res.status(404).send('File not found');
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send('Internal server error');
    });
});

app.get('/', (req, res) => {
    path.join(__dirname, 'public', 'index.html');
});