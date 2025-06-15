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

const url = "https://myfxbook-proxy.ayulistyanto.workers.dev/?endpoint=/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

async function loadSignals() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const order = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const sorted = [...data.symbols].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    document.getElementById("signals").innerHTML = sorted.map(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';
      return `
        <div class="box" onclick='openPopup(${JSON.stringify(pair)})'>
          <div class="pair">${pair.name}</div>
          <div class="value">Buy: ${buy}% | Sell: ${sell}%</div>
          <div class="signal ${cls}">${status}</div>
        </div>
      `;
    }).join("");
  } catch (e) {
    document.getElementById("signals").innerHTML = '<div class="box wait">Gagal ambil data: ' + e.message + '</div>';
  }
}
loadSignals();
setInterval(loadSignals, 60000);
