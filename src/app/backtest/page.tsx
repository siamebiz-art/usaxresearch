import type { Metadata } from "next";
import BacktestShell from "@/components/BacktestShell";

export const metadata: Metadata = {
  title: "จำลองย้อนหลัง: DCA ทุกสิ้นเดือน vs ซื้อตอนย่อ — USAXresearch",
  description: "ใส่เงินเท่ากันทุกเดือนในหุ้นสหรัฐ แล้วดูว่า DCA กับการรอซื้อตอนราคาย่อ แบบไหนเหลือเงินมากกว่า ด้วยราคาจริงย้อนหลังรวมปันผล",
  manifest: null,
};

export default function Page() {
  return <BacktestShell />;
}
