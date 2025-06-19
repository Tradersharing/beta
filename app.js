function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}
;


// === Fungsi Utama: Buka Popup Analisa ===
function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function openPopup(pair) {
  const long = parseFloat(pair.longPercentage);
  const short = parseFloat(pair.shortPercentage);
  const currency1 = pair.name.slice(0, 3).toUpperCase();
  const currency2 = pair.name.slice(3, 6).toUpperCase();
  const total = long + short;
  const strength1 = (long / total) * 100;
  const strength2 = (short / total) * 100;

  const now = new Date();
  const today = now.toLocaleDateString('en-US', {timeZone: 'Asia/Jakarta',year: 'numeric',month: '2-digit',day: '2-digit'}).replace(/\//g, '-');

  const detailTop = `
    <div style="background: linear-gradient(to right, #2c3e50, #4ca1af); color: white; padding: 12px; border-radius: 12px; text-align: center;">
      💻 Analisa ${pair.name} 📊 ${today}
    </div>
    <p><b>📝 Berita Penting Hari Ini:</b></p>
    <div id="newsBox">⏳ Mengambil berita...</div>
    <hr>
    <p><b>Kekuatan Mata Uang:</b></p>
    <div class="strength-bar">
      <div class="strength-gbp" style="width:${strength1}%"></div>
      <div class="strength-usd" style="width:${strength2}%"></div>
    </div>
    <p>${currency1}: ${strength1.toFixed(1)}% 🔵 &nbsp; ${currency2}: ${strength2.toFixed(1)}% 🔴</p>
    <hr>
    <p><b>Analisa:</b></p>
    <select id="tfSelect" class="popup-dropdown">
      <option value="1h" selected>H1 (default)</option>
      <option value="4h">H4</option>
      <option value="1d">D1</option>
    </select>
    <button onclick="buatAnalisaSekarang()" class="popup-button">📊 Mulai Proses Analisa ${pair.name}</button>
    <div id="autoAnalysis"></div>
  `;

  document.getElementById('popup').style.display = 'flex';

  setTimeout(() => {
    document.getElementById('popupDetails').innerHTML = detailTop;
    const scriptURL = "https://script.google.com/macros/s/AKfycbxc2JQgw3GLARWCCSvMbHOgMsRa7Nx8-SWz61FM6tyjZ8idTl-fAtIbw1nRUqO4NG5v/exec";

    fetch(scriptURL)
      .then(res => res.json())
      .then(data => {
        const box = document.getElementById("newsBox");
        if (!box) return;
        const news = data?.[today] || {};
        const b1 = news?.[currency1] || [];
        const b2 = news?.[currency2] || [];

        function renderNews(currency, arr) {
          if (!arr.length) return "";
          return `<div>
            <div style="font-weight:bold;">${getFlagEmoji(currency)} ${currency}</div>
            <ul>
              ${arr.map(str => {
                const [judul, jam, impact] = str.split("|");
                const color = impact === "High" ? "#ff4d4d" : impact === "Medium" ? "#ffa500" : "#ccc";
                const jamWIB = convertGMTtoWIB(jam);
                return `<li style="color:${color};">${judul} (${jamWIB})</li>`;
              }).join("")}
            </ul>
          </div>`;
        }

        const priority = [];
        if (currency1 === "USD" || currency2 === "USD") {
          if (currency1 === "USD") priority.push(renderNews(currency1, b1), renderNews(currency2, b2));
          else priority.push(renderNews(currency2, b2), renderNews(currency1, b1));
        } else priority.push(renderNews(currency1, b1), renderNews(currency2, b2));

        box.innerHTML = `<div>${priority.join("")}</div>`;
      })
      .catch(() => {
        const box = document.getElementById("newsBox");
        if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
      });
  }, 100);
}


// === Fungsi Terminal Analisa popup2 ===//

async function buatAnalisaSekarang() {
  const tf = document.getElementById('tfSelect').value;
  const pair = window.currentPair;

  if (!pair || !pair.name) {
    alert("Pair belum dipilih.");
    return;
  }

  const currency1 = pair.name.slice(0, 3);
  const currency2 = pair.name.slice(3, 6);
  const analysisPopup = document.getElementById('analysisPopup');

  // Tampilkan loading
  analysisPopup.innerHTML = `
    <div class="loadingBox">
      <img src="https://media.tenor.com/xbrfuvCqep4AAAAC/loading-chart.gif" width="90" />
      <p>⏳ Memproses analisa ${pair.name}...</p>
    </div>`;
  analysisPopup.style.display = 'flex';

  // Ambil Harga
  let price = 0;
  try {
    const priceURL = `https://api.exchangerate.host/latest?base=${currency1}&symbols=${currency2}`;
    const priceData = await fetch(priceURL).then(r => r.json());
    price = priceData.rates?.[currency2] || 0;
  } catch (e) {
    console.error("Gagal ambil harga:", e);
  }

  // Ambil RSI dan MACD
  let rsi = 0, macd = 0;
  try {
    const rsiURL = `https://api.taapi.io/rsi?secret=YOUR_API_KEY&exchange=forex&symbol=${currency1}${currency2}&interval=${tf}`;
    const macdURL = `https://api.taapi.io/macd?secret=YOUR_API_KEY&exchange=forex&symbol=${currency1}${currency2}&interval=${tf}`;
    const [rsiData, macdData] = await Promise.all([
      fetch(rsiURL).then(r => r.json()),
      fetch(macdURL).then(r => r.json())
    ]);
    rsi = rsiData.value || 0;
    macd = macdData.valueMACD || 0;
  } catch (e) {
    console.error("Gagal ambil RSI/MACD:", e);
  }

  // Ambil EMA & Supertrend
  let ema = 0, supertrend = "UNKNOWN";
  try {
    const indiURL = `https://script.google.com/macros/s/YOUR_EMA_SUPERTREND_SCRIPT_ID/exec`;
    const indiData = await fetch(indiURL).then(r => r.json());
    ema = indiData.ema14 || 0;
    supertrend = indiData.supertrend || "UNKNOWN";
  } catch (e) {
    console.error("Gagal ambil EMA/Supertrend:", e);
  }

  // Analisa Fundamental
  let extraAnalysis = "Tidak ada analisa fundamental.";
  try {
    const fxURL = "https://script.google.com/macros/s/YOUR_FXSTREET_SCRIPT_URL/exec";
    const fxData = await fetch(fxURL).then(r => r.json());
    if (fxData?.[pair.name]) {
      extraAnalysis = fxData[pair.name];
    } else {
      const query = `${pair.name} forex news site:forexfactory.com`;
      const fallbackURL = `https://api.allorigins.win/raw?url=https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const html = await fetch(fallbackURL).then(r => r.text());
      const match = html.match(/<h3.*?>(.*?)<\/h3>/);
      if (match && match[1]) {
        extraAnalysis = `📌 Berita Terkait: ${match[1]}`;
      } else {
        extraAnalysis = "🔍 Tidak ditemukan berita dari Google Search.";
      }
    }
  } catch (e) {
    console.error("Gagal ambil data analisa:", e);
  }

  // PANGGIL fungsi untuk buka hasil analisa
  openAnalysis(pair, rsi, macd, ema, supertrend, price, tf, extraAnalysis);
} // ✅ Penutup fungsi utama

// === BUKA POPUP HASIL ANALISA AI ===
function openAnalysis(pair, rsi, macd, ema, supertrend, price, tf, extraAnalysis) {
  const result = generateAutoAnalysis(pair, rsi, macd, ema, supertrend, price, tf, extraAnalysis);
  const analysisPopup = document.getElementById("popup");

  analysisPopup.innerHTML = `
    <div style="background:#222; color:#0f0; padding:12px; border-radius:8px; width:90%; max-width:400px; margin:20px auto; font-family:'Courier New', monospace;">
      <b>📊 Proses Analisa AI ${pair.name} (${tf.toUpperCase()})</b>
      <pre id="typeWriter"></pre>
      <div style="text-align:center; margin-top:10px;">
        <button onclick="closeAnalysis()" style="background:#444; color:#fff; padding:5px 10px; border:none;">Tutup</button>
      </div>
    </div>
  `;

  typeText("typeWriter", result);
}

// === GENERATE KESIMPULAN ANALISA TEXT ===
function generateAutoAnalysis(pair, rsi, macd, ema, supertrend, price, tf, extraAnalysis) {
  let result = `📌 Analisa ${pair.name} (${tf.toUpperCase()})\n\n`;
  result += `💡 Fundamental: ${extraAnalysis}\n\n`;

  result += rsi < 30 ? `• RSI di bawah 30 (Oversold)\n` :
            rsi > 70 ? `• RSI di atas 70 (Overbought)\n` :
                       `• RSI Netral (${rsi})\n`;

  result += macd < 0 ? `• MACD Negatif (Bearish)\n` : `• MACD Positif (Bullish)\n`;
  result += `• EMA 14: ${ema.toFixed(5)}\n`;
  result += `• Supertrend: ${supertrend.toUpperCase()}\n`;

  const entry = parseFloat(price);
  const tp1 = (entry * 1.0020).toFixed(5);
  const tp2 = (entry * 1.0050).toFixed(5);
  const sl = (entry * 0.9980).toFixed(5);

  const rekom = (rsi < 30 && macd > 0 && supertrend.toUpperCase() === "BUY") ? 'BUY' :
                (rsi > 70 && macd < 0 && supertrend.toUpperCase() === "SELL") ? 'SELL' :
                'WAIT';

  result += `\n🎯 Rekomendasi: ${rekom}\n`;
  result += `• Entry: ${entry}\n• TP1: ${tp1}\n• TP2: ${tp2}\n• SL: ${sl}\n\n`;
  result += `⚠️ Risiko tinggi. Gunakan money management.\n`;

  return result;
}

// === TUTUP POPUP ANALISA ===
function closeAnalysis() {
  document.getElementById('analysisPopup').style.display = 'none';
}

// === ANIMASI MENGETIK TEXT ===
function typeText(elementId, text, speed = 20) {
  const element = document.getElementById(elementId);
  element.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

      


function convertGMTtoWIB(gmtTime) {
  if (!gmtTime) return "Invalid";
  const match = gmtTime.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return "Invalid";
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  const date = new Date(Date.UTC(2000, 0, 1, hour, minute));
  date.setUTCHours(date.getUTCHours() + 7);
  return date.toTimeString().slice(0, 5);
}

function getFlagEmoji(code) {
  const flags = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    AUD: "🇦🇺", NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳"
  };
  return flags[code] || "🏳️";
}



function renderGauge(buy, sell) {
  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(75, 100, 70, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.stroke();

  const buyAngle = Math.PI + (buy / 100) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(75, 100);
  ctx.lineTo(75 + 60 * Math.cos(buyAngle), 100 + 60 * Math.sin(buyAngle));
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;
  ctx.stroke();

  const sellAngle = Math.PI + (sell / 100) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(75, 100);
  ctx.lineTo(75 + 60 * Math.cos(sellAngle), 100 + 60 * Math.sin(sellAngle));
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas;
}

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.createElement("div");
  loader.id = "pageLoader";
  loader.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: #000; color: #fff;
    display: flex; justify-content: center; align-items: center;
    z-index: 9999; flex-direction: column;
    font-family: 'Segoe UI', sans-serif;
    animation: fadeIn 0.5s ease-in-out;
  `;
  loader.innerHTML = `
    <div style="font-size: 28px;">🎁 Memuat data...</div>
    <div style="margin-top: 10px;">⏳ Mohon tunggu sebentar</div>
  `;
  document.body.appendChild(loader);

  setTimeout(() => {
    document.getElementById("pageLoader")?.remove();
  }, 2000);
});

const url = "https://myfxbook-proxy.ayulistyanto.workers.dev/?endpoint=/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

async function loadSignals() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    const majorPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const majors = [], others = [];

    data.symbols.forEach(pair => {
      (majorPairs.includes(pair.name) ? majors : others).push(pair);
    });

    const sorted = [...majors, ...others];
    const container = document.getElementById("signals");
    container.innerHTML = "";

    sorted.forEach(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';

      const box = document.createElement("div");
      box.className = "box";
      box.dataset.pair = pair.name.toLowerCase();
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
      container.appendChild(box);
    });

    const search = document.getElementById("pairSearch");
    if (search) {
      search.addEventListener("input", () => {
        const term = search.value.toLowerCase();
        document.querySelectorAll("#signals .box").forEach(box => {
          const match = box.dataset.pair.includes(term);
          box.style.display = match ? "" : "none";
        });
      });
    }

  } catch (e) {
    document.getElementById("signals").innerHTML =
      '<div class="box wait">Gagal ambil data: ' + e.message + '</div>';
  }
}

loadSignals();
setInterval(loadSignals, 60000);
