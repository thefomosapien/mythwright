import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNav />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  );
}
