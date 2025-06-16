function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function openPopup(pair) {
  const buy = parseFloat(pair.longPercentage);
  const sell = parseFloat(pair.shortPercentage);
  const currency1 = pair.name.slice(0, 3);
  const currency2 = pair.name.slice(3, 6);

  // ✅ Format MM-DD-YYYY sesuai data dari Google Script
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { timeZone: 'UTC' }).replace(/\//g, '-');

const detailTop = `
  <p style="text-align:center; font-size:14px; color:#aaa; margin-bottom:10px;">
    ${today}
  </p>

  <p style="font-weight:bold; margin-bottom:6px;">📅 Berita Penting Hari Ini:</p>
  <div id="newsBox" style="font-size:13.5px; line-height:1.4em; margin-bottom:16px;">
    ⏳ Mengambil berita...
  </div>

  <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

  <p style="font-weight:bold; margin-bottom:6px;">Kekuatan Mata Uang:</p>
  <div class="strength-bar">
    <div class="strength-gbp" style="width:${buy}%"></div>
    <div class="strength-usd" style="width:${sell}%"></div>
  </div>
  <p style="font-size:13px; margin-bottom:16px;">
    ${currency1}: ${buy}% 🔵 &nbsp;&nbsp; ${currency2}: ${sell}% 🔴
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

  <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">
`;


  <p style="font-weight:bold; margin-bottom:6px;">Analisa:</p>
  <div id="forumAnalysis" style="font-size:13.5px; line-height:1.4em; color:#ccc;">
    (Akan diisi otomatis dari forum)
  </div>

  <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

  <p style="font-weight:bold; margin-bottom:6px;">Sinyal Hari Ini (${pair.name}):</p>
  <div id="todaySignal" style="font-size:13.5px; line-height:1.4em; color:#ccc;">
    (Sinyal akan ditampilkan di sini)
  </div>

  <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">
`;


    

    <p><b>Kekuatan Mata Uang:</b></p>
    <div class="strength-bar">
      <div class="strength-gbp" style="width:${buy}%"></div>
      <div class="strength-usd" style="width:${sell}%"></div>
    </div>
    <p style="font-size:13px;">${currency1}: ${buy}% 🔵 &nbsp;&nbsp; ${currency2}: ${sell}% 🔴</p>

    <p style="margin-top:18px;"><b>📅 Berita Penting Hari Ini:</b></p>
    <div id="newsBox" style="font-size:13.5px; line-height:1.4em; margin-bottom:10px; padding-left:4px;">
      ⏳ Mengambil berita...
    </div>

    <hr style="margin: 15px 0; border: none; border-top: 1px solid #555;">
    <div class="chat-box">
      <p style="font-size:14px; color:#ccc;">❓Tanya seputar <b>${pair.name}</b> langsung ke AI Forex:</p>
      <input type="text" id="userInput" placeholder="Tulis pertanyaan forex..." />
      <button onclick="sendToAI('${pair.name}', ${buy}, ${sell})">Kirim</button>
      <div id="aiResponse" class="ai-response"></div>
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
        const newsList = [];

        if (data[today]) {
          if (data[today][currency1]) newsList.push(...data[today][currency1]);
          if (data[today][currency2]) newsList.push(...data[today][currency2]);
        }

        if (newsList.length > 0) {
          newsBox.innerHTML = "<ul style='padding-left:18px;'>" +
            newsList.map(title => `<li>${title}</li>`).join("") +
            "</ul>";
        } else {
          newsBox.innerHTML = "Tidak ada berita penting hari ini.";
        }
      })
      .catch(err => {
        const box = document.getElementById("newsBox");
        if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
      });
  }, 50);
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

// ✅ BONUS: Loading icon saat page pertama dibuka
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

  // Hilangkan loader setelah sinyal berhasil diload
  setTimeout(() => {
    document.getElementById("pageLoader")?.remove();
  }, 2000);
});

const url = "https://myfxbook-proxy.ayulistyanto.workers.dev/?endpoint=/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

async function loadSignals() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    // 🔁 Pisahkan mayor & non-mayor
    const majorPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"];
    const majors = [];
    const others = [];

    data.symbols.forEach(pair => {
      if (majorPairs.includes(pair.name)) {
        majors.push(pair);
      } else {
        others.push(pair);
      }
    });

    const sorted = [...majors, ...others]; // Mayor dulu, lalu sisanya

    const container = document.getElementById("signals");
    container.innerHTML = "";

    sorted.forEach(pair => {
      const buy = parseFloat(pair.longPercentage);
      const sell = parseFloat(pair.shortPercentage);
      const status = buy >= 70 ? 'BUY' : sell >= 70 ? 'SELL' : 'WAIT';
      const cls = buy >= 70 ? 'buy' : sell >= 70 ? 'sell' : 'wait';

      const box = document.createElement("div");
      box.className = "box";
      box.dataset.pair = pair.name.toLowerCase(); // Untuk pencarian
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

    // 🔍 Filter pair saat user mengetik
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
    document.getElementById("signals").innerHTML = '<div class="box wait">Gagal ambil data: ' + e.message + '</div>';
  }
}


loadSignals();
setInterval(loadSignals, 60000);
