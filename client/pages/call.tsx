import { Box, Center, Spinner } from "@chakra-ui/react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Peer from "peerjs";
import React from "react";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { shallow } from "zustand/shallow";
import { findMatch, listenOnDevices, useStore } from "../lib/mediastream";
import { socket } from "../lib/socket";

export default function Call({ user }) {
  const { isLoading, session } = useSessionContext();
  const [calling, pending] = useStore(
    (state) => [state.calling, state.pending],
    shallow
  );

  const peer = useRef<Peer | null>(null);
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    function onConnect() {
      console.log("connected");
      // await findMatch(peer.current!, user.id, socket);
    }
    socket.on("connect", onConnect);
    // if (typeof window !== "undefined") {
    //   import("peerjs").then(({ default: Peer }) => {
    //     peer.current = new Peer(undefined as any, {
    //       path: "/peerjs",
    //       host: "localhost",
    //       port: 9000,
    //     });
    //     peer.current.on("open", () => {
    //       listenOnDevices(peer.current!, socket);
    //     });
    //   });
    // }
    return () => {
      socket.off("connect", onConnect);
      socket.emit("leave");
    };
  }, []);

  return (
    <Box>
      {pending ? (
        <Center h="100vh">
          <Spinner mr={4} />
          Waiting for a match...
        </Center>
      ) : (
        <Center>Calling with {JSON.stringify(calling, null, 2)}</Center>
      )}
    </Box>
  );
}

export const getServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  };
};
