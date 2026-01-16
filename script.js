// --- GLOBALA VARIABLER ---
let isLogin = true;
let currentUser = "";
let myCards = [];
let currentIdx = 0;
let userIP = "Hämtar...";

// 1. HÄMTA IP (Så läraren ser varifrån eleven loggar in)
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => userIP = d.ip)
    .catch(() => userIP = "Dold/VPN");

// 2. HANTERA INLOGGNING OCH REGISTRERING
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Välkommen" : "Skapa konto";
    document.getElementById('reg-fields').style.display = isLogin ? "none" : "block";
    document.getElementById('auth-btn').innerText = isLogin ? "Logga in" : "Registrera";
    document.getElementById('toggle-btn').innerText = isLogin ? "Skapa konto" : "Tillbaka till login";
}

function handleAuth() {
    const u = document.getElementById('user').value.toLowerCase().trim();
    const p = document.getElementById('pass').value.trim();
    const r = document.getElementById('role').value;
    let db = JSON.parse(localStorage.getItem('users_db')) || {};

    if (!isLogin) {
        // Skapa konto
        if (db[u]) return alert("Användarnamnet är redan upptaget!");
        db[u] = { pass: p, role: r };
        localStorage.setItem('users_db', JSON.stringify(db));
        alert("Konto skapat! Logga in nu.");
        toggleAuth();
    } else {
        // Logga in
        if (db[u] && db[u].pass === p) {
            startApp(u, db[u].role);
        } else { 
            alert("Fel användarnamn eller lösenord!"); 
        }
    }
}

// 3. STARTA APPEN (Välj vy baserat på roll)
function startApp(name, role) {
    currentUser = name;
    document.getElementById('auth-box').style.display = 'none';
    
    if (role === 'elev') {
        document.getElementById('elev-app').style.display = 'block';
        document.getElementById('welcome-txt').innerText = "¡Hola " + name + "!";
        myCards = JSON.parse(localStorage.getItem('cards_' + name)) || [];
        renderWords();
        
        // Starta "hjärtslagen" till mittenmannen (api/status.js)
        sendPing(); 
        setInterval(sendPing, 10000); // Skicka var 10:e sekund
    } else {
        document.getElementById('teacher-app').style.display = 'block';
        updateTeacherLive();
        setInterval(updateTeacherLive, 5000); // Läraren uppdaterar var 5:e sekund
    }
}

// 4. KOMMUNIKATION MED MITTENMAN (Vercel API)
async function sendPing() {
    try {
        await fetch('/api/status', {
            method: 'POST',
            body: JSON.stringify({ name: currentUser, ip: userIP })
        });
    } catch (e) {
        console.log("Kunde inte nå api/status.js - kontrollera din Vercel-mapp!");
    }
}

// 5. ELEV-FUNKTIONER (Glosor)
function addChar(c) {
    const spInput = document.getElementById('word-sp');
    spInput.value += c;
    spInput.focus();
}

function addWord() {
    const sv = document.getElementById('word-sv').value.trim();
    const sp = document.getElementById('word-sp').value.trim();
    if (sv && sp) {
        myCards.push({sv, sp});
        localStorage.setItem('cards_' + currentUser, JSON.stringify(myCards));
        document.getElementById('word-sv').value = "";
        document.getElementById('word-sp').value = "";
        renderWords();
    }
}

function renderWords() {
    const list = document.getElementById('word-list');
    list.innerHTML = "<strong>Dina ord:</strong><br>";
    myCards.forEach((c, i) => {
        list.innerHTML += `<div>${c.sp} = ${c.sv} <small style="color:red;cursor:pointer" onclick="deleteWord(${i})">[x]</small></div>`;
    });
}

function deleteWord(i) {
    myCards.splice(i, 1);
    localStorage.setItem('cards_' + currentUser, JSON.stringify(myCards));
    renderWords();
}

function showTab(t) {
    document.getElementById('tab-create').style.display = t === 'create' ? 'block' : 'none';
    document.getElementById('tab-play').style.display = t === 'play' ? 'block' : 'none';
    if(t === 'play') updateCard();
}

function updateCard() {
    document.getElementById('main-card').classList.remove('flipped');
    if (myCards.length > 0) {
        document.getElementById('card-q').innerText = myCards[currentIdx].sv;
        document.getElementById('card-a').innerText = myCards[currentIdx].sp;
    } else {
        document.getElementById('card-q').innerText = "Inga ord än!";
        document.getElementById('card-a').innerText = "Lägg till ord först.";
    }
}

function changeCard(dir) {
    if (myCards.length === 0) return;
    currentIdx = (currentIdx + dir + myCards.length) % myCards.length;
    updateCard();
}

// 6. LÄRAR-FUNKTIONER (Övervakning)
let watchlist = JSON.parse(localStorage.getItem('teacher_watchlist')) || [];

function addToWatchlist() {
    const name = document.getElementById('add-name').value.toLowerCase().trim();
    const pass = document.getElementById('add-pass').value;
    const db = JSON.parse(localStorage.getItem('users_db')) || {};

    if (db[name] && db[name].pass === pass) {
        if (!watchlist.includes(name)) {
            watchlist.push(name);
            localStorage.setItem('teacher_watchlist', JSON.stringify(watchlist));
            updateTeacherLive();
        }
    } else {
        alert("Kunde inte verifiera eleven. Kontrollera namn och lösenord.");
    }
}

async function updateTeacherLive() {
    let onlineData = {};
    try {
        const res = await fetch('/api/status');
        onlineData = await res.json();
    } catch(e) { return; }

    const table = document.getElementById('teacher-table');
    table.innerHTML = "";

    watchlist.forEach(student => {
        const info = onlineData[student];
        const isOnline = info && (Date.now() - info.lastSeen < 25000);
        
        table.innerHTML += `
            <tr>
                <td>${student}</td>
                <td>
                    <span style="color:${isOnline ? '#2ecc71' : '#e74c3c'}">●</span> 
                    ${isOnline ? 'Online' : 'Offline'}
                </td>
                <td>${info ? info.ip : '---'}</td>
            </tr>`;
    });
}
