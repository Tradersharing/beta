function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}


function openPopup(pair) {
  // Aktifkan tombol X untuk tutup popup
  document.querySelector(".close-btn").onclick = closePopup;

  const long = parseFloat(pair.longPercentage);
  const short = parseFloat(pair.shortPercentage);

  const currency1 = pair.name.slice(0, 3).toUpperCase();
  const currency2 = pair.name.slice(3, 6).toUpperCase();

  const total = long + short;
  const strength1 = (long / total) * 100;
  const strength2 = (short / total) * 100;

  const now = new Date();
  const today = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta' }).split('/').reverse().join('-'); // yyyy-mm-dd

  const detailTop = `
    <h2 style="text-align:center; font-size:20px; font-weight:bold; color:white; margin-bottom:16px;">
      📌 Analisa Mendalam Tanggal ${today}
    </h2>

    <p style="font-weight:bold; margin-bottom:6px;">📅 Berita Penting Hari Ini:</p>
    <div id="newsBox" style="font-size:13.5px; line-height:1.4em; margin-bottom:16px;">
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

  const scriptURL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjTDAFavdow2y3e_yFwB8wZpUF2OosTNGQjsvswV2ZDrhT8YvVnlHawFGRsSkhr-wPMEU6t-xkGzorx9OCOsw7aKLEJAz8MmJPeaEMOpnsS_lpiOJDVc8rDCwvFWZOApBAj4FJGTnwOs-Ksm1bqK_CMtgvjLBSkb59pIWeKGPYLa6fKBIHndcQGuDEEKGvNEsAbRgvAAEwfsY0yWtIUJO5HOzYgpGCaO-X5KFTZ5Oz2vTqATgizs6f4GZMWHr5sYqoQ1iNFCcc_xfP2tQa3u7rcLDvpEN6o2kJlRtnU&lib=M4fGUhhgbQOPiFbFecerFPEltF_9kevrg";

document.getElementById('popup').style.display = 'flex';

setTimeout(() => {
  document.getElementById('popupDetails').innerHTML = detailTop;

  // ✅ Gunakan UTC tanggal supaya cocok dengan key data dari Apps Script
  const today = new Date().toISOString().slice(0, 10); // "yyyy-mm-dd"

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

      const html = [];

      if (berita1.length > 0) {
        html.push(`<li>${flag[currency1] || "🏳️"} ${currency1} 💬 ${berita1.length} news • ${berita1.join(`</li><li>${flag[currency1]} ${currency1} • `)}</li>`);
      } else {
        html.push(`<li>${flag[currency1] || "🏳️"} ${currency1} • Tidak ada berita</li>`);
      }

      if (berita2.length > 0) {
        html.push(`<li>${flag[currency2] || "🏳️"} ${currency2} 💬 ${berita2.length} news • ${berita2.join(`</li><li>${flag[currency2]} ${currency2} • `)}</li>`);
      } else {
        html.push(`<li>${flag[currency2] || "🏳️"} ${currency2} • Tidak ada berita</li>`);
      }

      newsBox.innerHTML = `<ul style='padding-left:18px;'>${html.join("")}</ul>`;
    })
    .catch(() => {
      const box = document.getElementById("newsBox");
      if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
    });
}, 500);


        newsBox.innerHTML = `<ul style='padding-left:18px;'>${html.join("")}</ul>`;
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
