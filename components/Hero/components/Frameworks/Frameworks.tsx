import { FaCss3Alt, FaReact } from "react-icons/fa";
import {
  SiAmazonaws,
  SiGooglecloud,
  SiJavascript,
  SiMysql,
  SiPhp,
  SiRubyonrails,
  SiTailwindcss,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";

import { Framework } from "./components";

const Frameworks = () => {
  return (
    <section className="flex gap-4 items-center flex-wrap">
      <Framework label="React">
        <FaReact className="text-[#087ea4]" />
      </Framework>
      <Framework label="NextJS">
        <TbBrandNextjs className="text-black " />
      </Framework>
      <Framework label="Javascript">
        <SiJavascript className="text-[#ebd41c]" />
      </Framework>
      <Framework label="Tailwind">
        <SiTailwindcss className="text-[#09adc9]" />
      </Framework>
      <Framework label="CSS">
        <FaCss3Alt className="text-[#1472b6]" />
      </Framework>
      <Framework label="Ruby on Rails">
        <SiRubyonrails className="text-[#d30002]" />
      </Framework>
      <Framework label="MySQL">
        <SiMysql className="text-[#025b82]" />
      </Framework>
      <Framework label="AWS">
        <SiAmazonaws className="text-[#f29100]" />
      </Framework>
      <Framework label="GCP">
        <SiGooglecloud className="text-content" />
      </Framework>
    </section>
  );
};

export default Frameworks;
