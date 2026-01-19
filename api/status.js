// Detta objekt sparas i serverns minne så länge den är vaken.
// Det håller koll på vilka elever som har pingat nyss.
let onlineStore = {};

export default function handler(req, res) {
  // 1. Tillåt att din hemsida pratar med denna fil (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Om webbläsaren bara kollar läget (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. NÄR ELEVEN SKICKAR DATA (POST)
  if (req.method === 'POST') {
    try {
      // Vercel kan skicka body som sträng eller objekt, vi hanterar båda
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (data.name) {
        // Vi sparar elevens namn, IP och exakt tidpunkt (timestamp)
        onlineStore[data.name] = {
          ip: data.ip || "Okänd",
          lastSeen: Date.now() 
        };
        return res.status(200).json({ message: "Status uppdaterad" });
      } else {
        return res.status(400).json({ error: "Inget namn skickat" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Kunde inte läsa JSON-data" });
    }
  }

  // 3. NÄR LÄRAREN HÄMTAR DATA (GET)
  if (req.method === 'GET') {
    // Skicka tillbaka hela listan på elever till läraren
    return res.status(200).json(onlineStore);
  }

  // Om någon försöker göra något annat (t.ex. DELETE)
  return res.status(405).json({ error: "Metoden tillåts inte" });
}
