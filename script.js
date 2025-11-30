// --- RIGGING CONFIGURATION ---
// Leave empty "" for a fair spin.
const TARGET_NAME = "Ved";
const WIN_PERCENTAGE = 50;
// -----------------------------

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const textarea = document.getElementById('nameInput');
const spinBtn = document.getElementById('spinBtn');
const modal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');

// Mobile Menu Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeMenu = document.getElementById('closeMenu');
const menuOverlay = document.getElementById('menuOverlay');

let names = [];
// A nicer, more modern color palette
let colors = ["#FF6584", "#6C63FF", "#4FD1C5", "#F6E05E", "#FF9F43", "#A8D8EA", "#AA96DA", "#FCBAD3"];
let currentAngle = 0;
let isSpinning = false;
let centerX, centerY, radius;

// --- Mobile Menu Handling ---
function toggleMenu() {
    sidebar.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}
menuToggle.addEventListener('click', toggleMenu);
closeMenu.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', toggleMenu);

// Close menu automatically when spin starts on mobile
function closeMenuOnSpin() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        menuOverlay.classList.remove('active');
    }
}

// --- Wheel Logic ---
function resizeCanvas() {
    // Set canvas resolution to match its display size for sharp rendering
    // We use a fixed large size for the drawing buffer and let CSS scale it down.
    // This ensures sharpness on high-DPI screens.
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    radius = canvas.width / 2 - 10; // Padding
    drawWheel();
}

textarea.addEventListener('input', updateNames);
window.addEventListener('resize', resizeCanvas); // Redraw on window resize

function updateNames() {
    names = textarea.value.split('\n').filter(n => n.trim() !== '');
    drawWheel();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (names.length === 0) return;

    let sliceAngle = (2 * Math.PI) / names.length;

    for (let i = 0; i < names.length; i++) {
        let startAngle = currentAngle + i * sliceAngle;
        let endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = colors[i % colors.length];
        // Add a subtle white border between slices
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.fill();
        ctx.stroke();

        // Text Rendering
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        // Dynamic font size based on number of names
        let fontSize = names.length > 12 ? 24 : names.length > 6 ? 32 : 40;
        ctx.font = `bold ${fontSize}px Poppins, Arial`;
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 5;
        ctx.fillText(names[i], radius - 40, fontSize / 3);
        ctx.restore();
    }

    // Center pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
}

spinBtn.addEventListener('click', () => {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    modal.classList.add('hidden');
    closeMenuOnSpin();

    // --- RIGGING LOGIC ---
    // --- RIGGING LOGIC (PERCENTAGE BASED) ---
    let winningIndex;

    // Check if the Target Name actually exists in the list
    if (TARGET_NAME && names.includes(TARGET_NAME)) {

        // Generate a random number between 0 and 100
        let chance = Math.random() * 100;

        if (chance < WIN_PERCENTAGE) {
            // CASE 1: The Rigged Win (e.g., falls within the 80%)
            winningIndex = names.indexOf(TARGET_NAME);
            console.log(`Rigged Win! (${Math.floor(chance)}% < ${WIN_PERCENTAGE}%)`);
        } else {
            // CASE 2: The "Bad Luck" (e.g., the remaining 20%)
            // We must pick someone who is NOT the target
            let otherIndices = [];
            names.forEach((name, index) => {
                if (name !== TARGET_NAME) {
                    otherIndices.push(index);
                }
            });

            // If there are other people, pick one of them randomly
            if (otherIndices.length > 0) {
                let randomIndex = Math.floor(Math.random() * otherIndices.length);
                winningIndex = otherIndices[randomIndex];
                console.log(`Natural Loss. (${Math.floor(chance)}% > ${WIN_PERCENTAGE}%)`);
            } else {
                // If the target is the ONLY name on the list, they have to win
                winningIndex = names.indexOf(TARGET_NAME);
            }
        }
    } else {
        // Fallback: If target name isn't in the list, spin fairly
        winningIndex = Math.floor(Math.random() * names.length);
    }
    // ----------------------------------------
    // ---------------------

    let sliceAngle = (2 * Math.PI) / names.length;
    // Add randomness within the slice so it doesn't always land in the dead center
    let randomOffset = Math.random() * sliceAngle * 0.8 + (sliceAngle * 0.1);

    // Calculate target rotation: 
    // 1. Many full spins (e.g., 8)
    // 2. Rotate to 0 position (+2PI)
    // 3. Subtract winning index position
    // 4. Subtract half slice to center it, then add random offset.
    let targetRotation = (8 * 2 * Math.PI) + (2 * Math.PI) - (winningIndex * sliceAngle) - randomOffset;

    let start = null;
    let duration = 5000; // 5 seconds spin

    function animate(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        // Easing function for realistic spin-down (cubic-bezier equivalent)
        let ease = 1 - Math.pow(1 - progress / duration, 4);

        if (progress < duration) {
            currentAngle = targetRotation * ease;
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            showResult(names[winningIndex]);
        }
    }
    requestAnimationFrame(animate);
});

function showResult(winner) {
    winnerText.innerText = winner;
    modal.classList.remove('hidden');
    // Add festive confetti or sound here if desired
}

function closeModal() {
    modal.classList.add('hidden');
    // Reset angle slightly to avoid visual glitch on next spin start
    currentAngle = currentAngle % (2 * Math.PI);
    drawWheel();
}

// Initialize
resizeCanvas();
updateNames();


