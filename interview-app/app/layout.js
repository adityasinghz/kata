import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "InterviewAI — AI-Assisted Interview Screening",
  description: "Innovative AI technology for smarter candidate evaluation. Adaptive questioning, structured scoring, and human-in-the-loop review.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
