const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.get('/status', async (req, res) => {
  exec('stellar --version', (err, stdout, stderr) => {
    if (err) return res.json({ ok: false, error: stderr || err.message });
    res.json({ ok: true, stellar: stdout.trim() });
  });
});

// Upload file endpoint (saves locally; optional IPFS pinning can be added via env vars)
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ ok: true, file: { path: req.file.path, filename: req.file.filename, url: fileUrl } });
});

// Serve uploaded files for quick local dev
app.use('/uploads', express.static(uploadsDir));

// Generic contract invoke wrapper using the `stellar` CLI.
// Body: { contractId, functionName, args: [{ name, value }], source }
app.post('/invoke', (req, res) => {
  const { contractId, functionName, args = [], source = 'blockhire-deployer', network = 'testnet' } = req.body;
  if (!contractId || !functionName) return res.status(400).json({ error: 'missing contractId or functionName' });

  // Build CLI args: stellar contract invoke --id <contractId> --source <source> -n testnet -- <functionName> --arg1 value1 --arg2 value2
  let cli = `stellar contract invoke --id ${contractId} --source ${source} -n ${network} -- ${functionName}`;
  for (const a of args) {
    // for safety, only allow simple string/number args; the frontend should construct correct forms
    const safeName = a.name.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeValue = String(a.value).replace(/"/g, '\\"');
    cli += ` --${safeName} "${safeValue}"`;
  }

  exec(cli, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ ok: false, error: stderr || err.message, cmd: cli });
    res.json({ ok: true, out: stdout });
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`BlockHire backend listening on http://localhost:${port}`));
