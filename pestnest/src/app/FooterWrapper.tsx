// src/components/layout/FooterWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import Footer from '@/components/layout/Footer';

const HIDDEN_PATHS = ["/marketing", "/admin", "/adminbusiness"];

export default function FooterWrapper() {
  const pathname = usePathname();

  // Ẩn footer nếu đường dẫn bắt đầu bằng bất kỳ path nào trong HIDDEN_PATHS
  const shouldHideFooter = HIDDEN_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (shouldHideFooter) return null;
  return <Footer />;
}
