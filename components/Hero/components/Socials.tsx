import { FiGithub } from "react-icons/fi";
import { CiLinkedin } from "react-icons/ci";

const Socials = () => {
  return (
    <section className="flex flex-row gap-10">
      <a
        href="https://github.com/bananajunk"
        target="_blank"
        aria-label="Link to github profile"
        className="rounded-full z-30 bg-accent p-3"
      >
        <FiGithub className="w-8 h-8 text-primary" />
      </a>
      <a
        href="https://www.linkedin.com/in/cl2reid/"
        target="_blank"
        aria-label="Link to LinkedIn profile"
        className="rounded-full z-30 bg-accent p-3"
      >
        <CiLinkedin className="w-8 h-8 text-primary" />
      </a>
    </section>
  );
};

export default Socials;
