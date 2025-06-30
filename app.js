// === Load Signals ===
const signalsUrlPrimary = "https://script.google.com/macros/s/AKfycbz0nOF6LQWbQd4Zy9WagBiq433l0G0nn2la4j9QC73Vfgt3_Fz_hRuhH3fr0NiPt46rOA/exec";
async function loadSignals(url = signalsUrlPrimary) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const symbols = data?.symbols;
    const majorPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const majors = [], others = [];
    symbols.forEach(pair => (majorPairs.includes(pair.name) ? majors : others).push(pair));

    const topPairs = [
      "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD",
      "EURJPY", "GBPJPY", "AUDJPY", "EURGBP", "EURCHF", "EURCAD", "EURAUD", "EURNZD",
      "GBPAUD", "GBPCAD", "GBPNZD", "CADJPY", "CHFJPY", "AUDCAD", "AUDCHF",
      "AUDNZD", "NZDCAD", "NZDJPY", "XAUUSD", "BTCUSD",
    ];

    const filtered = topPairs.map(name => [...majors, ...others].find(p => p.name === name)).filter(Boolean);
    const container = document.getElementById("signals");
    container.innerHTML = "";

    filtered.forEach(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';

      const box = document.createElement("div");
      box.className = "box";
      box.onclick = () => openPopup(pair);

      box.innerHTML = `
        <div class="pair">${pair.name}</div>
        <canvas width="150" height="100"></canvas>
        <div class="value">Buy: ${buy}% | Sell: ${sell}%</div>
        <div class="signal ${cls}">${status}</div>
        <div class="detail-link">Buka</div>
      `;
      container.appendChild(box);
      renderGaugeOnCanvas(box.querySelector("canvas"), buy, sell);
    });
  } catch (e) {
    document.getElementById("signals").innerHTML = '<div class="box wait">⚠️ Gagal ambil data: ' + e.message + '</div>';
  }
}
loadSignals();
setInterval(() => loadSignals(), 60000);

// === Open Popup & Fetch News + Strength ===
function openPopup(pair) {
  const long = parseFloat(pair.longPercentage);
  const short = parseFloat(pair.shortPercentage);
  const currency1 = pair.name.slice(0, 3).toUpperCase();
  const currency2 = pair.name.slice(3, 6).toUpperCase();
  const total = long + short;
  const strength1 = (long / total) * 100;
  const strength2 = (short / total) * 100;

  const today = new Date().toLocaleDateString('en-US', {
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

  document.getElementById('popupDetails').innerHTML = detailTop;
  document.getElementById('popup').style.display = 'flex';

  window.currentPair = pair;
  window.currentStrength = { strength1, strength2 };

  const newsURL = "https://script.google.com/macros/s/AKfycbyU9Bqi5HxfpLltuHNk5wGyox1U-ut93zTcFEl1fn8P_XxTjZQbxGDh2YvrV08yX8s/exec";
  fetch(newsURL).then(res => res.json()).then(data => {
    const box = document.getElementById("newsBox");
    const b1 = data?.[today]?.[currency1] || [];
    const b2 = data?.[today]?.[currency2] || [];

    function renderNews(currency, arr) {
      const flag = getFlagEmoji(currency);
      return `<div style="margin-bottom:10px;"><div style="font-weight:bold;">${flag} ${currency}</div>${
        arr.length ? `<ul>${arr.map(str => {
          const [judul, jam, impact] = str.split("|");
          const color = impact === "High" ? "#ff4d4d" : impact === "Medium" ? "#ffa500" : "#ccc";
          const jamWIB = convertGMTtoWIB(jam);
          return `<li style="color:${color};">• ${judul} (${jamWIB})</li>`;
        }).join("")}</ul>` : `<p style="color:gray;">Tidak ada berita penting hari ini.</p>`
      }</div>`;
    }

    const htmlContent = 
      renderNews(currency1, b1) +
      renderNews(currency2, b2);

    box.innerHTML = `<div>${htmlContent}</div>`;

    // Simpan isi plain-text ke #step1 (untuk generate analisa)
    const step1 = document.getElementById("step1");
    if (step1) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const plainText = doc.body.innerText;
      step1.textContent = plainText;
    }
  });
}



// === Analisa Otomatis ===

async function buatAnalisaSekarang() {
  const pair = window.currentPair;
  const { strength1, strength2 } = window.currentStrength || { strength1: 0, strength2: 0 };
  const analysisPopup = document.getElementById('analysisPopup');

  analysisPopup.innerHTML = `<div style="text-align:center; padding-top:60px;">
    <img src="https://media.tenor.com/xbrfuvCqep4AAAAC/loading-chart.gif" width="100" alt="Loading..." />
    <p style="color:#fff; font-family:'Segoe UI'; margin-top:15px; font-size:15px;">⏳Menganalisis & Membuat sinyal<span id="dots">.</span></p>
  </div>`;
  analysisPopup.style.display = 'flex';

  let dotCount = 1;
  const dotsEl = document.getElementById('dots');
  const dotsInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;
    dotsEl.textContent = '.'.repeat(dotCount);
  }, 500);

  const pairSymbol = pair.name + '=X';
  const srURL = `https://script.google.com/macros/s/AKfycbzjlvMVo_JvB7hPI5DFyVx-CXcPSaHPug8utYk5BZTsvwmcAMHrOTvZJB7CVNkGgZrU/exec?pair=${pairSymbol}`;
  const srData = await fetch(srURL).then(res => res.json()).catch(() => null);
  const support = srData?.support || '??';
  const resistance = srData?.resistance || '??';

  await new Promise(r => setTimeout(r, 3000));
  clearInterval(dotsInterval);

  analysisPopup.innerHTML = `<div class="analysis-main">
    <div id="typeWriter"></div>
    <div class="footer"><button onclick="closeAnalysis()">Tutup</button></div>
  </div>`;

  const buyer = pair.longPercentage;
  const seller = pair.shortPercentage;
  const signal = buyer >= 70 ? "BUY" : seller >= 70 ? "SELL" : "WAIT";

  const hasil = generateAutoAnalysis(pair, buyer, seller, signal, support, resistance, strength1, strength2);
  typeText("typeWriter", hasil);
}

