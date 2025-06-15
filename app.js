function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function openPopup(pair) {
  const buy = parseFloat(pair.longPercentage);
  const sell = parseFloat(pair.shortPercentage);
  const detail = `
    <h2>Analisa Pair ${pair.name}</h2>
    <p><b>News Hari Ini:</b></p>
    <p>🇬🇧 GBP: CPI dirilis 14:30 WIB (Impact: Tinggi)</p>
    <p>🇺🇸 USD: Tidak ada berita penting hari ini</p>

    <p><b>Kekuatan Mata Uang:</b></p>
    <div class="strength-bar">
      <div class="strength-gbp" style="width:${buy}%"></div>
      <div class="strength-usd" style="width:${sell}%"></div>
    </div>
    <p style="font-size:13px;">GBP: ${buy}% 🔵 &nbsp;&nbsp; USD: ${sell}% 🔴</p>

    <p><b>Sinyal Harian:</b> <span style="color:${buy > sell ? '#00ff00' : '#ff4444'};"><b>${buy > sell ? 'BUY' : 'SELL'}</b></span></p>
  `;
  document.getElementById('popupDetails').innerHTML = detail;
  document.getElementById('popup').style.display = 'flex';
}

function renderGauge(buy, sell) {
  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  // Background arc
  ctx.beginPath();
  ctx.arc(75, 100, 70, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Buy needle
  const buyAngle = Math.PI + (buy / 100) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(75, 100);
  ctx.lineTo(75 + 60 * Math.cos(buyAngle), 100 + 60 * Math.sin(buyAngle));
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Sell needle
  const sellAngle = Math.PI + (sell / 100) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(75, 100);
  ctx.lineTo(75 + 60 * Math.cos(sellAngle), 100 + 60 * Math.sin(sellAngle));
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas;
}

const url = "https://myfxbook-proxy.ayulistyanto.workers.dev/?endpoint=/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

async function loadSignals() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const order = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const sorted = [...data.symbols].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    document.getElementById("signals").innerHTML = "";
    sorted.forEach(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';

      const box = document.createElement("div");
      box.className = "box";
      box.onclick = () => openPopup(pair);

      const name = document.createElement("div");
      name.className = "pair";
      name.textContent = pair.name;

      const gauge = renderGauge(buy, sell);

      const val = document.createElement("div");
      val.className = "value";
      val.textContent = `Buy: ${buy}% | Sell: ${sell}%`;

      const signal = document.createElement("div");
      signal.className = `signal ${cls}`;
      signal.textContent = status;

      box.appendChild(name);
      box.appendChild(gauge);
      box.appendChild(val);
      box.appendChild(signal);
      document.getElementById("signals").appendChild(box);
    });
  } catch (e) {
    document.getElementById("signals").innerHTML = '<div class="box wait">Gagal ambil data: ' + e.message + '</div>';
  }
}
loadSignals();
setInterval(loadSignals, 60000);
