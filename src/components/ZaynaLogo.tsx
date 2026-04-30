import logo from "@/assets/zayna-logo.png";

interface ZaynaLogoProps {
  className?: string;
  imgClassName?: string;
}

export function ZaynaLogo({ className = "flex items-center", imgClassName = "h-10 w-auto" }: ZaynaLogoProps) {
  return (
    <div className={className}>
      <img src={logo} alt="Zayna" className={imgClassName} loading="lazy" />
    </div>
  );
}