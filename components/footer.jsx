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
    label: "GitHub",
    icon: Github,
  },
  {
    href: "mailto:praveen1220raj@gmail.com",
    label: "Email",
    icon: Mail,
  },
];

const Footer = () => {
  return (
    <footer className="border-t bg-background mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
          {/* Left */}
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">Hostr</span> ✦ Built
            & Maintained by{" "}
            <span className="font-semibold text-foreground">Praveen Raj</span>
          </p>

          {/* Right */}
          <div className="flex items-center gap-3">
            {links.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                aria-label={label}
                title={label}
                className="group inline-flex items-center justify-center size-11 rounded-full border bg-card text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-brand-soft hover:border-brand/40 hover:-translate-y-0.5 active:scale-95"
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
