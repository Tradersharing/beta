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
            const flag = getFlagEmoji(currency);
            return `<div style="margin-bottom:10px;">
              <div style="font-weight:bold;">${flag} ${currency}</div>
              ${
                arr.length
                  ? `<ul>${arr.map(str => {
                      const [judul, jam, impact] = str.split("|");
                      const color = impact === "High" ? "#ff4d4d" : impact === "Medium" ? "#ffa500" : "#ccc";
                      const jamWIB = convertGMTtoWIB(jam);
                      return `<li style="color:${color};">${judul} (${jamWIB})</li>`;
                    }).join("")}</ul>`
                 : `<p style="color:gray;">Tidak ada berita penting hari ini.</p>`
              }
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


// === Fungsi Analisa AI Lengkap + Ketik + Sinkron dengan html2 ===

async function buatAnalisaSekarang() {
  const pair = window.currentPair;
  const analysisPopup = document.getElementById('analysisPopup');
  const pairSymbol = (pair?.name || 'EURUSD') + '=X';
  const srURL = `https://script.google.com/macros/s/AKfycbzjlvMVo_JvB7hPI5DFyVx-CXcPSaHPug8utYk5BZTsvwmcAMHrOTvZJB7CVNkGgZrU/exec?pair=${pairSymbol}`;

  const srData = await fetch(srURL).then(res => res.json()).catch(() => null);
  const support = srData?.support || '??';
  const resistance = srData?.resistance || '??';

  analysisPopup.innerHTML = `
    <div style="text-align:center; padding-top:60px;">
      <img src="https://media.tenor.com/xbrfuvCqep4AAAAC/loading-chart.gif" width="100" alt="Loading..." />
      <p style="color:#fff; font-family:'Courier New'; margin-top:15px; font-size:16px;">⏳ Memproses analisa AI...</p>
    </div>
  `;
  analysisPopup.style.display = 'flex';

  await new Promise(resolve => setTimeout(resolve, 1000));

  analysisPopup.innerHTML = `
    <div class="analysis-main">
      <div class="corner-label">📊Analisa pair</div>
      <pre id="typeWriter"></pre>
      <div id="step1" style="display:none;"></div>
      <div class="footer">
        <button onclick="closeAnalysis()">Tutup</button>
      </div>
    </div>
  `;

  // Ambil insight berita dan tampilkan di step1
  await tampilkanInsightBerita(pair);

  const buyer = pair.longPercentage;
  const seller = pair.shortPercentage;
  const signal = buyer >= 70 ? 'BUY' : seller >= 70 ? 'SELL' : 'WAIT';

  const result = generateAutoAnalysis(pair, buyer, seller, signal, support, resistance);
  setTimeout(() => {
    typeText("typeWriter", result);
  }, 600);
}

function typeText(elementId, text, speed = 25) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}





function closeAnalysis() {
  const popup = document.getElementById("analysisPopup");
  if (popup) popup.style.display = "none";
}

function tampilkanBeritaSidebar() {
  const sidebar = document.querySelector(".analysis-sidebar");
  if (!sidebar) return;

  const newsList = document.querySelectorAll("#newsBox li");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");

  if (newsList.length) {
    const berita = newsList[0].textContent || "";
    const timeMatch = berita.match(/\((\d{2}:\d{2})\)/);
    const jam = timeMatch ? timeMatch[1] : "??:??";
    const judul = berita.split("(")[0].trim();

    if (step1) step1.textContent = `1. ${judul} (${jam})`;
    if (step2) step2.textContent = "2. Membaca struktur teknikal...";
    if (step3) step3.textContent = "3. Menentukan bias dan strategi...";
  } else {
    if (step1) step1.textContent = "1. Tidak ada berita berdampak.";
    if (step2) step2.textContent = "2. Fokus pada price action & pola.";
    if (step3) step3.textContent = "3. Validasi arah dari data ritel.";
  }
}
//disini
// === Fungsi Analisa AI (diperbaiki agar cocok dengan format multiline "step1") ===



  function generateAutoAnalysis(pair, buyer, seller, signal, support = "??", resistance = "??") {
  const pairName = pair.name || "EURUSD";
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric'
  });

  const buyerPercent = parseFloat(buyer).toFixed(1);
  const sellerPercent = parseFloat(seller).toFixed(1);
  const kecenderungan = signal === "BUY" ? "buyer"
                        : signal === "SELL" ? "seller"
                        : "dua sisi secara seimbang";

  const semuaBaris = document.getElementById("step1")?.textContent.split("\n") || [];
  const insightList = semuaBaris.filter(line => line.includes("(") && line.includes(")"))
    .map(baris => {
      const match = baris.match(/•\s(.+?)\s\((\d{2}:\d{2})\)/);
      if (!match) return null;
      const [_, judul, jam] = match;
      const efek = cariEfekBerita(judul);
      return `• ${judul} (${jam})\n  👉 ${efek}`;
    }).filter(Boolean);

  const insight = insightList.length
    ? `📍 *Catatan Fundamental Hari Ini:*

${insightList.join("\n\n")}`
    : `📍 *Catatan Fundamental:*
Tidak ada berita berdampak tinggi hari ini. Pasar cenderung bergerak berdasarkan teknikal dan sentimen umum.`;

  return `📌 *Analisa ${pairName} — ${dateStr}*


📊 *Status Pasar Saat Ini:*
Menurut data ritel, ${buyerPercent}% trader berada di posisi BUY dan ${sellerPercent}% di posisi SELL.

Artinya, pasar saat ini menunjukkan kecenderungan ${kecenderungan}, dengan sinyal teknikal mengarah ke **${signal}**.

📈 *Tren yang Terbentuk:*
Pasar mulai membentuk tekanan dari sisi ${kecenderungan}. Jika volume dan volatilitas mendukung, peluang entry bisa muncul.

🟦 *Support Utama:* ${support}
🔵 *Resistance Utama:* ${resistance}

💡 *Strategi Potensial:*
Amati reaksi harga di zona support/resistance. Entry disarankan setelah konfirmasi candle atau breakout palsu.

${insight}

📘 *Disclaimer:*
Gunakan manajemen risiko dan jangan mengambil keputusan hanya berdasarkan AI.`;
}

