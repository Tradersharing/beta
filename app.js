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
      ${getFlagEmoji(currency1)}${currency1}/${currency2}${getFlagEmoji(currency2)} 📊 ${today}
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

async function buatAnalisaSekarang() {
  const pair = window.currentPair;
  const analysisPopup = document.getElementById('analysisPopup');
  const pairSymbol = (pair?.name || 'EURUSD') + '=X';
  const srURL = `https://script.google.com/macros/s/AKfycbzjlvMVo_JvB7hPI5DFyVx-CXcPSaHPug8utYk5BZTsvwmcAMHrOTvZJB7CVNkGgZrU/exec?pair=${pairSymbol}`;

  // Ambil support/resistance dari Google Apps Script
  const srData = await fetch(srURL).then(res => res.json()).catch(() => null);
  const support = srData?.support || '??';
  const resistance = srData?.resistance || '??';

   
  // Tampilkan loading animasi dulu
  // Tampilkan loading elegan dengan titik berjalan
analysisPopup.innerHTML = `
  <div style="text-align:center; padding-top:60px;">
    <img src="https://media.tenor.com/xbrfuvCqep4AAAAC/loading-chart.gif" width="100" alt="Loading..." />
    <p style="color:#fff; font-family:'Segoe UI', sans-serif; margin-top:15px; font-size:15px;">
     ⏳Menganalisis & Membuat sinyal<span id="dots">.</span>
    </p>
  </div>
`;

analysisPopup.style.display = 'flex';

// Mulai animasi titik berjalan
let dotCount = 1;
const dotsEl = document.getElementById('dots');
const dotsInterval = setInterval(() => {
  dotCount = (dotCount % 3) + 1;
  dotsEl.textContent = '.'.repeat(dotCount);
}, 500);

// Delay sebelum tampilkan hasil
await new Promise(resolve => setTimeout(resolve, 9000));

// Hentikan titik berjalan dan tampilkan konten analisa
clearInterval(dotsInterval);

analysisPopup.innerHTML = `
  <div class="analysis-main">
    <div class="corner-label"></div>
    <div id="typeWriter"></div>
    <div id="step1" style="display:none;"></div>
    <div class="footer"><button onclick="closeAnalysis()">Tutup</button></div>
  </div>`;


  // ⏬ Ambil berita dan isi ke step1 (harus ditunggu sebelum generate analisa)
  await tampilkanInsightBerita(pair);
  // Logika sinyal: BUY / SELL / WAIT
  const buyer = pair.longPercentage;
  const seller = pair.shortPercentage;
  const signal = buyer >= 70 ? 'BUY' : seller >= 70 ? 'SELL' : 'WAIT';

  // Buat isi analisa otomatis dari semua data
    
  const result = generateAutoAnalysis(pair, buyer, seller, signal, support, resistance);

  // Ketik hasil analisa dengan animasi
  setTimeout(() => {
  typeText("typeWriter", result);

  const delay = result.length * 25 + 300;
  setTimeout(() => {
    const footer = document.querySelector(".footer");
    if (footer) footer.classList.add("show");
  }, delay);

}, 600);
}


function generateAutoAnalysis(pair, buyer, seller, signal, support = "??", resistance = "??") {
  const pairName = pair.name || "EURUSD";
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric'
  });

  const buyerPercent = parseFloat(buyer).toFixed(1);
  const sellerPercent = parseFloat(seller).toFixed(1);

  const signalFinal = buyerPercent >= 70 ? "BUY" :
                      sellerPercent >= 70 ? "SELL" : "WAIT";

  const kecenderungan = signalFinal === "BUY" ? "kubu buyer"
                        : signalFinal === "SELL" ? "kubu seller"
                        : "dua sisi secara seimbang";

  const semuaBaris = document.getElementById("step1")?.textContent.split("\n") || [];
  const insightList = semuaBaris.filter(line => line.includes("(") && line.includes(")"))
    .map(baris => {
      const match = baris.match(/•\s(.+?)\s\((\d{2}:\d{2})\)/);
      if (!match) return null;
      const [_, judul, jam] = match;

      const flagCurrency = judul.includes("🇺🇸") ? "usd"
                        : judul.includes("🇬🇧") ? "gbp"
                        : judul.includes("🇪🇺") ? "eur"
                        : judul.includes("🇯🇵") ? "jpy"
                        : judul.includes("🇦🇺") ? "aud"
                        : judul.includes("🇳🇿") ? "nzd"
                        : judul.includes("🇨🇦") ? "cad"
                        : judul.includes("🇨🇭") ? "chf"
                        : judul.includes("🇨🇳") ? "cny"
                        : null;

      const efek1 = flagCurrency
        ? ambilDampakDariKeyword(judul, flagCurrency)
        : ambilDampakDariKeyword(judul, pair.name.slice(0,3).toLowerCase());

      const efek2 = ambilDampakDariKeyword(judul, pair.name.slice(3,6).toLowerCase());

      const efek = efek1 !== "reaksi pasar bisa signifikan tergantung hasil rilisnya" ? efek1 : efek2;

      return `• ${judul} (${jam})\n  ${efek}`;
    })
    .filter(Boolean);

  const catatanFundamental = insightList.length
    ? insightList.join("\n\n")
    : `Tidak ada berita berdampak tinggi hari ini.`;

  const result = `                  💻 Analisa ${pairName} — ${dateStr}



📊 Analisa Teknikal:

Data ritel menunjukkan ${buyerPercent}% trader berada di posisi BUY.
sementara ${sellerPercent}% berada di posisi SELL.
Pasar cenderung didominasi oleh ${kecenderungan}. 
Oleh karena itu, sinyal teknikal saat ini menunjukan ke arah ${signalFinal} .

Area penting yang perlu diperhatikan:

🟥• Support: ${support}

🟦• Resistance: ${resistance}

Amati reaksi harga di zona Support dan Resistance serta kombinasikan analisa teknikal & fundamental untuk mendapatkan sinyak yang akurat.

📝 Analisa Fundamental:

Berikut news dan analisa untuk pasangan mata uang ${pairName} tanggal ${dateStr} ,kamu menggunakan waktu gmt7 / WIB.

${catatanFundamental}

Disclaimer:

Gunakan manajemen risiko dan disiplin dalam setiap pengambilan keputusan.
`;

  // Kosongkan isi sebelum mulai ketik
