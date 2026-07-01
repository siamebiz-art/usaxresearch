import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType, expectedAmount } = await req.json();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: `ตรวจสอบสลิปการโอนเงินนี้แล้วตอบเป็น JSON เท่านั้น:
{
  "valid": true/false,
  "amount": ยอดเงิน (ตัวเลขเท่านั้น หรือ null ถ้าอ่านไม่ได้),
  "date": "วันที่โอน หรือ null",
  "bank": "ชื่อธนาคาร หรือ null",
  "message": "สรุปผลการตรวจสอบเป็นภาษาไทย 1-2 ประโยค"
}

ยอดที่ควรเป็น: ฿${expectedAmount}
ถ้ายอดตรงกับ ${expectedAmount} บาท ให้ valid = true
ถ้ายอดไม่ตรง หรืออ่านไม่ได้ ให้ valid = false` }
          ]
        }]
      }),
    });

    const data = await res.json();
    const text  = data.content?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
