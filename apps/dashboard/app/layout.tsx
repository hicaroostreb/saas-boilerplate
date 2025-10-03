import { Toaster } from '@workspace/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="size-full min-h-screen" suppressHydrationWarning>
      <body className={`${inter.className} size-full`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              ((e,t,r,n,a,o,i,s)=>{
                let l=document.documentElement,u=["light","dark"];
                function c(t){
                  var r;
                  (Array.isArray(e)?e:[e]).forEach(e=>{
                    let r="class"===e,n=r&&o?a.map(e=>o[e]||e):a;
                    r?(l.classList.remove(...n),l.classList.add(t)):l.setAttribute(e,t)
                  }),r=t,s&&u.includes(r)&&(l.style.colorScheme=r,l.style.backgroundColor=t==="dark"?"#000000":"#ffffff")
                }
                if(n)c(n);else try{
                  let e=localStorage.getItem(t)||r,n=i&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;
                  c(n)
                }catch(e){}
              })("class","theme","system",null,["light","dark"],null,true,true)
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
