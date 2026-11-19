import type { SVGProps } from 'react';

export type TechIconKey =
  | 'React'
  | 'TypeScript'
  | 'Tailwind CSS'
  | 'HeroUI (formerly NextUI)'
  | 'Bootstrap'
  | 'Firebase'
  | 'discord.js'
  | 'OmniRoute'
  | 'Claude Code CLI'
  | 'Google Colab'
  | 'Laravel'
  | 'Express.js'
  | 'MySQL'
  | 'PostgreSQL'
  | 'Supabase'
  | 'DynamoDB'
  | 'Amazon RDS'
  | 'Amazon S3'
  | 'AWS'
  | 'EC2'
  | 'VPC'
  | 'Lambda'
  | 'CloudWatch'
  | 'GCP'
  | 'GitHub'
  | 'Figma'
  | 'Google Stitch'
  | 'VS Code'
  | 'Vercel'
  | 'Motion';

interface TechLogoProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export function TechLogo({
  name,
  size = 16,
  className = '',
  ...props
}: TechLogoProps) {
  const normalized = name.trim().toLowerCase();
  const baseProps: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true,
    className: `shrink-0 ${className}`,
    ...props
  };

  if (normalized === 'react') {
    return (
      <svg {...baseProps}>
        <circle cx="12" cy="12" r="2.1" fill="#087EA4" className="dark:fill-[#61DAFB]" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.2"
          stroke="#087EA4"
          className="dark:stroke-[#61DAFB]"
          strokeWidth="1.5"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.2"
          transform="rotate(60 12 12)"
          stroke="#087EA4"
          className="dark:stroke-[#61DAFB]"
          strokeWidth="1.5"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.2"
          transform="rotate(120 12 12)"
          stroke="#087EA4"
          className="dark:stroke-[#61DAFB]"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (normalized === 'typescript') {
    return (
      <svg {...baseProps}>
        <rect x="2" y="2" width="20" height="20" rx="3.5" fill="#3178C6" />
        <path
          d="M7.2 11.4H13.4V13H11.15V19H9.45V13H7.2V11.4ZM14.2 17.35C14.65 17.68 15.35 17.9 16.05 17.9C16.85 17.9 17.28 17.57 17.28 17.07C17.28 16.59 16.92 16.34 15.93 15.98C14.62 15.5 13.85 14.84 13.85 13.68C13.85 12.36 14.92 11.4 16.58 11.4C17.42 11.4 18.08 11.59 18.52 11.83L18.08 13.23C17.72 13.04 17.16 12.86 16.54 12.86C15.81 12.86 15.46 13.18 15.46 13.57C15.46 14.07 15.89 14.3 16.94 14.69C18.31 15.2 18.93 15.88 18.93 17C18.93 18.31 17.91 19.35 15.98 19.35C15.08 19.35 14.25 19.12 13.75 18.78L14.2 17.35Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (normalized === 'tailwind css' || normalized === 'tailwind') {
    return (
      <svg {...baseProps}>
        <path
          d="M12 6C8.8 6 6.8 7.6 6 10.8C7.2 9.2 8.6 8.6 10.2 9C11.113 9.228 11.765 9.89 12.487 10.623C13.663 11.817 15.025 13.2 18 13.2C21.2 13.2 23.2 11.6 24 8.4C22.8 10 21.4 10.6 19.8 10.2C18.887 9.972 18.235 9.31 17.513 8.577C16.337 7.383 14.975 6 12 6ZM6 13.2C2.8 13.2 0.8 14.8 0 18C1.2 16.4 2.6 15.8 4.2 16.2C5.113 16.428 5.765 17.09 6.487 17.823C7.663 19.017 9.025 20.4 12 20.4C15.2 20.4 17.2 18.8 18 15.6C16.8 17.2 15.4 17.8 13.8 17.4C12.887 17.172 12.235 16.51 11.513 15.777C10.337 14.583 8.975 13.2 6 13.2Z"
          fill="#06B6D4"
        />
      </svg>
    );
  }

  if (normalized === 'vercel') {
    return (
      <svg {...baseProps}>
        <path
          d="M12 3.5L22 20.5H2L12 3.5Z"
          fill="#1D1D1F"
          className="dark:fill-[#F5F5F7]"
        />
      </svg>
    );
  }

  if (normalized === 'laravel') {
    return (
      <svg {...baseProps}>
        <path
          d="M21.2 8.2L17.4 6L13.6 8.2V12.6L9.8 14.8V6L6 3.8L2.2 6V15.6L9.8 20L17.4 15.6V11.2L21.2 13.4V8.2Z"
          stroke="#FF2D20"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M2.2 6L6 8.2L9.8 6M6 8.2V17.8M9.8 14.8L13.6 17M13.6 8.2L17.4 10.4L21.2 8.2M17.4 10.4V15.6"
          stroke="#FF2D20"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized === 'mysql') {
    return (
      <svg {...baseProps}>
        <path
          d="M4.5 16.5C5.2 10.8 9.2 6.2 14.8 5.5C17.2 5.2 19.2 6.1 20.2 7.5C18.5 7.4 16.7 8.1 15.4 9.5C17.2 9.5 18.8 10.3 19.8 11.7C17.4 11.3 15 12.2 13.4 14C11.9 15.7 11.6 17.5 12 19C9.4 18.8 6.8 17.9 4.5 16.5Z"
          stroke="#00758F"
          className="dark:stroke-[#38BDF8]"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15.2" cy="8.2" r="0.9" fill="#F29111" />
        <path
          d="M3.5 19H20.5"
          stroke="#F29111"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalized === 'postgresql') {
    return (
      <svg {...baseProps}>
        <ellipse
          cx="12"
          cy="6.5"
          rx="7"
          ry="3"
          stroke="#336791"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.7"
        />
        <path
          d="M5 6.5V16.5C5 18.16 8.13 19.5 12 19.5C15.87 19.5 19 18.16 19 16.5V6.5"
          stroke="#336791"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.7"
        />
        <path
          d="M5 11.5C5 13.16 8.13 14.5 12 14.5C15.87 14.5 19 13.16 19 11.5"
          stroke="#336791"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  if (normalized === 'supabase') {
    return (
      <svg {...baseProps}>
        <path
          d="M13.5 21C12.95 21.69 11.84 21.31 11.82 20.43L11.56 12.6H4.78C3.57 12.6 2.9 11.2 3.66 10.26L11.2 2.8C11.75 2.11 12.86 2.49 12.88 3.37L13.14 11.2H19.92C21.13 11.2 21.8 12.6 21.04 13.54L13.5 21Z"
          fill="#3ECF8E"
        />
      </svg>
    );
  }

  if (normalized === 'heroui (formerly nextui)' || normalized === 'heroui' || normalized === 'nextui') {
    return (
      <svg {...baseProps}>
        <path d="M5 18L12 5L19 18H15.8L12 10.5L8.2 18H5Z" fill="#7828C8" />
        <circle cx="18.5" cy="6" r="2.5" fill="#F31260" />
      </svg>
    );
  }

  if (normalized === 'bootstrap') {
    return (
      <svg {...baseProps}>
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#7952B3" />
        <path d="M8 6.5H12.8C15 6.5 16.2 7.6 16.2 9.3C16.2 10.5 15.5 11.3 14.5 11.7C15.9 12 16.7 12.9 16.7 14.3C16.7 16.3 15.2 17.5 12.8 17.5H8V6.5ZM10.4 8.5V10.8H12.5C13.4 10.8 13.9 10.4 13.9 9.6C13.9 8.9 13.4 8.5 12.5 8.5H10.4ZM10.4 12.7V15.5H12.7C13.7 15.5 14.3 15 14.3 14.1C14.3 13.2 13.7 12.7 12.7 12.7H10.4Z" fill="white" />
      </svg>
    );
  }

  if (normalized === 'firebase') {
    return (
      <svg {...baseProps}>
        <path d="M5 17.8L8.2 4.2C8.4 3.4 9.4 3.2 9.8 3.9L11.6 7.1L13.8 3.4C14.3 2.6 15.5 2.9 15.6 3.8L18.5 17.8L12 21L5 17.8Z" fill="#FFCA28" />
        <path d="M12 21L18.5 17.8L15.6 3.8C15.5 2.9 14.3 2.6 13.8 3.4L11.6 7.1L12 21Z" fill="#FFA000" />
        <path d="M8.2 4.2L5 17.8L12 21L11.6 7.1L9.8 3.9C9.4 3.2 8.4 3.4 8.2 4.2Z" fill="#F57C00" />
      </svg>
    );
  }

  if (normalized === 'firebase') {
    return (
      <svg {...baseProps}>
        <path d="M5 18L8.2 4.2C8.4 3.4 9.4 3.2 9.8 3.9L11.6 7.1L13.8 3.4C14.3 2.6 15.5 2.9 15.6 3.8L18.5 17.8L12 21L5 18Z" fill="#FFCA28" />
        <path d="M12 21L18.5 17.8L15.6 3.8C15.5 2.9 14.3 2.6 13.8 3.4L11.6 7.1L12 21Z" fill="#FFA000" />
        <path d="M8.2 4.2L5 18L12 21L11.6 7.1L9.8 3.9C9.4 3.2 8.4 3.4 8.2 4.2Z" fill="#F57C00" />
      </svg>
    );
  }

  if (normalized === 'express.js' || normalized === 'express') {
    return (
      <svg {...baseProps}>
        <rect
          x="2"
          y="4"
          width="20"
          height="16"
          rx="4"
          stroke="#1D1D1F"
          className="dark:stroke-[#F5F5F7]"
          strokeWidth="1.6"
        />
        <path
          d="M6.8 12.2H11.2C11.2 10.6 10.3 9.7 9 9.7C7.6 9.7 6.8 10.7 6.8 12.2ZM6.8 12.2C6.8 13.8 7.7 14.7 9.2 14.7C10.1 14.7 10.7 14.4 11.1 14M13.2 9.8L17.2 14.6M17.2 9.8L13.2 14.6"
          stroke="#1D1D1F"
          className="dark:stroke-[#F5F5F7]"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized === 'motion') {
    return (
      <svg {...baseProps}>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#FFF312" />
        <path
          d="M5.5 16L9.5 8L12 13L14.5 8L18.5 16H15.8L14.3 12.8L12 16.5L9.7 12.8L8.2 16H5.5Z"
          fill="#111111"
        />
      </svg>
    );
  }

  if (normalized === 'dynamodb') {
    return (
      <svg {...baseProps}>
        <ellipse cx="12" cy="6" rx="6.5" ry="2.5" stroke="#4053D6" className="dark:stroke-[#7AA2FF]" strokeWidth="1.6" />
        <path d="M5.5 6V18C5.5 19.38 8.41 20.5 12 20.5C15.59 20.5 18.5 19.38 18.5 18V6" stroke="#4053D6" className="dark:stroke-[#7AA2FF]" strokeWidth="1.6" />
        <path d="M13 10L10.5 14H13L11.5 17.5" stroke="#FF9900" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized === 'amazon rds' || normalized === 'rds') {
    return (
      <svg {...baseProps}>
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="#3B48CC" className="dark:stroke-[#7AA2FF]" strokeWidth="1.6" />
        <ellipse cx="12" cy="9" rx="4.5" ry="1.8" stroke="#3B48CC" className="dark:stroke-[#7AA2FF]" strokeWidth="1.5" />
        <path d="M7.5 9V15C7.5 16 9.5 16.8 12 16.8C14.5 16.8 16.5 16 16.5 15V9" stroke="#3B48CC" className="dark:stroke-[#7AA2FF]" strokeWidth="1.5" />
      </svg>
    );
  }

  if (normalized === 'amazon s3' || normalized === 's3') {
    return (
      <svg {...baseProps}>
        <path
          d="M5.5 6.5L7.5 19.5C7.6 20.1 9.6 20.8 12 20.8C14.4 20.8 16.4 20.1 16.5 19.5L18.5 6.5"
          stroke="#E25D43"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <ellipse cx="12" cy="6.5" rx="6.5" ry="2.3" stroke="#E25D43" strokeWidth="1.7" />
        <path d="M8.5 12.5C10.5 13.3 13.5 13.3 15.5 12.5" stroke="#569A31" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (normalized === 'aws') {
    return (
      <svg {...baseProps}>
        <path
          d="M4.5 15.5C8.5 18.8 15.2 19 19.5 15.8"
          stroke="#FF9900"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 15.1L20.1 15.6L19.1 18.1"
          stroke="#FF9900"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 12L7.2 6.8L8.9 12M6 10.3H8.4M10.5 6.8L11.6 12L12.8 7.8L14 12L15.1 6.8M18.6 7.4C18.2 7 17.6 6.8 17.1 7C16.5 7.2 16.4 7.9 16.9 8.4C17.4 8.9 18.6 9.1 18.8 10.1C19 11 18.1 11.9 17.1 11.9C16.5 11.9 16 11.7 15.7 11.4"
          stroke="#1D1D1F"
          className="dark:stroke-[#F5F5F7]"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized === 'ec2') {
    return (
      <svg {...baseProps}>
        <rect x="6" y="6" width="12" height="12" rx="2" stroke="#ED7100" strokeWidth="1.7" />
        <path d="M9 3V6M15 3V6M9 18V21M15 18V21M3 9H6M3 15H6M18 9H21M18 15H21" stroke="#ED7100" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (normalized === 'vpc') {
    return (
      <svg {...baseProps}>
        <path
          d="M7.5 17.5H17C19.2 17.5 21 15.7 21 13.5C21 11.5 19.5 9.8 17.6 9.5C16.9 6.6 14.3 4.5 11.2 4.5C7.6 4.5 4.7 7.4 4.7 11C3.4 11.6 2.5 12.9 2.5 14.4C2.5 16.1 3.9 17.5 5.6 17.5H7.5Z"
          stroke="#8C4FFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="12" r="1.3" fill="#8C4FFF" />
        <circle cx="14.5" cy="12" r="1.3" fill="#8C4FFF" />
        <path d="M10.8 12H13.2" stroke="#8C4FFF" strokeWidth="1.5" />
      </svg>
    );
  }

  if (normalized === 'lambda') {
    return (
      <svg {...baseProps}>
        <rect x="3" y="3" width="18" height="18" rx="3.5" stroke="#ED7100" strokeWidth="1.6" />
        <path
          d="M8 17L11.5 10.5M9 7H11.2L15.8 17H13.6"
          stroke="#ED7100"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized === 'cloudwatch') {
    return (
      <svg {...baseProps}>
        <circle cx="11" cy="11" r="6.5" stroke="#E7157B" strokeWidth="1.7" />
        <path d="M16 16L20.5 20.5" stroke="#E7157B" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M7.5 12L9.6 9.5L11.4 12.5L14 8.8" stroke="#E7157B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized === 'gcp') {
    return (
      <svg {...baseProps}>
        <path d="M15.8 10.1A5.2 5.2 0 0 0 7.1 8.5" stroke="#EA4335" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M7.1 8.5A4.3 4.3 0 0 0 6.5 17H10.5" stroke="#FBBC05" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M10.5 17H16.8A3.7 3.7 0 0 0 17.5 9.7" stroke="#34A853" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M15.8 10.1C16.6 10.1 17.2 10.3 17.8 10.6" stroke="#4285F4" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    );
  }

  if (normalized === 'github' || normalized === 'git/github') {
    return (
      <svg {...baseProps}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 16.2 5.22 19.76 9 21.02C9.47 21.1 9.65 20.81 9.65 20.56C9.65 20.33 9.64 19.57 9.64 18.77C7 19.34 6.44 17.65 6.44 17.65C6.01 16.55 5.38 16.26 5.38 16.26C4.52 15.67 5.45 15.68 5.45 15.68C6.4 15.75 6.9 16.66 6.9 16.66C7.75 18.11 9.12 17.69 9.67 17.45C9.75 16.84 10 16.42 10.27 16.18C8.16 15.94 5.94 15.13 5.94 11.48C5.94 10.44 6.31 9.59 6.92 8.92C6.82 8.68 6.49 7.71 7.01 6.4C7.01 6.4 7.81 6.14 9.63 7.37C10.39 7.16 11.2 7.05 12 7.05C12.8 7.05 13.61 7.16 14.37 7.37C16.19 6.14 16.99 6.4 16.99 6.4C17.51 7.71 17.18 8.68 17.08 8.92C17.69 9.59 18.06 10.44 18.06 11.48C18.06 15.14 15.83 15.94 13.71 16.17C14.05 16.46 14.35 17.04 14.35 17.93C14.35 19.2 14.34 20.23 14.34 20.56C14.34 20.81 14.51 21.11 15 21.02C18.78 19.76 21.5 16.2 21.5 12C21.5 6.75 17.25 2.5 12 2.5Z"
          fill="#181717"
          className="dark:fill-[#F5F5F7]"
        />
      </svg>
    );
  }

  if (normalized === 'figma') {
    return (
      <svg {...baseProps}>
        <path d="M8.5 2.5H12V9.5H8.5A3.5 3.5 0 0 1 8.5 2.5Z" fill="#F24E1E" />
        <path d="M12 2.5H15.5A3.5 3.5 0 0 1 15.5 9.5H12V2.5Z" fill="#FF7262" />
        <path d="M8.5 9.5H12V16.5H8.5A3.5 3.5 0 0 1 8.5 9.5Z" fill="#A259FF" />
        <circle cx="15.5" cy="13" r="3.5" fill="#1ABCFE" />
        <path d="M8.5 16.5H12V20A3.5 3.5 0 1 1 8.5 16.5Z" fill="#0ACF83" />
      </svg>
    );
  }

  if (normalized === 'google colab' || normalized === 'colab') {
    return (
      <svg {...baseProps}>
        <path d="M7 6.2A6.5 6.5 0 0 0 7 17.8L10 14.8A2.3 2.3 0 0 1 10 9.2L7 6.2Z" fill="#F9AB00" />
        <path d="M17 6.2A6.5 6.5 0 0 1 17 17.8L14 14.8A2.3 2.3 0 0 0 14 9.2L17 6.2Z" fill="#E8710A" />
      </svg>
    );
  }

  if (normalized === 'google stitch') {
    return (
      <svg {...baseProps}>
        <path d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z" fill="#4285F4" />
        <circle cx="18.5" cy="5.5" r="2" fill="#34A853" />
        <circle cx="5.5" cy="18.5" r="2" fill="#FBBC05" />
      </svg>
    );
  }

  if (normalized === 'vs code') {
    return (
      <svg {...baseProps}>
        <path
          d="M17.2 2.8L21 4.6V19.4L17.2 21.2L8.4 13.6L4.6 16.5L3 15.4V8.6L4.6 7.5L8.4 10.4L17.2 2.8ZM17.2 7.2L11.4 12L17.2 16.8V7.2Z"
          fill="#007ACC"
        />
      </svg>
    );
  }

  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
