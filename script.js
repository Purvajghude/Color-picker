// --- CONFIGURATION ---
// Set this variable to the name you want to ALWAYS win.
// If empty "", the wheel is fair.
const RIGGED_NAME = "Ved";

// Set this to a name you want to NEVER win.
const AVOID_NAME = "Purvaj";
// ---------------------

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const textarea = document.getElementById('nameInput');
const spinBtn = document.getElementById('spinBtn');
const modal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');

let names = [];
let colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF"];
let currentAngle = 0;
let isSpinning = false;
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let radius = canvas.width / 2 - 20; // Padding

// Update wheel when typing
textarea.addEventListener('input', updateNames);

function updateNames() {
    // Split by newline and remove empty entries
    names = textarea.value.split('\n').filter(n => n.trim() !== '');
    drawWheel();
}

function drawWheel() {
    if (names.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    let sliceAngle = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < names.length; i++) {
        let startAngle = currentAngle + i * sliceAngle;
        let endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText(names[i], radius - 30, 10);
        ctx.restore();
    }
}

spinBtn.addEventListener('click', () => {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    modal.classList.add('hidden');

    // --- RIGGING LOGIC START ---
    let winningIndex;

    if (RIGGED_NAME && names.includes(RIGGED_NAME)) {
        // 1. Force Win
        winningIndex = names.indexOf(RIGGED_NAME);
        console.log("Rigged to win: " + RIGGED_NAME);
    } else if (AVOID_NAME && names.includes(AVOID_NAME)) {
        // 2. Force Avoid
        do {
            winningIndex = Math.floor(Math.random() * names.length);
        } while (names[winningIndex] === AVOID_NAME);
        console.log("Avoiding: " + AVOID_NAME);
    } else {
        // 3. Fair Spin
        winningIndex = Math.floor(Math.random() * names.length);
    }
    // --- RIGGING LOGIC END ---

    // Calculate Rotation
    // The arrow is at 0 radians (right side). 
    // To land on an index, we need to rotate the wheel counter-clockwise 
    // so that the slice moves to the right side.

    let sliceAngle = (2 * Math.PI) / names.length;

    // Add random extra rotation inside the slice to vary where the pointer lands
    let offset = Math.random() * sliceAngle * 0.8 + (sliceAngle * 0.1);

    let spins = 10; // Number of full rotations
    let targetRotation = (spins * 2 * Math.PI) + (2 * Math.PI) - (winningIndex * sliceAngle) - (sliceAngle / 2);

    let start = null;
    let duration = 4000; // 4 seconds

    function animate(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        let ease = 1 - Math.pow(1 - progress / duration, 3); // Ease out cubic

        if (progress < duration) {
            currentAngle = targetRotation * ease;
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            currentAngle = targetRotation % (2 * Math.PI); // Normalize angle
            drawWheel();
            isSpinning = false;
            showResult(names[winningIndex]);
        }
    }
    requestAnimationFrame(animate);
});

function showResult(winner) {
    winnerText.innerText = winner;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// Initial Draw
updateNames();