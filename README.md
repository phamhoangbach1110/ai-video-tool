# 🎬 AI Video Tool

> Tạo video viral tự động bằng AI — Hoàn toàn miễn phí, chia sẻ qua link

**Demo:** `https://your-tool.vercel.app`

---

## 🚀 Deploy lên web (Vercel + Render) — $0 mãi mãi

### Bước 1 — Push lên GitHub

```bash
cd ai-video-tool-web
git init
git add .
git commit -m "🎬 init AI Video Tool"
# Tạo repo mới tại github.com rồi chạy:
git remote add origin https://github.com/TEN_BAN/ai-video-tool.git
git push -u origin main
```

---

### Bước 2 — Deploy Backend lên Render (free)

1. Truy cập [render.com](https://render.com) → Đăng nhập bằng GitHub
2. **New** → **Web Service** → chọn repo `ai-video-tool`
3. Điền thông tin:
   - **Name:** `ai-video-tool-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 1`
   - **Instance Type:** Free
4. **Environment Variables** (tuỳ chọn):
   - `GEMINI_API_KEY` = `AIza...` (lấy tại aistudio.google.com)
5. Click **Deploy** → chờ ~3 phút
6. Copy URL backend: `https://ai-video-tool-backend.onrender.com`

> ⚠️ Free tier của Render sẽ sleep sau 15 phút không dùng, lần đầu mở có thể chờ ~30s

---

### Bước 3 — Deploy Frontend lên Vercel (free)

1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập bằng GitHub
2. **Add New Project** → Import repo `ai-video-tool`
3. Điền thông tin:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend`
4. **Environment Variables:**
   - `REACT_APP_API_URL` = URL backend Render ở bước 2
     (VD: `https://ai-video-tool-backend.onrender.com`)
5. Click **Deploy** → chờ ~2 phút
6. Nhận link: `https://ai-video-tool.vercel.app` ✅

---

### Bước 4 — Chia sẻ link!

Gửi link Vercel cho bạn bè. Họ chỉ cần mở trình duyệt, không cần cài gì cả 🎉

---

## 💻 Chạy local (Windows)

### Yêu cầu
- Python 3.9+
- Node.js 18+
- ffmpeg (`winget install ffmpeg`)

### Khởi động
```bash
# Double-click file:
start.bat
```

Backend chạy tại `http://localhost:5000`  
Frontend chạy tại `http://localhost:3000`

---

## 📁 Cấu trúc project

```
ai-video-tool-web/
├── vercel.json          ← Config deploy Vercel
├── render.yaml          ← Config deploy Render
├── start.bat            ← Chạy local Windows
├── .gitignore
│
├── frontend/            ← React App (deploy Vercel)
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       │   ├── TrendsPage.jsx
│       │   ├── GeneratePage.jsx
│       │   ├── JobsPage.jsx
│       │   └── SettingsPage.jsx
│       ├── components/
│       │   ├── Card.jsx
│       │   └── Toast.jsx
│       ├── hooks/useToast.js
│       └── utils/api.js
│
└── backend/             ← Python Flask (deploy Render)
    ├── app.py
    ├── trend_analyzer.py
    ├── script_generator.py
    ├── media_generator.py
    ├── video_assembler.py
    └── requirements.txt
```

---

## 🆓 Chi phí = $0

| Dịch vụ | Dùng cho | Giới hạn free |
|---|---|---|
| **Vercel** | Host frontend React | Không giới hạn |
| **Render** | Host backend Python | 750h/tháng (đủ dùng) |
| **Pollinations.ai** | Tạo ảnh AI | Không giới hạn |
| **gTTS** | Giọng đọc tiếng Việt | Không giới hạn |
| **Google Trends RSS** | Phân tích xu hướng | Không giới hạn |
| **Gemini 1.5 Flash** | Sinh kịch bản | 1500 req/ngày free |

---

## 🔑 API Keys (tuỳ chọn)

| Key | Lấy ở đâu | Để làm gì |
|---|---|---|
| Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) | Kịch bản AI thông minh |
| YouTube v3 | [console.cloud.google.com](https://console.cloud.google.com) | Trend YouTube chính xác |

Cả hai đều miễn phí. Không có key vẫn chạy được bình thường.
