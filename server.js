const express = require('express');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Pool of API keys (replace with your real keys)
const apiKeyPool = [
    { id: 1, apiKey: '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', status: 'available' },
    { id: 2, apiKey: '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', status: 'available' }
];

let activeSessions = new Map();

app.get('/api/start-session', (req, res) => {
    const availableKey = apiKeyPool.find(key => key.status === 'available');
    if (availableKey) {
        availableKey.status = 'in-use';
        const sessionId = Date.now().toString();
        activeSessions.set(sessionId, availableKey);
        res.json({ success: true, sessionId });
    } else {
        res.json({ success: false, message: 'No available API keys' });
    }
});

app.post('/api/end-session', (req, res) => {
    const { sessionId } = req.body;
    const key = activeSessions.get(sessionId);
    if (key) {
        key.status = 'available';
        activeSessions.delete(sessionId);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/chat', async (req, res) => {
    const { sessionId, message } = req.body;
    const key = activeSessions.get(sessionId);
    
    if (!key) {
        return res.status(400).json({ error: 'Invalid session' });
    }

    const openai = new OpenAI({ apiKey: key.apiKey });
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'ChatGPT API error' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));