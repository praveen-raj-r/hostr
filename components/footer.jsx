import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import React from "react";

const links = [
  {
    href: "https://www.linkedin.com/in/praveenraj-sde/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/praveen-raj-r/hostr",
    label: "GitHub Repository",
    icon: Github,
  },
  {
    href: "https://www.instagram.com/nameispraveenraj/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "mailto:praveenraj.dev@gmail.com",
    label: "Email",
    icon: Mail,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50">
      <div className="py-8 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400 text-center md:text-left font-semibold">
          © {new Date().getFullYear()} Hostr — Built & maintained by Praveen Raj
        </p>

        <div className="flex items-center gap-4">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
