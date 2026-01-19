import fetch from 'node-fetch';

const webhookUrl = 'https://din-webhook-url.com';

async function getPublicIp() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
}

export default async function handler(req, res) {
  // ... (ditt befintliga kodblock)

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (data.name) {
        // Hämta IP-adress via extern tjänst
        const ip = await getPublicIp();

        // Spara elevens data
        onlineStore[data.name] = {
          ip: ip,
          lastSeen: Date.now()
        };

        // Skicka till webhook
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            ip: ip,
            timestamp: new Date().toISOString()
          })
        });

        return res.status(200).json({ message: "Status uppdaterad och webhook skickad" });
      } else {
        return res.status(400).json({ error: "Inget namn skickat" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Kunde inte läsa JSON-data" });
    }
  }

  // ... (övrig kod)
}
