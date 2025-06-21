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
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');

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
  window.currentPair = pair;

  setTimeout(() => {
    document.getElementById('popupDetails').innerHTML = detailTop;

    setTimeout(() => {
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
            if (currency1 === "USD") {
              priority.push(renderNews(currency1, b1), renderNews(currency2, b2));
            } else {
              priority.push(renderNews(currency2, b2), renderNews(currency1, b1));
            }
          } else {
            priority.push(renderNews(currency1, b1), renderNews(currency2, b2));
          }

          box.innerHTML = `<div>${priority.join("")}</div>`;
        })
        .catch(err => {
          const box = document.getElementById("newsBox");
          if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
          console.error("❌ Fetch gagal:", err);
        });
    }, 100);
  }, 50);
}

// === POPUP KEDUA: Analisa AI / Termux-Style ===

async function buatAnalisaSekarang() {
  const tf = document.getElementById('tfSelect').value;
  const pair = window.currentPair;
  const analysisPopup = document.getElementById('analysisPopup');

  // Tampilkan loader awal
  analysisPopup.innerHTML = `
    <div style="text-align:center; padding-top:60px;">
      <img src="https://media.tenor.com/xbrfuvCqep4AAAAC/loading-chart.gif" width="100" alt="Loading..." />
      <p style="color:#fff; font-family:'Courier New'; margin-top:15px; font-size:16px;">⏳ Memproses analisa AI...</p>
    </div>
  `;
  analysisPopup.style.display = 'flex';

  // Simulasi delay proses 1 detik
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Ganti isi popup ke tampilan terminal
  analysisPopup.innerHTML = `
    <div class="analysis-terminal">
      <div class="analysis-sidebar">
        <div id="sidebarTitle">💿 Berita Terkini</div>
        <div class="step" id="step1">1. Memuat berita...</div>
        <div class="step" id="step2">2. -</div>
        <div class="step" id="step3">3. -</div>
      </div>
      <div class="analysis-main">
        <div class="header-bar">📊 Proses Analisa AI</div>
        <pre id="typeWriter"></pre>
        <div class="footer">
          <button onclick="closeAnalysis()">Tutup</button>
        </div>
      </div>
    </div>
  `;
  analysisPopup.style.display = 'flex';

  tampilkanBeritaSidebar(); // Aktifkan sidebar berita

  // Simulasi proses ketik
  setTimeout(() => {
    const result = generateAutoAnalysis(pair, tf);
    typeText("typeWriter", result);
  }, 500);
}


function generateAutoAnalysis(pair, tf) {
  return `📌 Analisa ${pair} (${tf})\n
Status: AI telah memproses data teknikal dan berita\n
📈 Tren saat ini: Cenderung Sideways\n
🟢 Support kuat: 1.2650\n🔴 Resistance kuat: 1.2745\n
💡 Rekomendasi:
Tunggu konfirmasi breakout. Buy jika harga bertahan di atas 1.2700.\n
\n- Analisa dibuat otomatis oleh AI, harap bijak dalam mengambil keputusan.`;
}

function typeText(elementId, text, speed = 20) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}




function tampilkanBeritaSidebar() {
  const pair = window.currentPair?.name || "EURUSD";
  const currency1 = pair.slice(0, 3);
  const currency2 = pair.slice(3, 6);
  const today = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');

  fetch("https://script.google.com/macros/s/AKfycbxc2JQgw3GLARWCCSvMbHOgMsRa7Nx8-SWz61FM6tyjZ8idTl-fAtIbw1nRUqO4NG5v/exec")
    .then(r => r.json())
    .then(data => {
      const list1 = data?.[today]?.[currency1] || [];
      const list2 = data?.[today]?.[currency2] || [];

      const gabungan = [
        ...list1.map(x => ({ ...pecah(x), currency: currency1 })),
        ...list2.map(x => ({ ...pecah(x), currency: currency2 }))
      ].slice(0, 3);

      const s1 = document.getElementById("step1");
      const s2 = document.getElementById("step2");
      const s3 = document.getElementById("step3");
      const sidebarTitle = document.getElementById("sidebarTitle");

      if (sidebarTitle) sidebarTitle.textContent = "💿 Berita Terkini";

      if (gabungan.length === 0) {
        s1.textContent = "Tidak ada berita hari ini.";
        s2.textContent = "-";
        s3.textContent = "-";
        return;
      }

      [s1, s2, s3].forEach((el, i) => {
        const news = gabungan[i];
        if (!news) return;
        el.textContent = `${i + 1}. ${news.judul} (${convertGMTtoWIB(news.jam)}) ${impactIcon(news.impact)} ${news.currency} ${getFlagEmoji(news.currency)}`;
      });
    })
    .catch(() => {
      const s1 = document.getElementById("step1");
      if (s1) s1.textContent = "⚠️ Gagal memuat berita.";
    });

  function pecah(str) {
    const [judul, jam, impact] = str.split("|");
    return { judul, jam, impact };
  }
}

  // Mulai efek ketik


// === Efek Ketik
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

// === Tombol Tutup Popup
function closeAnalysis() {
  document.getElementById('analysisPopup').style.display = 'none';
}






function convertGMTtoWIB(gmtTime) {
  if (!gmtTime) return "Invalid";
  const match = gmtTime.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return "Invalid";
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toLowerCase();
  if (period === "pm" && hour !== 12) hour += 1;
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
