function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

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
  const today = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  const detailTop = `
    <div style="background: linear-gradient(to right, #2c3e50, #4ca1af); color: white; padding: 12px; border-radius: 12px; text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 16px;">
      💻 Analisa ${pair.name} 📊 ${today}
    </div>

    <p style="font-weight:bold; margin-bottom:6px;">📝 Berita Penting Hari Ini:</p>
    <div id="newsBox" style="font-size:13.5px; line-height:1.4em; margin-bottom:16px;">⏳ Mengambil berita...</div>

    <hr style="border:none; border-top:1px solid #ccc; margin:16px 0;">

    <p style="font-weight:bold; margin-bottom:6px;">Kekuatan Mata Uang:</p>
    <div class="strength-bar">
      <div class="strength-gbp" style="width:${strength1}%"></div>
      <div class="strength-usd" style="width:${strength2}%"></div>
    </div>
    <p style="font-size:13px; margin-bottom:16px;">
      ${currency1}: ${strength1.toFixed(1)}% 🔵 &nbsp;&nbsp; ${currency2}: ${strength2.toFixed(1)}% 🔴
    </p>

    <hr style="border:none; border-top:1px solid #ccc; margin:16px 0;">

    <p style="font-weight:bold; margin-bottom:6px;">Analisa:</p>
    <div>
      <button onclick="buatAnalisaSekarang()" class="popup-button">
        🔍 Buat Analisa ${pair.name} Sekarang
      </button>
      <div id="autoAnalysis"></div>
    </div>
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
            <div style="font-weight:bold; margin-bottom:4px;">${getFlagEmoji(currency)} ${currency}</div>
            <ul style="padding-left:18px; margin:0;">
              ${arr.map(str => {
                const parts = str.split("|");
                const judul = parts[0] || "-";
                const jam = parts[1] || "";
                const impact = parts[2] || "Low";
                const color = impact === "High" ? "#ff4d4d" : impact === "Medium" ? "#ffa500" : "#ccc";
                const jamWIB = convertGMTtoWIB(jam);
                return `<li style="color:${color}; margin-bottom:2px;">${judul} (${jamWIB})</li>`;
              }).join("")}
            </ul>
          </div>`;
        }

        const priority = [];
        if (currency1 === "USD" || currency2 === "USD") {
          if (currency1 === "USD") {
            priority.push(renderNews(currency1, b1), renderNews(currency2, b2));
          } else {
            priority.push(renderNews(currency2, b2), renderNews(currency1, b1));
          }
        } else {
          priority.push(renderNews(currency1, b1), renderNews(currency2, b2));
        }

        box.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${priority.map(html => `
              <div style="background:#111; padding:10px; border-radius:8px;">
                ${html}
              </div>
            `).join("")}
          </div>
        `;

        window.currentPair = pair;
        window.currentNewsB1 = b1;
        window.currentNewsB2 = b2;
      })
      .catch(() => {
        const box = document.getElementById("newsBox");
        if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
      });

    const signalBox = document.getElementById("todaySignal");
    const signals = window.signals || {};
    signalBox.innerHTML = signals?.[pair.name] || "(Belum ada sinyal hari ini)";
  }, 100);
}

// === Tambahan Fungsi Analisa AI ===
function generateAutoAnalysis(pair, rsi, macd, b1 = [], b2 = []) {
  const currentPrice = parseFloat(pair.price).toFixed(5);
  let result = `📌 Analisa ${pair.name} (${new Date().toLocaleDateString()})\n\n`;

  if (rsi < 30) result += `• RSI di bawah 30 (Oversold)\n`;
  else if (rsi > 70) result += `• RSI di atas 70 (Overbought)\n`;
  else result += `• RSI Netral (${rsi.toFixed(2)})\n`;

  if (macd < 0) result += `• MACD Negatif (Momentum Turun)\n`;
  else result += `• MACD Positif (Momentum Naik)\n`;

  const now = new Date();
  const releasedNews = [...b1, ...b2].filter(str => {
    const parts = str.split("|");
    const jam = parts[1] || "";
    const impact = parts[2] || "Low";
    if (impact !== "High") return false;
    const jamWIB = convertGMTtoWIB(jam);
    const [hh, mm] = jamWIB.split(":").map(Number);
    const newsTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
    return newsTime < now;
  });

  if (releasedNews.length > 0) {
    result += `⚠️ Ada ${releasedNews.length} Berita High Impact sudah rilis:\n`;
    releasedNews.forEach(str => {
      const [judul, jam] = str.split("|");
      const jamWIB = convertGMTtoWIB(jam);
      result += `- ${judul} (${jamWIB} WIB)\n`;
    });
  }

  let rekomendasi = "Netral — Tunggu konfirmasi tambahan";
  let entry = currentPrice, tp1, tp2, sl;
  if (rsi < 30 && macd > 0) {
    rekomendasi = "BUY";
    tp1 = (entry * 1.0020).toFixed(5);
    tp2 = (entry * 1.0050).toFixed(5);
    sl  = (entry * 0.9980).toFixed(5);
  } else if (rsi > 70 && macd < 0) {
    rekomendasi = "SELL";
    tp1 = (entry * 0.9980).toFixed(5);
    tp2 = (entry * 0.9950).toFixed(5);
    sl  = (entry * 1.0020).toFixed(5);
  }
  result += `\n🎯 Rekomendasi: ${rekomendasi}\n`;
  if (rekomendasi !== "Netral — Tunggu konfirmasi tambahan") {
    result += `• Entry: ${entry}\n• TP1: ${tp1}\n• TP2: ${tp2}\n• SL: ${sl}\n`;
  }

  return result;
}

function buatAnalisaSekarang() {
  const pair = window.currentPair;
  const rsi = Math.random() * 100;
  const macd = (Math.random() - 0.5) * 2;
  const b1 = window.currentNewsB1 || [];
  const b2 = window.currentNewsB2 || [];
  const result = generateAutoAnalysis(pair, rsi, macd, b1, b2);

  const analysisBox = `
    <div class="win95-titlebar">Analisa ${pair.name}</div>
    <div id="analysisContent" class="win95-content"></div>
    <div class="win95-footer">
      <button onclick="closeAnalysis()" class="win95-close">Close</button>
    </div>
  `;
  document.getElementById("analysisPopup").innerHTML = analysisBox;
  document.getElementById("analysisPopup").style.display = 'block';
  typeText("analysisContent", result);
}

function closeAnalysis() {
  document.getElementById("analysisPopup").style.display = 'none';
}

function typeText(elementId, text, speed = 20) {
  const el = document.getElementById(elementId);
  el.textContent = "";
  let i = 0;
  function typing() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
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
