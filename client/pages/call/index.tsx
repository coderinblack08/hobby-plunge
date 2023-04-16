import { Box, Center, Spinner } from "@chakra-ui/react";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Pusher, { Members, PresenceChannel, Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { getMeetingAndToken } from "../../lib/videosdk";

export default function Call({ user }: { user: User }) {
  // const supabase = useSupabaseClient();
  const router = useRouter();
  const pusherRef = useRef<Pusher>();
  const channel = useRef<PresenceChannel>();
  const myChannel = useRef<Channel>();

  useEffect(() => {
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: {
          userId: user.id,
          photo: user.user_metadata.avatar_url,
          name: user.user_metadata.user_name,
        },
      },
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    channel.current = pusherRef.current!.subscribe("presence-channel") as any;
    myChannel.current = pusherRef.current!.subscribe(`private-${user.id}`);

    queue();
  }, [user]);

  function queue() {
    myChannel.current!.bind("client-matched", async (other: any) => {
      // this is the host channel now
      console.log("matched with", other);
      const meetingId = await getMeetingAndToken();
      const otherChannel = pusherRef.current!.subscribe("private-" + other);
      otherChannel.bind("pusher:subscription_succeeded", () => {
        otherChannel.trigger("client-call-started", meetingId);
      });
      router.push(`/call/${meetingId}`);
    });

    myChannel.current!.bind("client-call-started", (meetingId: string) => {
      console.log("call has started now");
      router.push(`/call/${meetingId}`);
    });

    channel.current!.bind(
      "pusher:subscription_succeeded",
      (members: Members) => {
        let acc: any[] = [];
        members.each((member: any) => {
          if (member.id !== user.id) acc.push(member.id);
        });

        if (acc.length > 0) {
          const match = acc.pop();
          const otherChannel = pusherRef.current!.subscribe("private-" + match);
          otherChannel.bind("pusher:subscription_succeeded", () => {
            otherChannel.trigger("client-matched", user.id);
          });
        }
      }
    );
  }

  return (
    <Box>
      <Center h="100vh">
        <Spinner mr={4} />
        Waiting for a match...
      </Center>
    </Box>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
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
