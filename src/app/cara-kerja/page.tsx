import { Metadata } from "next";
import CaraKerjaClient from "./CaraKerjaClient";

export const metadata: Metadata = {
  title: "Panduan & Cara Kerja - GeraiBUMDes",
  description: "Panduan lengkap alur kerja platform GeraiBUMDes bagi pengurus BUMDes, pembeli perorangan, dan mitra bisnis B2B.",
};

export default function CaraKerjaPage() {
  return <CaraKerjaClient />;
}
