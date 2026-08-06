import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Flucy | Smart Task & Reminder App",
  description: "Manage tasks, deadlines, and reminders in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
