// Константы и глобальные переменные
const DIFFICULTY = {
    EASY: { name: 'лёгкий', fish: 3 },
    MEDIUM: { name: 'средний', fish: 5 },
    HARD: { name: 'сложный', fish: 10 },
};

const FISH_TYPES = ['карп', 'щука', 'окунь', 'лещ', 'сом', 'форель', 'лосось', 'осётр'];

let caughtCount = 0;
let escapedCount = 0;
let totalFish = 0;
let currentDifficulty = DIFFICULTY.MEDIUM;
let isPlaying = false;

// Функции для работы с рыбами
function spawnFish(count) {
    const fishPromises = [];
    
    for (let i = 0; i < count; i++) {
        const fishPromise = new Promise((resolve, reject) => {
            const delay = getRandomDelay();
            const fishType = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
            const fishId = `fish-${i}-${Date.now()}`;
            
            setTimeout(() => {
                if (shouldCatch()) {
                    resolve({
                        id: fishId,
                        type: fishType,
                        message: `Поймал ${fishType}!`
                    });
                } else {
                    reject({
                        id: fishId,
                        type: fishType,
                        message: `${fishType} уплыл...`
                    });
                }
            }, delay);
        });
        
        fishPromises.push(fishPromise);
    }
    
    return fishPromises;
}

function getRandomDelay() {
    return Math.floor(Math.random() * 4000) + 1000; // 1-5 секунд
}

function shouldCatch() {
    return Math.random() < 0.7; // 70% вероятность поймать
}

function createFishElement(fishId, fishType) {
    const fishElement = document.createElement('div');
    fishElement.className = 'fish';
    fishElement.id = fishId;
    fishElement.textContent = '🐟';
    fishElement.title = fishType;
    
    const top = Math.random() * 120 + 20;
    const left = Math.random() * 300 + 100;
    fishElement.style.top = `${top}px`;
    fishElement.style.left = `${left}px`;
    
    return fishElement;
}

// Функции для UI
function updateUI(result) {
    caughtCount = result.caught;
    escapedCount = result.escaped;
    totalFish = result.total;
    
    document.getElementById('caughtCount').textContent = caughtCount;
    document.getElementById('escapedCount').textContent = escapedCount;
    document.getElementById('remainingCount').textContent = totalFish - caughtCount - escapedCount;
}

function addEventToLog(message, type) {
    const eventsLog = document.getElementById('eventsLog');
    const eventElement = document.createElement('div');
    eventElement.className = `event ${type}`;
    eventElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    eventsLog.appendChild(eventElement);
    eventsLog.scrollTop = eventsLog.scrollHeight;
}

function showFishInRiver(fishId, fishType) {
    const fishesContainer = document.getElementById('fishesContainer');
    const fishElement = createFishElement(fishId, fishType);
    fishesContainer.appendChild(fishElement);
    return fishElement;
}

function animateFishCatch(fishElement) {
    fishElement.classList.add('caught');
    setTimeout(() => {
        if (fishElement.parentNode) {
            fishElement.parentNode.removeChild(fishElement);
        }
    }, 500);
}

function animateFishEscape(fishElement) {
    fishElement.classList.add('escaped');
    setTimeout(() => {
        if (fishElement.parentNode) {
            fishElement.parentNode.removeChild(fishElement);
        }
    }, 500);
}

function animateBearCatch() {
    const bear = document.querySelector('.bear');
    bear.classList.add('catching');
    setTimeout(() => bear.classList.remove('catching'), 300);
}

function showResults(result) {
    const resultsDiv = document.getElementById('results');
    const finalStatsDiv = document.getElementById('finalStats');
    
    let message = '';
    if (result.caught === 0) {
        message = '😞 Медведь остался голодным...';
    } else if (result.caught <= 2) {
        message = '😊 Медведь немного перекусил';
    } else if (result.caught <= 5) {
        message = '😄 Медведь сыт и доволен!';
    } else {
        message = '🎉 Медведь поймал целый пир!';
    }
    
    finalStatsDiv.innerHTML = `
        <p>Поймано рыбы: <strong>${result.caught}</strong></p>
        <p>Уплыло рыбы: <strong>${result.escaped}</strong></p>
        <p style="margin-top: 10px; font-size: 1.2em;">${message}</p>
    `;
    
    resultsDiv.classList.remove('hidden');
}

function resetUI() {
    caughtCount = 0;
    escapedCount = 0;
    totalFish = 0;
    
    document.getElementById('caughtCount').textContent = '0';
    document.getElementById('escapedCount').textContent = '0';
    document.getElementById('remainingCount').textContent = '0';
    
    document.getElementById('eventsLog').innerHTML = '';
    document.getElementById('fishesContainer').innerHTML = '';
    
    addEventToLog('Рыбалка началась! Ждём поклёвки...', 'caught');
}

function updateDifficultyDisplay() {
    document.querySelectorAll('.btn.easy, .btn.medium, .btn.hard').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });

    const selectedBtn = document.querySelector(`.btn.${currentDifficulty.name.toLowerCase()}`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
}

// Основная игровая логика
async function startGame(difficulty) {
    const totalFish = difficulty.fish;
    const fishes = spawnFish(totalFish);
    
    let caught = 0;
    let escaped = 0;
    
    // Создаем визуальные элементы для рыб
    fishes.forEach((fishPromise, index) => {
        const fishType = `Рыбка ${index + 1}`;
        const fishId = `fish-${index}-${Date.now()}`;
        showFishInRiver(fishId, fishType);
    });
    
    // Обрабатываем каждую рыбу в реальном времени
    for (let i = 0; i < fishes.length; i++) {
        try {
            const result = await fishes[i];
            animateBearCatch();
            animateFishCatch(document.getElementById(result.id));
            addEventToLog(result.message, 'caught');
            caught++;
        } catch (error) {
            animateFishEscape(document.getElementById(error.id));
            addEventToLog(error.message, 'escaped');
            escaped++;
        }
        
        // Обновляем статистику
        updateUI({ caught, escaped, total: totalFish });
        
        // Небольшая пауза между анимациями
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return { caught, escaped, total: totalFish };
}

// Обработчики событий
function initEventListeners() {
    // Кнопки выбора сложности
    document.querySelectorAll('.btn.easy, .btn.medium, .btn.hard').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty.toUpperCase();
            currentDifficulty = DIFFICULTY[difficulty];
            updateDifficultyDisplay();
        });
    });

    // Кнопка начала игры
    document.getElementById('startBtn').addEventListener('click', async () => {
        if (!isPlaying) {
            isPlaying = true;
            document.getElementById('startBtn').disabled = true;
            resetUI();

            try {
                const result = await startGame(currentDifficulty);
                showResults(result);
            } catch (error) {
                console.error('Ошибка в игре:', error);
            } finally {
                isPlaying = false;
                document.getElementById('startBtn').disabled = false;
            }
        }
    });

    // Кнопка перезапуска
    document.getElementById('restartBtn').addEventListener('click', () => {
        resetUI();
        document.getElementById('results').classList.add('hidden');
        document.getElementById('startBtn').disabled = false;
    });
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateDifficultyDisplay();
    addEventToLog('Готов к рыбалке! Выбери уровень сложности и нажми "Начать рыбалку!"', 'caught');
});