document.getElementById("typeWriter").innerHTML = "";

setTimeout(() => {
  typeText("typeWriter", result);
  const delay = result.length * 15 + 300;
  setTimeout(() => {
    const footer = document.querySelector(".footer");
    if (footer) footer.classList.add("show");
  }, delay);
}, 600);

}

function typeText(elementId, text, speed = 10) {
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

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function closeAnalysis() {
  const popup = document.getElementById("analysisPopup");
  if (popup) popup.style.display = "none";
}

function getFlagEmoji(code) {
  const flags = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    AUD: "🇦🇺", NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳"
  };
  return flags[code] || "🏳️";
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

  // jam GMT ke WIB (GMT+7)
  hour += 7;
  if (hour >= 24) hour -= 24;

  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
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



async function tampilkanInsightBerita(pair) {
  const step1 = document.getElementById("step1");
  if (!step1) return;
  const today = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');

  const currency1 = pair.name.slice(0, 3).toUpperCase();
  const currency2 = pair.name.slice(3, 6).toUpperCase();
  const flag1 = getFlagEmoji(currency1);
  const flag2 = getFlagEmoji(currency2);

  const newsURL = "https://script.google.com/macros/s/AKfycbxc2JQgw3GLARWCCSvMbHOgMsRa7Nx8-SWz61FM6tyjZ8idTl-fAtIbw1nRUqO4NG5v/exec";

  try {
    const res = await fetch(newsURL);
    const newsData = await res.json();

    const newsToday = newsData?.[today] || {};
    const b1 = newsToday[currency1] || [];
    const b2 = newsToday[currency2] || [];
    const bullets = [];

    b1.forEach(str => {
      const parts = str.split("|");
      const judul = parts[0] || "";
      const jam = parts[1] || "";
      const jamWIB = convertGMTtoWIB(jam);
      bullets.push(`• ${flag1} ${judul} (${jamWIB})`);
    });
    b2.forEach(str => {
      const parts = str.split("|");
      const judul = parts[0] || "";
      const jam = parts[1] || "";
      const jamWIB = convertGMTtoWIB(jam);
      bullets.push(`• ${flag2} ${judul} (${jamWIB})`);
    });

    step1.textContent = bullets.join("\n\n");
  } catch (e) {
    step1.textContent = "⚠️ Gagal ambil berita.";
  }
}


      
const signalsUrlPrimary = "https://script.google.com/macros/s/AKfycbyVkUDWcnqS35xmwwPtMLJRCEur5J4y578UD89mijqBUcn0N3ivrifdwWGhhSBx56M/exec"; // ✅ Google Script utama
const signalsUrlBackup = "https://script.google.com/macros/s/AKfycbz0nOF6LQWbQd4Zy9WagBiq433l0G0nn2la4j9QC73Vfgt3_Fz_hRuhH3fr0NiPt46rOA/exec"; // 🔁 MyFXBook-style backup

async function loadSignals(url = signalsUrlPrimary) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const symbols = data?.symbols;

    const majorPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const majors = [], others = [];

    // Pisahkan ke majors & others
    symbols.forEach(pair => {
      (majorPairs.includes(pair.name) ? majors : others).push(pair);
    });

    const topPairs = [
      "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
      "USDCHF", "NZDUSD", "EURJPY", "GBPJPY", "AUDJPY",
      "EURGBP", "EURCHF", "EURCAD", "EURAUD", "EURNZD",
      "GBPAUD", "GBPCAD", "GBPNZD", "CADJPY", "CHFJPY",
      "AUDCAD", "AUDCHF", "AUDNZD", "NZDCAD", "NZDJPY",
      
    ];

    // Filter hanya topPairs yang ada di data
    const filtered = topPairs
      .map(name => [...majors, ...others].find(pair => pair.name === name))
      .filter(Boolean);

    const container = document.getElementById("signals");
    container.innerHTML = "";

    filtered.forEach(pair => {
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

  } catch (e) {
    document.getElementById("signals").innerHTML = '<div class="box wait">⚠️ Gagal ambil data: ' + e.message + '</div>';
  }
}

// Jalankan & auto refresh
loadSignals(signalsUrlPrimary);
setInterval(() => loadSignals(signalsUrlPrimary), 60000);
