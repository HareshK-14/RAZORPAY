const express = require('express');
const router = express.Router();
const http = require('http');
const { execSync } = require('child_process');
const path = require('path');

// Helper to query running Python FastAPI service on port 8000
function fetchFromPython(apiPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:8000${apiPath}`, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Fallback: execute Python CLI runner
function runPythonInvestigation(customerId) {
  const rootDir = path.resolve(__dirname, '..', '..');
  const pyCmd = `python -c "import app; from fastapi.testclient import TestClient; client = TestClient(app.app); print(client.get('/api/investigate/${customerId}').text)"`;
  const output = execSync(pyCmd, {
    cwd: rootDir,
    encoding: 'utf-8',
    timeout: 15000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });
  return JSON.parse(output.trim());
}

function runPythonCustomers() {
  const rootDir = path.resolve(__dirname, '..', '..');
  const pyCmd = `python -c "import app; from fastapi.testclient import TestClient; client = TestClient(app.app); print(client.get('/api/customers').text)"`;
  const output = execSync(pyCmd, {
    cwd: rootDir,
    encoding: 'utf-8',
    timeout: 15000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });
  return JSON.parse(output.trim());
}

// GET /api/customers
router.get('/customers', async (req, res) => {
  try {
    const data = await fetchFromPython('/api/customers');
    return res.json(data);
  } catch (err) {
    try {
      const data = runPythonCustomers();
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
});

// GET /api/investigate/:id
router.get('/:id', async (req, res) => {
  const customerId = req.params.id;
  try {
    const data = await fetchFromPython(`/api/investigate/${customerId}`);
    return res.json(data);
  } catch (err) {
    try {
      const data = runPythonInvestigation(customerId);
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
});

// POST /api/investigate
router.post('/', async (req, res) => {
  try {
    const rootDir = path.resolve(__dirname, '..', '..');
    const payloadJson = JSON.stringify(req.body);
    const pyCmd = `python -c "import app, json; from fastapi.testclient import TestClient; client = TestClient(app.app); print(client.post('/api/investigate', json=${payloadJson}).text)"`;
    const output = execSync(pyCmd, {
      cwd: rootDir,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    return res.json(JSON.parse(output.trim()));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
