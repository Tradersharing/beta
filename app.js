
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}
function closePopup() {
  document.getElementById('popup').style.display = 'none';
}
const url = "https://myfxbook-proxy.ayulistyanto.workers.dev/?endpoint=/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";
function drawDualGauge(buy, sell) {
  const radius = 80; const cx = 100, cy = 100; let ticks = "";
  for (let i = 0; i <= 100; i += 5) {
    const angle = (-90 + (i * 180 / 100)) * Math.PI / 180;
    const x1 = cx + (radius - 6) * Math.cos(angle); const y1 = cy + (radius - 6) * Math.sin(angle);
    const x2 = cx + radius * Math.cos(angle); const y2 = cy + radius * Math.sin(angle);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="${i % 10 === 0 ? 1.5 : 0.5}" />`;
  }
  const angleBuy = (-90 + (buy / 100) * 180) * Math.PI / 180;
  const angleSell = (-90 + (sell / 100) * 180) * Math.PI / 180;
  const bx = cx + radius * 0.85 * Math.cos(angleBuy);
  const by = cy + radius * 0.85 * Math.sin(angleBuy);
  const sx = cx + radius * 0.85 * Math.cos(angleSell);
  const sy = cy + radius * 0.85 * Math.sin(angleSell);
  return `<svg viewBox="0 0 200 120"><path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#FFD700" stroke-width="4"/>${ticks}<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="#0f0" stroke-width="3"/><line x1="${cx}" y1="${cy}" x2="${sx}" y2="${sy}" stroke="#f00" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="3" fill="#FFD700" /></svg>`;
}
async function loadSignals() {
  try {
    const res = await fetch(url); const data = await res.json();
    const order = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"];
    const sorted = [...data.symbols].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    document.getElementById("signals").innerHTML = sorted.map(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';
      return `<div class="box" onclick="showPopup('${pair.name}', ${buy}, ${sell})"><div class="pair">${pair.name}</div>${drawDualGauge(buy, sell)}<div class="value">Buy: ${buy}% | Sell: ${sell}%</div><div class="signal ${cls}">${status}</div></div>`;
    }).join("");
  } catch(e) {
    document.getElementById("signals").innerHTML = '<div class="box wait">Error: ' + e.message + '</div>';
  }
}
function showPopup(name, buy, sell) {
  document.getElementById('popupTitle').innerText = `Detail Signal: ${name}`;
  document.getElementById('popupBody').innerHTML = `<p><strong>Pair:</strong> ${name}</p><p><strong>Buy Strength:</strong> ${buy}%</p><p><strong>Sell Strength:</strong> ${sell}%</p><p><em>Sumber: MyFXBook API + RealTime Data</em></p>`;
  document.getElementById('popup').style.display = 'flex';
}
loadSignals();
setInterval(loadSignals, 60000);

function openPopup(pair, data) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay active';

  const popup = document.createElement('div');
  popup.className = 'popup';
  
  popup.innerHTML = `
    <button class="popup-close" onclick="this.parentElement.parentElement.remove()">×</button>
    <div class="popup-title">Analisa Mendalam untuk Pair ${pair.name} - ${new Date().toLocaleDateString()}</div>

    <div class="popup-section-title">📰 News Hari Ini</div>
    ${data.news.map(n => `
      <div class="news-item" style="border-color:${n.color};">${n.country}: ${n.title} (${n.time})</div>
    `).join('')}

    <div class="popup-section-title">💪 Kekuatan Mata Uang</div>
    <div> ${data.strength.base}: ${data.strength.baseVal}% <div class="strength-bar" style="width:${data.strength.baseVal}%;"></div></div>
    <div> ${data.strength.quote}: ${data.strength.quoteVal}% <div class="strength-bar" style="width:${data.strength.quoteVal}%;"></div></div>

    <div class="popup-section-title">📈 Analisa Pair</div>
    <div>${data.analysis}</div>

    <div class="popup-section-title">🔍 Sinyal Harian</div>
    <div style="font-weight:bold;font-size:18px;color:${data.signal==='BUY' ? '#00ff00' : data.signal==='SELL' ? '#ff4444' : '#ccc'}">${data.signal}</div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
