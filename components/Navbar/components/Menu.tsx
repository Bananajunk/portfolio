import Link from "next/link";
import {
  BriefcaseIcon,
  AtSymbolIcon,
  ShareIcon,
} from "@heroicons/react/20/solid";
const Menu = () => {
  return (
    <ul className="menu sm:menu-horizontal rounded-box">
      <li>
        <Link href="#work">
          <BriefcaseIcon className="w-4 h-4" />
          Work
        </Link>
      </li>
      <li>
        <Link href="#projects">
          <ShareIcon className="w-4 h-4" />
          Projects
        </Link>
      </li>
      <li>
        <Link href="#contact">
          <AtSymbolIcon className="w-4 h-4" />
          Contact
        </Link>
      </li>
    </ul>
  );
};

export default Menu;
