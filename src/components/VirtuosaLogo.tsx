import logo from '@/assets/virtuosa-logo.jpeg';

interface VirtuosaLogoProps {
  className?: string;
  imgClassName?: string;
}

export function VirtuosaLogo({
  className = 'flex items-center',
  imgClassName = 'h-10 w-auto',
}: VirtuosaLogoProps) {
  return (
    <div className={className}>
      <img src={logo} alt="Virtuosa Clinica Estetica" className={imgClassName} loading="lazy" />
    </div>
  );
}