// === Generate Auto Analysis

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

  // ✅ Ambil isi berita dari #step1 yang sudah dirender di openPopup
  const rawInsight = document.getElementById("step1")?.textContent || "";
  const semuaBaris = rawInsight.split(/\n+/).map(s => s.trim()).filter(s => s.startsWith("•"));

  const insightList = semuaBaris.map(baris => {
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
      : ambilDampakDariKeyword(judul, pair.name.slice(0, 3).toLowerCase());

    const efek2 = ambilDampakDariKeyword(judul, pair.name.slice(3, 6).toLowerCase());

    const efek = efek1 !== "reaksi pasar bisa signifikan tergantung hasil rilisnya"
                ? efek1 : efek2;

    return `• ${judul} (${jam})\n  ${efek}`;
  }).filter(Boolean);

  const catatanFundamental = insightList.length
    ? insightList.join("\n\n")
    : `Tidak ada berita berdampak tinggi hari ini.`;

 
  const result = `                  💻 Analisa ${pairName} — ${dateStr}



📊 Analisa Teknikal:

Data ritel menunjukkan ${buyerPercent}% trader berada di posisi BUY.
sementara ${sellerPercent}% berada di posisi SELL.
Kekuatan: ${pairName.slice(0,3)} ${buyerPercent}% vs ${pairName.slice(3,6)} ${sellerPercent}%
Pasar cenderung didominasi oleh ${kecenderungan}.
Oleh karena itu, sinyal teknikal saat ini menunjukan ke arah ${signalFinal} .

📌 Area Penting:
🟥 Support: ${support}
🟦 Resistance: ${resistance}

Amati reaksi harga di zona Support dan Resistance serta kombinasikan analisa teknikal & fundamental untuk mendapatkan sinyak yang akurat.

📝 Analisa Fundamental:

Berikut news dan analisa untuk pasangan mata uang ${pairName} tanggal ${dateStr} , menggunakan waktu gmt7 / WIB.

${catatanFundamental}

Disclaimer:

Gunakan manajemen risiko dan disiplin dalam setiap pengambilan keputusan.
`;

  // Kosongkan sebelum mulai ketik
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


// === Utilitas
function typeText(id, text, speed = 15) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  let i = 0;
  (function ketik() {
    if (i < text.length) {
      el.textContent += text.charAt(i++);
      setTimeout(ketik, speed);
    }
  })();
}
function renderGaugeOnCanvas(canvas, buy, sell) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath(); ctx.arc(75, 100, 70, Math.PI, 2 * Math.PI); ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 3; ctx.stroke();
  let drawLine = (angle, color) => {
    ctx.beginPath(); ctx.moveTo(75, 100);
    ctx.lineTo(75 + 60 * Math.cos(angle), 100 + 60 * Math.sin(angle));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  };
  drawLine(Math.PI + (buy / 100) * Math.PI, "#00ff00");
  drawLine(Math.PI + (sell / 100) * Math.PI, "#ff4444");
}
function getFlagEmoji(code) {
  const map = { USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳" };
  return map[code] || "🏳️";
}
function convertGMTtoWIB(gmtTime) {
  if (!gmtTime) return "Invalid";
  const match = gmtTime.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return gmtTime + " (format salah)";
  let [_, hour, minute, period] = match;
  hour = parseInt(hour); minute = parseInt(minute);
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  hour += 7;
  const h = String(hour % 24).padStart(2, "0"), m = String(minute).padStart(2, "0");
  return `${h}:${m}` + (hour >= 24 ? " (besok)" : "");
}
function closeAnalysis() {
  document.getElementById("analysisPopup").style.display = "none";
}
