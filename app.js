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
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const today = `${mm}-${dd}-${yyyy}`;

  // ✅ HEADER baru: Analisa Mendalam (PAIR) Tanggal MM-DD-YYYY
  const header = `
    <h2 style="
      text-align:center;
      font-size:20px;
      color:white;
      text-shadow: 1px 1px 2px black;
      font-weight:bold;
      margin-bottom:14px;
    ">
       Analisa ${pair.name}  ${today}
    </h2>
  `;

  const detailTop = header + `
    <p style="font-size:14px; color:#aaa; margin-bottom:10px; text-align:center;">
      ${today}
    </p>

    <p style="font-weight:bold; margin-bottom:6px;">📅 Berita Penting Hari Ini:</p>
    <div id="newsBox" style="font-size:13.5px; line-height:1.6em; margin-bottom:16px;">
      ⏳ Mengambil berita...
    </div>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

    <p style="font-weight:bold; margin-bottom:6px;">Kekuatan Mata Uang:</p>
    <div class="strength-bar">
      <div class="strength-gbp" style="width:${strength1}%"></div>
      <div class="strength-usd" style="width:${strength2}%"></div>
    </div>
    <p style="font-size:13px; margin-bottom:16px;">
      ${currency1}: ${strength1.toFixed(1)}% 🔵 &nbsp;&nbsp; ${currency2}: ${strength2.toFixed(1)}% 🔴
    </p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

    <p style="font-weight:bold; margin-bottom:6px;">Analisa:</p>
    <div id="forumAnalysis" style="font-size:13.5px; line-height:1.4em; color:#ccc;">
      (Akan diisi otomatis dari forum)
    </div>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

    <p style="font-weight:bold; margin-bottom:6px;">Sinyal Hari Ini (${pair.name}):</p>
    <div id="todaySignal" style="font-size:13.5px; line-height:1.4em; color:#ccc;">
      (Sinyal akan ditampilkan di sini)
    </div>
  `;

  const scriptURL = "https://script.google.com/macros/s/AKfycbz6lDiYq6a9TtB8HVCJ5VBvV2oBwBwRpRTPyVzRhJfX63456sHoJ24hUMKRYR8yt_mTRA/exec";

  document.getElementById('popup').style.display = 'flex';

  setTimeout(() => {
    document.getElementById('popupDetails').innerHTML = detailTop;

    fetch(scriptURL)
      .then(res => res.json())
      .then(data => {
        const newsBox = document.getElementById("newsBox");
        const todayData = data?.[today] || {};
        const berita1 = todayData[currency1] || [];
        const berita2 = todayData[currency2] || [];

        const flag = {
          USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
          AUD: "🇦🇺", NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳"
        };

        // ✅ Konversi jam GMT ke GMT+7
        function toWIB(jamGMT) {
          const [h, m] = jamGMT.split(':').map(Number);
          const date = new Date();
          date.setUTCHours(h, m, 0, 0);
          date.setUTCHours(date.getUTCHours() + 7);
          return String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0');
        }

        const list = [];

        if (berita1.length > 0) {
          berita1.forEach(item => {
            const [judul, jam] = item.split('|');
            const jamWIB = toWIB(jam);
            list.push(`• ${jamWIB} ${flag[currency1] || "🏳️"} ${currency1} : ${judul}`);
          });
        }

        if (berita2.length > 0) {
          berita2.forEach(item => {
            const [judul, jam] = item.split('|');
            const jamWIB = toWIB(jam);
            list.push(`• ${jamWIB} ${flag[currency2] || "🏳️"} ${currency2} : ${judul}`);
          });
        }

        newsBox.innerHTML = list.length > 0
          ? `<div style="padding-left:10px;">${list.join('<br>')}</div>`
          : "Tidak ada berita penting hari ini.";
      })
      .catch(() => {
        const box = document.getElementById("newsBox");
        if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
      });
  }, 500);
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