// === Fungsi bantu tampilkan insight di step1 dari berita hari ini ===

async function tampilkanInsightBerita(pair, step1Id = "step1") {
  const step1 = document.getElementById(step1Id);
  const today = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');

  const currency1 = pair.name.slice(0, 3);
  const currency2 = pair.name.slice(3, 6);
  const newsURL = "https://script.google.com/macros/s/AKfycbxc2JQgw3GLARWCCSvMbHOgMsRa7Nx8-SWz61FM6tyjZ8idTl-fAtIbw1nRUqO4NG5v/exec";

  try {
    const newsData = await fetch(newsURL).then(res => res.json());
    const newsToday = newsData?.[today] || {};
    const b1 = newsToday[currency1] || [];
    const b2 = newsToday[currency2] || [];
    const semuaBerita = [...b1, ...b2];

    if (step1) {
      if (semuaBerita.length) {
        const daftar = semuaBerita.map(str => {
          const [judul, jam] = str.split("|");
          const jamWIB = convertGMTtoWIB(jam);
          const efek1 = ambilDampakDariKeyword(judul, currency1.toLowerCase());
          const efek2 = ambilDampakDariKeyword(judul, currency2.toLowerCase());
          const efek = efek1 !== "reaksi pasar bisa signifikan tergantung hasil rilisnya" ? efek1 : efek2;
          return `• ${judul} (${jamWIB})\n  🕵️ ${efek}`;
        }).join("\n\n");

        step1.textContent = `1. Berita Hari Ini:\n\n${daftar}`;
      } else {
        step1.textContent = "1. Tidak ada berita hari ini.";
      }
    }
  } catch (err) {
    console.warn("❌ Gagal ambil berita:", err);
  }
}


function cariEfekBerita(judul) {
  judul = judul.toLowerCase();
  if (judul.includes("cpi") || judul.includes("inflation")) return "USD bisa menguat karena tekanan inflasi meningkat";
  if (judul.includes("nfp") || judul.includes("non farm")) return "USD bisa menguat jika data tenaga kerja melebihi ekspektasi";
  if (judul.includes("unemployment")) return "USD bisa melemah jika angka pengangguran naik";
  if (judul.includes("rate") || judul.includes("suku bunga")) return "pasar akan bereaksi tajam tergantung keputusan suku bunga";
  return "reaksi pasar bisa signifikan tergantung hasil rilisnya";
}

function ambilDampakDariKeyword(judul, mataUang = 'usd') {
  const raw = document.getElementById("impactKeywordData");
  if (!raw) return "";
  const data = JSON.parse(raw.textContent || "{}");
  const daftar = data[mataUang.toLowerCase()] || [];
  const judulLower = judul.toLowerCase();

  for (const item of daftar) {
    const regex = new RegExp(item.keyword, 'i');
    if (regex.test(judulLower)) return item.impact;
  }

  return "reaksi pasar bisa signifikan tergantung hasil rilisnya";
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

  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
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
  }, 3000);

  // Pasang event listener search disini (supaya tidak dobel)
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
});

const url = "https://script.google.com/macros/s/AKfycby4rTfuD0tr1XuJU4R-MUacv85WRu3_ucD7QOiC11ogkupkEhXRjSF7ll0GrTgoJQqP/exec";

async function loadSignals() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const symbols = data?.symbols;

    if (!Array.isArray(symbols)) {
      throw new Error("Data symbols kosong atau bukan array");
    }

    const majorPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const majors = [], others = [];

    symbols.forEach(pair => {
      (majorPairs.includes(pair.name) ? majors : others).push(pair);
    });

    const sorted = [...majors, ...others];
    const container = document.getElementById("signals");
    if (!container) return;
    container.innerHTML = "";

    sorted.forEach(pair => {
      const buy = parseFloat(pair.longPercentage) || 0;
      const sell = parseFloat(pair.shortPercentage) || 0;
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

  } catch (e) {
    const container = document.getElementById("signals");
    if (container) {
      container.innerHTML = '<div class="box wait">Gagal ambil data: ' + e.message + '</div>';
    }
  }
}

loadSignals();
setInterval(loadSignals, 60000);


 
