// SVG Material Icon Components to replace font-based icons
// This prevents flash of unstyled content while maintaining the same visual appearance

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

const defaultIconProps = {
  width: 24,
  height: 24,
  className: 'material-icons-svg notranslate'
};

export function UpdateIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.64,5.81C9.17,2.34 14.85,2.34 18.36,5.81L21,3V10.12M6.76,10.39L10.59,14.22L17.64,7.16L19.04,8.57L10.59,17L5.34,11.8L6.76,10.39Z"/>
    </svg>
  );
}

export function FullscreenIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"/>
    </svg>
  );
}

export function FullscreenExitIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z"/>
    </svg>
  );
}

export function AccountCircleIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"/>
    </svg>
  );
}

export function SettingsIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
    </svg>
  );
}

export function PersonAddIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
    </svg>
  );
}

export function ManageAccountsIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10,4A4,4 0 0,0 6,8A4,4 0 0,0 10,12A4,4 0 0,0 14,8A4,4 0 0,0 10,4M10,6A2,2 0 0,1 12,8A2,2 0 0,1 10,10A2,2 0 0,1 8,8A2,2 0 0,1 10,6M17,12C16.84,12 16.7,12.02 16.55,12.05L19.17,14.67C19.2,14.82 19.22,14.96 19.22,15.11C19.22,15.3 19.16,15.5 19.06,15.64L18.23,16.97C18.13,17.11 17.95,17.25 17.77,17.25C17.65,17.25 17.54,17.22 17.43,17.15L16.64,16.68C16.36,16.82 16.07,16.93 15.76,17L15.67,17.95C15.65,18.13 15.5,18.26 15.32,18.26H13.67C13.5,18.26 13.35,18.13 13.32,17.95L13.24,17C12.92,16.93 12.63,16.82 12.35,16.68L11.56,17.15C11.45,17.22 11.34,17.25 11.22,17.25C11.04,17.25 10.86,17.11 10.76,16.97L9.93,15.64C9.83,15.5 9.77,15.3 9.77,15.11C9.77,14.96 9.79,14.82 9.82,14.67L12.44,12.05C12.29,12.02 12.15,12 12,12C8.13,12 1,14.17 1,18V20H23V18C23,14.17 15.87,12 12,12H17M14.5,13.5A2.5,2.5 0 0,1 17,16A2.5,2.5 0 0,1 14.5,18.5A2.5,2.5 0 0,1 12,16A2.5,2.5 0 0,1 14.5,13.5Z"/>
    </svg>
  );
}

export function NotificationsIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
    </svg>
  );
}

export function RestartAltIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6.1 12,6.1V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
    </svg>
  );
}

export function BugReportIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z"/>
    </svg>
  );
}

export function InfoIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>
  );
}

export function LogoutIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.49,7L20.49,12L15.49,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z"/>
    </svg>
  );
}

export function LocalIcon({ className = defaultIconProps.className, width = defaultIconProps.width, height = defaultIconProps.height }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
    </svg>
  );
}