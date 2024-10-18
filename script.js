let primaryItems = [];
let secondaryItems = [];
let spinning = false;

document.getElementById('item-input').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    addItem();
  }
});

function addItem() {
  const itemInput = document.getElementById('item-input');
  const item = itemInput.value.trim();

  if (item) {
    primaryItems.push(item);
    itemInput.value = ''; // Clear input field
    drawWheel('primary-wheel', primaryItems);
  }
}

function resetWheels() {
  primaryItems = [];
  secondaryItems = [];
  document.getElementById('winning-selections').innerHTML = ''; // Clear the list
  hideWinnerBanner();
  drawWheel('primary-wheel', primaryItems);
  drawWheel('secondary-wheel', secondaryItems);
}

function drawWheel(canvasId, items) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const totalItems = items.length;
  const arcSize = (2 * Math.PI) / (totalItems || 1); // Prevent divide-by-zero

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  items.forEach((item, index) => {
    const startAngle = index * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
    ctx.fillStyle = `hsl(${(index * 360) / totalItems}, 70%, 50%)`;
    ctx.fill();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = '16px Impact';
    ctx.fillText(item, canvas.width / 2 - 10, 10);
    ctx.restore();
  });
}

function spinWheel(wheelType) {
  if (spinning) return; // Prevent multiple spins

  hideWinnerBanner();

  const items = wheelType === 'primary' ? primaryItems : secondaryItems;
  if (items.length === 0) {
    alert(`The ${wheelType} wheel is empty!`);
    return;
  }

  spinning = true;
  const arcSize = 360 / items.length;
  const winnerIndex = Math.floor(Math.random() * items.length);
  const targetRotation = 360 - winnerIndex * arcSize;
  let rotation = Math.random() * 360 + 720 + targetRotation;

  const canvasId = `${wheelType}-wheel`;
  const canvas = document.getElementById(canvasId);
  let currentRotation = 0;

  const interval = setInterval(() => {
    currentRotation += 10;
    drawRotatedWheel(canvasId, items, currentRotation);

    if (currentRotation >= rotation) {
      clearInterval(interval);
      finishSpin(wheelType, winnerIndex, canvas);
    }
  }, 16);
}

function drawRotatedWheel(canvasId, items, angle) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  drawWheel(canvasId, items);
  ctx.restore();
}

function finishSpin(wheelType, winnerIndex, canvas) {
  const items = wheelType === 'primary' ? primaryItems : secondaryItems;
  const resultItem = items.splice(winnerIndex, 1)[0];

  setTimeout(() => {
    showWinnerBanner(resultItem, canvas);
    if (wheelType === 'primary') {
      secondaryItems.push(resultItem); // Move winner to secondary wheel
      drawWheel('secondary-wheel', secondaryItems);
    } else {
      addWinningSelection(resultItem); // Add to Winning Selections list
    }
    drawWheel(`${wheelType}-wheel`, items);
    spinning = false;
  }, 1000);
}

function showWinnerBanner(winner, canvas) {
  const banner = document.getElementById('winner-banner');
  const text = document.getElementById('winner-text');
  text.textContent = `Winner: ${winner}`;

  // Center banner in the spinning wheel
  const rect = canvas.getBoundingClientRect();
  banner.style.top = `${rect.top + rect.height / 2}px`;
  banner.style.left = `${rect.left + rect.width / 2}px`;
  banner.style.transform = 'translate(-50%, -50%)';

  banner.style.display = 'block';
  banner.style.opacity = 1;
}

function hideWinnerBanner() {
  const banner = document.getElementById('winner-banner');
  banner.style.opacity = 0;
  setTimeout(() => {
    banner.style.display = 'none';
  }, 500);
}

function addWinningSelection(winner) {
  const list = document.getElementById('winning-selections');
  const listItem = document.createElement('li');
  listItem.textContent = winner;
  list.appendChild(listItem);
}

// Initialize the wheels
drawWheel('primary-wheel', primaryItems);
drawWheel('secondary-wheel', secondaryItems);
