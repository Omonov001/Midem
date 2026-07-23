import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import { ChildProps } from "@/types";

function Layout({ children }: ChildProps) {
  return (
    <div className="w-full h-auto bg-white dark:bg-slate-950">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
