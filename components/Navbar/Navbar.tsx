import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { Menu } from "./components";

const Navbar = () => {
  return (
    <nav className="sm:px-16 px-6 w-full flex items-center py-5 fixed top-0 z-20 bg-base">
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-primary">
          Bananajunk
        </Link>
        {/* Standard Navigation */}
        <div className="hidden sm:flex">
          <Menu />
        </div>
        {/* Mobile Navigation */}
        <details className="dropdown dropdown-end sm:hidden flex">
          <summary className="btn bg-base-100 border-none text-neutral-content">
            <Bars3Icon className="w-5 h-5 font-bold" />
          </summary>
          <div className="mt-2 dropdown-content shadow-md rounded-box bg-base-100 w-52">
            <Menu />
          </div>
        </details>
      </div>
    </nav>
  );
};

export default Navbar;
