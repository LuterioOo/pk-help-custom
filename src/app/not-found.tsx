import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <body className="bg-[#050508] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-8xl font-bold text-yellow-400">404</p>
          <Link href="/" className="mt-6 inline-block text-yellow-400 hover:text-white">
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
