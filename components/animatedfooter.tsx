"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
 
interface FooterLink {
  label: string;
  href: string;
}
 
interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}
 
interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}
 
export const Footer = ({
  brandName = "Ai4Planning",
  brandDescription = "",
  socialLinks = [
    { icon: <Twitter />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Linkedin />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Github />, href: "https://github.com", label: "GitHub" },
    { icon: <Mail />, href: "mailto:contact@ai4planning.com", label: "Email" },
  ],
  navLinks = [],
  creatorName,
  creatorUrl,
  className,
}: FooterProps) => {
 
  // Reveal trigger
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
 
  return (
    <>
    <section className={cn(" flex-col-1 w-full overflow-hidden fixed  z-40 bottom-20  ", className)}>
     
      <motion.footer
        ref={ref}
        initial={{ opacity: 0, y: 80 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className=" bg-background mt-20 relative"
      >
        {/* Main Content */}
        <div
  className="
    max-w-full mx-auto relative
    px-4 sm:px-6 lg:px-10
    py-12 sm:py-10 md:py-16
 
    grid grid-cols-1 md:grid-cols-2 gap-12
    items-start
  "
>
 
  {/* ===== Column 1 : Brand Section ===== */}
  <div className="flex flex-col max-w-full  mb-95 items-center md:items-start text-center md:text-left">
 
    <span className="text-foreground text-3xl font-bold">
     
    </span>
 
    <p className="text-muted-foreground font-semibold max-w-sm mt-2">
      {brandDescription}
    </p>
 
    {/* Social Icons */}
    <div className="flex gap-4 items-center md:items-end text-center ml-25 md:text-right">
   
    {/* <h3 className="text-lg font-semibold text-foreground mb-3">
      Quick Links
    </h3> */}
 
    <Link href="/services" className="text-muted-foreground hover:text-foreground transition">
      Services
    </Link>
 
    <Link href="/about" className="text-muted-foreground hover:text-foreground transition mt-2">
      About Us
    </Link>
 
    <Link href="/contact" className="text-muted-foreground hover:text-foreground transition mt-2">
      Contact
    </Link>
  </div>
    {/* Optional Navigation */}
    {navLinks.length > 0 && (
      <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground mt-6">
        {navLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    )}
  </div>
 
  {/* ===== Column 2 : Empty Slot (custom content) ===== */}
  <div className="flex justify-end px-3 mt-4 mr-35 gap-4">
      {socialLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-6 h-6 hover:scale-110 transition-transform duration-300">
            {link.icon}
          </div>
          <span className="sr-only">{link.label}</span>
        </Link>
      ))}
    </div>
 
 
</div>
 
 
        {/* Background Brand Text */}
       <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
  className="
    bg-gradient-to-b  from-foreground/75 via-foreground/ to-transparent
    bg-clip-text text-transparent
    leading-none absolute left-1/2 -translate-x-1/2
    bottom-32 md:bottom-28
    font-extrabold tracking-[50px]
    pointer-events-none select-none text-center px-4
  "
  style={{
    fontSize: "clamp(3rem, 12vw, 10rem)",
    maxWidth: "95vw",
  }}
>
  {brandName.toUpperCase()}
</motion.div>
 
 
        {/* Center Logo */}
        <div className="absolute bottom-24 md:bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="hover:border-foreground duration-300 drop-shadow-[0_0px_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0px_20px_rgba(255,255,255,0.3)] backdrop-blur-sm rounded-3xl bg-background/60 border-2 border-border flex items-center justify-center p-3">
            <div className="w-20 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Image
                src="/halflogo.png"
                alt="Brand logo"
                width={100}
                height={100}
                className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
 
        {/* Decorative Line */}
        <div className="absolute bottom-32 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent w-full" />
 
        {/* Bottom Fade Shadow */}
        <div className="bg-gradient-to-t from-background via-background/80 to-background/40 blur-[1em] absolute bottom-28 w-full h-24" />
     
      </motion.footer>
 
       
    </section>
   
            </>
  );
};