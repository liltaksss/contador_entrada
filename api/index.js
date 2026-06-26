const express = require("express");
const { Pool } = require("pg");

const app = express();
const connectionString = process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

const ENTRY_TYPES = {
  antecipado: 1,
  hora: 1,
  convidado: 1,
  correcao: -1,
};

const getSummary = async () => {
  const client = await pool.connect();
  try {
    const { rows: logs } = await client.query("SELECT * FROM entries ORDER BY horario DESC");
    
    let total = 0;
    const counts = { antecipado: 0, hora: 0, convidado: 0, correcao: 0 };

    for (const row of logs) {
      total += row.delta;
      if (counts[row.tipo] !== undefined) {
        counts[row.tipo]++;
      }
    }

    return {
      total: Math.max(total, 0),
      raw_total: total,
      counts,
      logs,
    };
  } finally {
    client.release();
  }
};

app.get("/api/state", async (req, res) => {
  try {
    const summary = await getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.post("/api/entry", async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!ENTRY_TYPES[tipo]) {
      return res.status(400).json({ error: "Tipo de entrada inválido." });
    }

    const delta = ENTRY_TYPES[tipo];
    await pool.query(
      "INSERT INTO entries (tipo, delta) VALUES ($1, $2)",
      [tipo, delta]
    );

    const summary = await getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    await pool.query("TRUNCATE TABLE entries RESTART IDENTITY");
    const summary = await getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.get("/api/download.csv", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT horario, tipo, delta FROM entries ORDER BY horario ASC");
    
    let csv = "horario,tipo,delta\n";
    rows.forEach(row => {
      csv += `${row.horario.toISOString()},${row.tipo},${row.delta}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("registros.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = app;