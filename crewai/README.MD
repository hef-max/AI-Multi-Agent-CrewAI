# AI Multi-Agent System dengan CrewAI

Sistem multi-agent cerdas yang menggunakan CrewAI untuk mengelola agen-agen AI yang dapat berkolaborasi, dengan dukungan Retrieval-Augmented Generation (RAG) untuk pemrosesan dokumen dan percakapan kontekstual.

## Fitur Utama

- **Multi-Agent Orchestration**: Sistem orkestrator yang mengatur routing query dan agregasi respons dari berbagai agen spesialis
- **Retrieval-Augmented Generation (RAG)**: Integrasi dengan Chroma vector database dan HuggingFace embeddings untuk pemrosesan dokumen
- **Dukungan Multi-Format Dokumen**: Upload dan pemrosesan PDF, DOCX, PPT, dan file teks
- **Dynamic Agent Creation**: Pembuatan agen khusus berdasarkan domain keahlian
- **Conversation Memory**: Penyimpanan dan pengelolaan riwayat percakapan
- **RESTful API**: Endpoint Flask untuk integrasi dengan frontend dan sistem eksternal
- **Model AI Fleksibel**: Dukungan berbagai model AI (GPT, Gemini, Claude)

## Persyaratan Sistem

- Python 3.8+
- Node.js 18+ (untuk frontend)
- API Key untuk model AI (GEMINI_API_KEY wajib, opsional lainnya)

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd AI-Multi-Agent-CrewAI/crewai
```

### 2. Backend Setup

```bash
pip install -r requirements.txt
```

### 3. Frontend Setup (Opsional)

```bash
cd ../AI-Multi-Agent-CrewAI
npm install
```

## Konfigurasi

### Environment Variables

Buat file `.env` di folder `BE`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
# Opsional: API keys untuk model lain
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Database Setup

Sistem menggunakan Chroma untuk vector storage. Database akan dibuat otomatis di folder `db/` saat pertama kali dijalankan.

## Menjalankan Aplikasi

### Backend

```bash
cd crewai
python main.py
```

Server akan berjalan di `http://0.0.0.0:5000`

### Frontend (Opsional)

```bash
cd AI-Multi-Agent-CrewAI
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## API Endpoints

### Chat
- `POST /chat`: Mengirim query dan mendapatkan respons AI
  - Body: `{"query": "pertanyaan Anda", "session_id": "optional"}`

### Agents
- `GET /agents`: Mendapatkan daftar semua agen
- `POST /agents`: Membuat agen baru
  - Body: `{"domain": "nama_domain", "model": "nama_model"}`
- `PUT /agents/<agent_id>`: Update agen
- `DELETE /agents/<agent_id>`: Hapus agen

### Knowledge Upload
- `POST /agents/<agent_id>/knowledge`: Upload dokumen untuk RAG
  - Form data: `file` (PDF/DOCX/PPT/TXT)

### File Download
- `GET /download/<filename>`: Download file output

## Struktur Proyek

```
crewai/                          # Backend Flask
├── main.py                  # Aplikasi utama
├── requirements.txt         # Dependencies Python
├── agents_db.json          # Database agen
├── conversations/          # Riwayat percakapan
├── db/                     # Chroma vector database
├── uploads/                # File upload
├── outputs/                # File output
└── my_cache/               # Cache model embeddings
```

## Penggunaan

### 1. Basic Chat
Kirim POST request ke `/chat` dengan query Anda.

### 2. Upload Dokumen
Upload dokumen melalui endpoint `/agents/<agent_id>/knowledge` untuk menambahkan pengetahuan ke sistem RAG.

### 3. Create Custom Agent
Buat agen spesialis dengan POST ke `/agents` dengan domain tertentu.

### 4. Session Management
Gunakan `session_id` untuk mempertahankan konteks percakapan di seluruh interaksi.

## Model AI yang Didukung

- GPT-3.5-turbo
- GPT-4
- Gemini 1.0 Pro
- Gemini 1.5 Pro
- Gemini 1.5 Flash
- Claude 3 Opus
- Claude 3 Sonnet

## Troubleshooting

### Error: GEMINI_API_KEY tidak ditemukan
Pastikan Anda telah menyetel `GEMINI_API_KEY` di file `.env` atau environment variables sistem.

### Error: Port 5000 sudah digunakan
Ubah port di `main.py` atau hentikan proses lain yang menggunakan port tersebut.

### Embedding Model Tidak Dimuat
Pastikan koneksi internet stabil untuk download model embeddings saat pertama kali dijalankan.

## Kontribusi

1. Fork repository
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

This project is licensed under the MIT License - see the LICENSE file for details.