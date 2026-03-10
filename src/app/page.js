// pages/index.js
"use client"
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiOutlineCloseCircle, AiOutlineDownload } from "react-icons/ai";

export default function Home() {
  // Tab state: "chat" atau "analyze"
  const [activeTab, setActiveTab] = useState("chat");
  
  // State untuk dropdown
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const dropdownRef = useRef(null);

  // State Chat
  const [sessionId, setSessionId] = useState("default");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // State Analisis Dokumen
  const [file, setFile] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [downloadableFile, setDownloadableFile] = useState(null);

  // -----------------------
  // Fungsi Chat
  // -----------------------
  const handleSendChat = async () => {
    if (!input.trim() && !file) return; // Ensure at least a message or file is sent

    const userMessage = input.trim();
    let newMessages = [...messages];

    // Add user's message if available
    if (userMessage) {
        newMessages.push({ sender: "User", text: userMessage });
    }

    // If a document is uploaded, show it in the chat
    if (file) {
        newMessages.push({
            sender: "User",
            text: `📄 Menggunakan Dokumen: ${file.name}`,
            file: file, // Store file reference
        });
    }

    setMessages(newMessages);
    setInput("");
    setFile(null); // Clear file after sending
    setLoadingChat(true);

    // Prepare formData
    const formData = new FormData();
    if (userMessage) formData.append("query", userMessage);
    formData.append("session_id", sessionId);
    if (file) formData.append("document", file); // Only append if file exists

    try {
      const res = await fetch("http://localhost:5000/chat", {
          method: "POST",
          body: formData,
      });
  
      const data = await res.json();
      
      // Jika ada file yang bisa didownload dari respons
      if (data.downloadableFile) {
          setDownloadableFile({
              url: data.downloadableFile.url,
              filename: data.downloadableFile.filename
          });
          
          // Extract the text response from the data object
          newMessages.push({ 
              sender: "AI", 
              text: data.response, // This should be a string
              hasDownloadableFile: true,
              fileInfo: {
                  filename: data.downloadableFile.filename
              }
          });
      } else {
          // Extract the text response from the data object
          newMessages.push({ 
              sender: "AI", 
              text: data.response // This should be a string
          });
      }
  
      setMessages(newMessages);
    } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [...prev, { sender: "AI", text: "Maaf, terjadi kesalahan..." }]);
    }

    setLoadingChat(false);
};

  // Menangani tekan tombol Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  // Menutup dropdown ketika klik di luar
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowUploadOptions(false);
    }
  };

  // Tambahkan event listener untuk klik di luar
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
  }

  // -----------------------
  // Fungsi Analisis Dokumen
  // -----------------------
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setDocStatus(`File dipilih: ${e.target.files[0].name}`);
      setShowAnalysisPanel(true);
      setShowUploadOptions(false);
    }
  };

  const handleUploadType = (type) => {
    if (type === 'computer') {
      document.getElementById('file-upload').click();
    } else {
      // Handle Google Drive or OneDrive
      alert(`Fitur upload dari ${type} akan segera tersedia.`);
      setShowUploadOptions(false);
    }
  };


  // Fungsi untuk mendownload file
  const handleDownloadFile = async (fileUrl, filename) => {
    try {
      // Untuk simulasi, jika ini adalah demonstrasi
      if (!fileUrl || fileUrl.startsWith('mock://')) {
        // Buat blob demo untuk pengujian
        const demoContent = "Ini adalah konten dokumen demo untuk download";
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const objectUrl = URL.createObjectURL(blob);
        
        // Download file demo
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename || 'dokumen-demo.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Bersihkan URL objek
        URL.revokeObjectURL(objectUrl);
        return;
      }
      
      // Jika URL dimulai dengan path relatif seperti "/download/filename.pdf"
      if (fileUrl.startsWith('/download/')) {
        // Ambil file dari server
        const response = await fetch(`http://localhost:5000/download/${filename}`, {
          method: 'GET',
          credentials: 'same-origin', // Untuk mengirim cookies jika ada
        });
        
        if (!response.ok) {
          throw new Error(`Download gagal: ${response.status} ${response.statusText}`);
        }
        
        // Mengubah response menjadi blob
        const blob = await response.blob();
        
        // Membuat URL objek dari blob
        const objectUrl = URL.createObjectURL(blob);
        
        // Membuat link untuk download
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename || fileUrl.split('/').pop(); // Gunakan nama file dari URL jika tidak disediakan
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Bersihkan URL objek
        URL.revokeObjectURL(objectUrl);
      } else {
        // Jika URL sudah lengkap (bukan path relatif)
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = filename || fileUrl.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error saat mendownload file:', error);
      alert('Gagal mendownload file. Silakan coba lagi nanti.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };  

  const removeFile = () => {
    setFile(null);
    setDocStatus("");
  };

  // -----------------------
  // Komponen UI utama
  // -----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Multi Agent AI Chat</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center py-8">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Chat UI */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-[600px]">
            {/* Session ID */}
            <div className="mb-4 flex items-center space-x-2">
              <label className="text-gray-600 font-medium text-sm">Session ID:</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-600"
              />
            </div>

            {/* Area Chat */}
            <div className="flex-grow overflow-y-auto mb-4 bg-gray-50 rounded-md p-4 scrollbar-thin scrollbar-thumb-gray-300">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-center">Mulai percakapan dengan mengirim pesan</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.sender === "User" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "AI" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                        AI
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-sm ${
                        msg.sender === "User"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      } shadow`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      {/* Download Button for AI messages with downloadable files */}
                      {msg.sender === "AI" && msg.hasDownloadableFile && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleDownloadFile(downloadableFile?.url, downloadableFile?.filename)}
                            className="flex items-center space-x-2 bg-white text-indigo-600 px-3 py-2 rounded-md shadow-sm hover:bg-indigo-50 transition-colors border border-indigo-200"
                          >
                            <AiOutlineDownload className="h-5 w-5" />
                            <span>Download {msg.fileInfo.filename || "Dokumen"}</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Show file only if available */}
                      {msg.file && (
                        <div className="mt-2 p-2 border border-gray-300 rounded bg-white">
                          <p className="text-sm font-semibold">{msg.file.name}</p>
                          <p className="text-xs text-gray-500">{(msg.file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      )}
                    </div>
                    {msg.sender === "User" && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white ml-2 flex-shrink-0">
                        U
                      </div>
                    )}
                  </div>
                ))
              )}
              {loadingChat && (
                <div className="flex justify-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2">
                    AI
                  </div>
                  <div className="bg-gray-200 text-gray-200 rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area with Plus Button and Dropdown */}
            <div className="flex space-x-2 items-center relative">
              {/* Plus Button and Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowUploadOptions(!showUploadOptions)} 
                  className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Upload Options Dropdown */}
                {showUploadOptions && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg w-64 z-10 overflow-hidden border border-gray-200">
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-medium text-gray-700">Unggah Dokumen</h3>
                    </div>
                    <ul>
                      <li>
                        <button
                          onClick={() => handleUploadType('google-drive')}
                          className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                          </span>
                          <span className="text-gray-600">Hubungkan ke Google Drive</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleUploadType('onedrive')}
                          className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 13h6v2H9v-2zm0-5h6v2H9V8zm13 10v1H2v-1h20zm0-14v11H2V4h20z"/>
                            </svg>
                          </span>
                          <span className="text-gray-600">Hubungkan ke Microsoft OneDrive</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleUploadType('computer')}
                          className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                        >
                          <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-gray-600">Unggah dari komputer</span>
                        </button>
                      </li>
                    </ul>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Input Text and Documents */}
              <div className="flex-1 relative">
              {file && (
                <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Documents</p>
                        <p className="text-base font-semibold truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      {/* Delete the document */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={removeFile}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <AiOutlineCloseCircle className="h-5 w-5" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                )}
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[50px] max-h-[100px] pr-10 text-gray-700"
                />
                {loadingChat && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendChat}
                disabled={loadingChat}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-gray-500 text-sm">
          <div>
            &copy; {new Date().getFullYear()} Multi Agent AI Chat. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-indigo-600 transition-colors">Bantuan</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Dokumentasi</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}