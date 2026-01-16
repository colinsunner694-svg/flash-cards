// 1. Variabler och ladda sparade kort
let cards = JSON.parse(localStorage.getItem('my_spanish_cards')) || [];
let currentIndex = 0;

// 2. Funktion för spanska knappar (skriver alltid i 'answer'-rutan)
function insertChar(char) {
    const answerInput = document.getElementById('answer');
    const start = answerInput.selectionStart;
    const end = answerInput.selectionEnd;
    const text = answerInput.value;
    
    // Lägg in tecknet där markören står
    answerInput.value = text.substring(0, start) + char + text.substring(end);
    
    // Fokusera och flytta markören ett steg framåt
    answerInput.focus();
    answerInput.setSelectionRange(start + 1, start + 1);
}

// 3. Spara ett nytt kort
function addFlashcard() {
    const q = document.getElementById('question');
    const a = document.getElementById('answer');
    
    if (q.value.trim() === "" || a.value.trim() === "") {
        alert("Fyll i båda rutorna!");
        return;
    }

    cards.push({ q: q.value, a: a.value });
    localStorage.setItem('my_spanish_cards', JSON.stringify(cards)); // Spara permanent
    
    q.value = ""; 
    a.value = "";
    renderList();
}

// 4. Visa listan med alla kort
function renderList() {
    const listDiv = document.getElementById('flashcard-list');
    listDiv.innerHTML = "<h4>Dina ord:</h4>";
    
    cards.forEach((card, index) => {
        listDiv.innerHTML += `
            <div class="list-item">
                <span>${card.a} = ${card.q}</span>
                <button class="del-btn" onclick="deleteCard(${index})">Ta bort</button>
            </div>
        `;
    });
}

// 5. Ta bort kort
function deleteCard(index) {
    cards.splice(index, 1);
    localStorage.setItem('my_spanish_cards', JSON.stringify(cards));
    renderList();
}

// 6. Byta mellan Skapa och Spela
function showSection(section) {
    document.getElementById('create-section').style.display = section === 'create' ? 'block' : 'none';
    document.getElementById('play-section').style.display = section === 'play' ? 'block' : 'none';
    if(section === 'play') updatePlayCard();
}

// 7. Spela-läget: Uppdatera kortet
function updatePlayCard() {
    const cardElement = document.getElementById('card-element');
    cardElement.classList.remove('flipped'); // Vänd tillbaka till framsidan

    if (cards.length > 0) {
        document.getElementById('display-q').innerText = cards[currentIndex].q;
        document.getElementById('display-a').innerText = cards[currentIndex].a;
        document.getElementById('counter').innerText = `Kort ${currentIndex + 1} av ${cards.length}`;
    } else {
        document.getElementById('display-q').innerText = "Inga kort sparade";
        document.getElementById('display-a').innerText = "Gå tillbaka och skapa!";
    }
}

// 8. Bläddra
function nextCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    updatePlayCard();
}

function prevCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updatePlayCard();
}

// Kör vid start
renderList();