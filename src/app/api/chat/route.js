import { cookies } from "next/headers";
import groq from "@/lib/groq";
import db from "@/lib/db";

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const jsonString = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const { message, isFirstMessage } = await req.json();
    if (!message || !message.trim()) {
      return Response.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    const greetingKeywords = /^(halo|hai|assalamu|pagi|siang|malam|sore|permisi|boleh|selamat|hi|hello)/i;
    if (isFirstMessage && greetingKeywords.test(message.trim())) {
      return Response.json({
        success: true,
        reply: "Halo! Tentu saja. Ada yang bisa saya bantu mengenai layanan bengkel, servis motor, atau produk ORAWIM MOTOR?",
      });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value || null;

    const connection = await db.getConnection();
    const [servicesRaw] = await connection.execute(
      "SELECT id, name, service_name, description FROM services ORDER BY id"
    );
    const services = (servicesRaw || []).map((service) => ({
      ...service,
      name: service.name || service.service_name || "Layanan",
    }));
    const [products] = await connection.execute(
      "SELECT id, name, description, price, stock FROM products ORDER BY id"
    );
    connection.release();

    if (!services || services.length === 0) {
      const bookingRequestKeywords = /booking|book|service|reservasi|pesan|jadwal/i;
      if (bookingRequestKeywords.test(message)) {
        return Response.json({
          success: true,
          reply:
            "Sayangnya, saya tidak bisa membuat booking karena layanan yang tersedia belum diisi. Silakan cek kembali layanan yang tersedia sebelum membuat booking.",
        });
      }
    }

    const serviceList = services
      .map((service) => `${service.id}. ${service.name}`)
      .join("\n");

    const productList = products
      .map(
        (product) =>
          `${product.id}. ${product.name} - Rp${Number(product.price || 0).toLocaleString("id-ID")} (${product.stock} stok)`
      )
      .join("\n");

    const systemPrompt = `Kamu adalah ORAWIM Assistant, asisten virtual resmi ORAWIM MOTOR.

Karakter:
- Ramah, sopan, profesional, dan komunikatif.
- Gunakan bahasa Indonesia yang natural.

Aturan:

1. Jika pengguna hanya menyapa atau membuka percakapan, balas dengan ramah dan helpful.
Contoh:
- "Halo"
- "Hai"
- "Halo saya mau tanya dong"
- "Permisi"
- "Boleh tanya?"
- "Selamat pagi"

Balas dengan jawaban yang menawarkan bantuan, contohnya:
"Apa yang bisa saya bantu hari ini? Pertanyaan tentang layanan servis, produk, atau booking?"

2. Jika pertanyaan pengguna belum lengkap, jangan menebak maksudnya.
Ajak pengguna menjelaskan lebih lanjut.

Contoh:
User:
"Saya mau tanya."

Balasan:
"Tentu. Silakan sampaikan pertanyaannya, saya akan membantu semampu saya."

3. Fokus utama adalah membantu mengenai:
- layanan servis
- booking
- produk
- harga
- estimasi servis
- jam operasional
- lokasi bengkel

4. Gunakan HANYA data berikut.

Data layanan:
${serviceList}

Data produk:
${productList}

5. Jangan mengarang data harga, stok, ataupun layanan.

6. Jika pengguna ingin membuat booking, keluarkan JSON sebagai BARIS PERTAMA dengan format:

{
  "action":"create_booking",
  "service_name":"Nama layanan",
  "booking_date":"YYYY-MM-DD",
  "complaint":"Keluhan",
  "down_payment":0
}

Setelah JSON, berikan penjelasan singkat kepada pengguna.

7. Jika informasi tidak tersedia, katakan dengan jujur bahwa informasi tersebut belum tersedia.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const rawReply = completion?.choices?.[0]?.message?.content || "Maaf, saya tidak dapat menjawab saat ini.";
    const actionData = extractJsonObject(rawReply);

    if (actionData?.action === "create_booking") {
      if (!userId) {
        return Response.json(
          {
            success: true,
            reply: "Silakan login dulu agar saya bisa membuat booking untuk Anda melalui chatbot.",
          },
          { status: 200 }
        );
      }

      const serviceName = actionData.service_name?.trim();
      const bookingDate = actionData.booking_date?.trim();
      const complaint = actionData.complaint?.trim() || "";
      const downPayment = Number(actionData.down_payment || 0);

      if (!serviceName || !bookingDate) {
        return Response.json({
          success: true,
          reply:
            "Saya membutuhkan detail layanan dan tanggal booking. Mohon kirim lagi dengan layanan yang jelas dan tanggal dalam format YYYY-MM-DD.",
        });
      }

      let service = services.find(
        (item) => item.name && item.name.toLowerCase() === serviceName.toLowerCase()
      );

      if (!service) {
        service = services.find(
          (item) => item.name && item.name.toLowerCase().includes(serviceName.toLowerCase())
        );
      }

      if (!service) {
        return Response.json({
          success: true,
          reply: `Layanan \"${serviceName}\" tidak ditemukan. Silakan pilih layanan yang tersedia: ${services
            .map((item) => item.name)
            .join(", ")}`,
        });
      }

      const bookingConnection = await db.getConnection();
      try {
        const [result] = await bookingConnection.execute(
          "INSERT INTO bookings (user_id, service_id, booking_date, complaint, down_payment, status) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, service.id, bookingDate, complaint, downPayment, "pending"]
        );

        bookingConnection.release();

        return Response.json({
          success: true,
          reply: `Booking untuk layanan ${service.name} pada ${bookingDate} berhasil dibuat. ID booking: ${result.insertId}.`,
          booking_id: result.insertId,
        });
      } catch (error) {
        bookingConnection.release();
        console.error("Booking creation error:", error);
        return Response.json(
          {
            success: false,
            reply: "Terjadi kesalahan saat membuat booking. Silakan coba lagi.",
            error: error.message,
          },
          { status: 500 }
        );
      }
    }

    const bookingKeywords = /booking|book|reservasi|reservasi|pesan.*service|pesan.*booking|reservasi.*service|reservasi.*booking/i;
    if (bookingKeywords.test(message) && !actionData) {
      return Response.json({
        success: true,
        reply:
          "Saya siap membantu membuat booking. Silakan sebutkan layanan yang Anda inginkan dan tanggal booking dengan format YYYY-MM-DD.",
      });
    }

    return Response.json({ success: true, reply: rawReply });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { success: false, message: "Gagal memproses chat", error: error.message },
      { status: 500 }
    );
  }
}
