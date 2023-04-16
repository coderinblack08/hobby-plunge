import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import { supabaseClient } from "../lib/supabase";

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(() => supabaseClient);

  return (
    <ChakraProvider>
      <SessionContextProvider
        supabaseClient={client}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </ChakraProvider>
  );
}
