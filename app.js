const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const feedbackFile = 'feedback.json';

// Home route to display feedback and the form
app.get('/', (req, res) => {
    fs.readFile(feedbackFile, (err, data) => {
        let feedbackArray = [];
        if (!err) {
            feedbackArray = JSON.parse(data);
        }
        res.render('index', { title: 'About her', feedbacks: feedbackArray });
    });
});

// Route to handle feedback submission
app.post('/submit-feedback', (req, res) => {
    const { name, feedback } = req.body;
    const newFeedback = {
        id: Date.now().toString(), // Unique ID based on current timestamp
        name: name || 'Anonymous',
        feedback: feedback,
        timestamp: new Date().toISOString(),
    };

    fs.readFile(feedbackFile, (err, data) => {
        let feedbackArray = err ? [] : JSON.parse(data);
        feedbackArray.push(newFeedback);

        fs.writeFile(feedbackFile, JSON.stringify(feedbackArray, null, 2), (err) => {
            if (err) {
                console.error('Error saving feedback:', err);
                return res.status(500).send('Error saving feedback');
            }
            res.redirect('/');
        });
    });
});

// Route to handle deleting feedback
app.post('/delete-feedback', (req, res) => {
    const { id } = req.body;

    fs.readFile(feedbackFile, (err, data) => {
        if (err) {
            console.error('Error reading feedback:', err);
            return res.status(500).send('Error reading feedback');
        }

        let feedbackArray = JSON.parse(data);
        feedbackArray = feedbackArray.filter(feedback => feedback.id !== id);

        fs.writeFile(feedbackFile, JSON.stringify(feedbackArray, null, 2), (err) => {
            if (err) {
                console.error('Error deleting feedback:', err);
                return res.status(500).send('Error deleting feedback');
            }
            res.redirect('/');
        });
    });
});

// Route to handle editing feedback (replacing the whole feedback)
app.post('/edit-feedback', (req, res) => {
    const { id, feedback } = req.body;

    fs.readFile(feedbackFile, (err, data) => {
        if (err) {
            console.error('Error reading feedback:', err);
            return res.status(500).send('Error reading feedback');
        }

        let feedbackArray = JSON.parse(data);
        const feedbackIndex = feedbackArray.findIndex(f => f.id === id);
        
        if (feedbackIndex !== -1) {
            feedbackArray[feedbackIndex].feedback = feedback;
            feedbackArray[feedbackIndex].timestamp = new Date().toISOString();

            fs.writeFile(feedbackFile, JSON.stringify(feedbackArray, null, 2), (err) => {
                if (err) {
                    console.error('Error editing feedback:', err);
                    return res.status(500).send('Error editing feedback');
                }
                res.redirect('/');
            });
        } else {
            res.status(404).send('Feedback not found');
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
