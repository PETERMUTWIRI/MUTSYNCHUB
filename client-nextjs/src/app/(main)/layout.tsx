import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import FloatingHomeButton from '@/components/ui/FloatingHomeButton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-950 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <FloatingHomeButton />
      <Footer />
    </div>
  );
}
