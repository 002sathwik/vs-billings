import { type AppType } from "next/app";
import { Sora, Space_Grotesk } from 'next/font/google'
import toast, { Toaster } from 'react-hot-toast';
import { api } from "~/utils/api";
const grotesk = Space_Grotesk({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-grotesk',
})

const sora = Sora({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-sora',
})
import "~/styles/globals.css";
import { SidebarDemo } from "~/components/applayout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`${grotesk.variable} ${sora.variable}`}>

      <main>
        <SidebarDemo>
 <Toaster />
          <Component  {...pageProps} />
        </SidebarDemo>
      </main>


    </div>
  );
};

export default api.withTRPC(MyApp);
