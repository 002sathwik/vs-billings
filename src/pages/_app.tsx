import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import {  Sora, Space_Grotesk } from 'next/font/google'

import { api } from "~/utils/api";
const grotesk =Space_Grotesk({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-grotesk',
})

const sora= Sora({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-sora',
})
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`${grotesk.variable} ${sora.variable}`}>
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
