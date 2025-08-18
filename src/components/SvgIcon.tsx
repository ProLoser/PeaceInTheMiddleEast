import React, { useEffect, useState } from 'react';

interface SvgIconProps {
  iconName: string;
  className?: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({ iconName, className }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const importSvg = async () => {
      try {
        // Adjusted path for Vite's dynamic import from the new location
        const module = await import(`../icons/${iconName}.svg?raw`);
        setSvgContent(module.default);
      } catch (error) {
        console.error(`Error loading SVG: ${iconName}`, error);
        setSvgContent(null);
      }
    };

    importSvg();
  }, [iconName]);

  if (!svgContent) {
    return null; // Or a fallback UI
  }

  return <span className={className} dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

export default SvgIcon;
