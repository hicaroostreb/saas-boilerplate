// packages/ui/src/components/dashboard/sidebar-toggle.tsx - VERSÃO FINAL CORRETA

"use client";

import { useSidebar } from "./sidebar-provider";

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar();

  return (
    <button 
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-8 group/sidebar-trigger sm:-ml-2 px-1.5"
      type="button"
      onClick={toggle}
      data-sidebar="trigger"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="cursor-pointer transition-transform duration-300 ease-in-out text-muted-foreground"
      >
        {/* ✅ Background rectangle - SEMPRE PRESENTE */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M5.57527 0.78924L10.4219 0.78924C11.1489 0.78924 11.7271 0.78923 12.1935 0.82734C12.6712 0.86637 13.0785 0.94801 13.4514 1.13802C14.0535 1.44481 14.5431 1.93435 14.8499 2.53646C15.0399 2.90935 15.1215 3.31669 15.1606 3.79435C15.1986 4.26079 15.1986 4.83895 15.1986 5.56591V10.4341C15.1986 11.1611 15.1986 11.7392 15.1606 12.2057C15.1215 12.6833 15.0399 13.0907 14.8499 13.4635C14.5431 14.0657 14.0535 14.5552 13.4514 14.862C13.0785 15.052 12.6712 15.1336 12.1935 15.1727C11.7271 15.2108 11.1489 15.2108 10.4219 15.2108H5.57529C4.84833 15.2108 4.27017 15.2108 3.80373 15.1727C3.32607 15.1336 2.91873 15.052 2.54584 14.862C1.94373 14.5552 1.45419 14.0657 1.1474 13.4635C0.957392 13.0907 0.875752 12.6833 0.836725 12.2057C0.798715 11.7392 0.798718 11.1611 0.798723 10.4341L0.798723 5.5659C0.798718 4.83894 0.798715 4.26079 0.836725 3.79435C0.875752 3.31669 0.957392 2.90935 1.1474 2.53646C1.45419 1.93435 1.94373 1.44481 2.54584 1.13802C2.91873 0.94801 3.32607 0.86637 3.80373 0.82734C4.27017 0.78923 4.84833 0.78924 5.57527 0.78924ZM3.89058 2.19046C3.47889 2.22409 3.22759 2.28778 3.03009 2.38842C2.62868 2.59295 2.30233 2.91931 2.0978 3.32072C1.99716 3.51822 1.93347 3.76951 1.89984 4.18121C1.86569 4.59912 1.86528 5.13369 1.86528 5.88924L1.86528 10.1104C1.86528 10.8659 1.86569 11.4005 1.89984 11.8184C1.93347 12.2301 1.99716 12.4814 2.0978 12.6789C2.30233 13.0803 2.62868 13.4067 3.03009 13.6112C3.22759 13.7118 3.47889 13.7755 3.89058 13.8092C4.3085 13.8433 4.84307 13.8437 5.59862 13.8437L10.3986 13.8437C11.1542 13.8437 11.6887 13.8433 12.1066 13.8092C12.5183 13.7755 12.7696 13.7118 12.9671 13.6112C13.3685 13.4067 13.6949 13.0803 13.8994 12.6789C14.0001 12.4814 14.0638 12.2301 14.0974 11.8184C14.1316 11.4005 14.132 10.8659 14.132 10.1104L14.132 5.88924C14.132 5.13369 14.1316 4.59912 14.0974 4.18121C14.0638 3.76951 14.0001 3.51822 13.8994 3.32072C13.6949 2.91931 13.3685 2.59295 12.9671 2.38842C12.7696 2.28778 12.5183 2.22409 12.1066 2.19046C11.6887 2.15632 11.1542 2.15591 10.3986 2.15591L5.59862 2.15591C4.84307 2.15591 4.3085 2.15632 3.89058 2.19046Z" 
          fill="currentColor"
        />
        
        {/* ✅ Linha divisória - Diferentes posições para cada estado */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M6.29583 14.7329L6.29583 1.21743H7.56139L7.56139 14.7329H6.29583Z" 
          fill="currentColor" 
          className={`transition-opacity duration-200 ease-in-out opacity-100 group-hover/sidebar-trigger:opacity-0 ${
            collapsed ? 'translate-x-[20%]' : 'translate-x-[-5%]'
          }`}
        />
        
        {/* ✅ Seta - Com transform condicional */}
        <g style={collapsed ? { transform: 'scaleX(-1)' } : {}}>
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M5.47991 10.27751C4.97163 10.4858 4.33394 10.4858 4.12566 10.27751L2.52566 8.67751C2.31738 8.46923 2.31738 8.13154 2.52566 7.92326L4.12566 6.32326C4.33394 6.11498 4.97163 6.11498 5.47991 6.32326C5.68819 6.53154 5.68819 6.86923 5.47991 7.07751L4.79036 7.76706H7.50277C7.79413 7.76706 8.02944 8.00237 8.02944 8.29373C8.02944 8.58509 7.79413 8.82039 7.50277 8.82039H4.79036L5.47991 9.50994C5.68819 9.71822 5.68819 10.0559 5.47991 10.27751Z" 
            fill="currentColor" 
            className={`duration-200 ease-in-out origin-center group-hover/sidebar-trigger:opacity-100 opacity-0 transition-all ${
              collapsed 
                ? '-translate-x-2 group-hover/sidebar-trigger:-translate-x-4' 
                : 'translate-x-2 group-hover/sidebar-trigger:translate-x-0'
            }`}
          />
        </g>
      </svg>
    </button>
  );
}
