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

        if (data && data[today]) {
          const todayData = data[today];
          const berita1 = todayData[currency1] || [];
          const berita2 = todayData[currency2] || [];
          const allNews = [...berita1, ...berita2];

          if (allNews.length > 0) {
            newsBox.innerHTML = "<ul style='padding-left:18px;'>" +
              allNews.map(title => `<li>${title}</li>`).join("") +
              "</ul>";
          } else {
            newsBox.innerHTML = "Tidak ada berita penting hari ini.";
          }
        } else {
          newsBox.innerHTML = "Tidak ada data hari ini.";
        }
      })
      .catch(err => {
        const box = document.getElementById("newsBox");
        if (box) box.innerHTML = "⚠️ Gagal memuat berita.";
      });
  }, 500);
}
