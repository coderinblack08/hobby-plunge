import { Box, Center, Spinner } from "@chakra-ui/react";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

export default function Call({ user }: { user: User }) {
  const supabase = useSupabaseClient();
  const [users, setUsers] = useState<{
    [key: string]: {
      id: string;
      name: string;
      photo: string;
    };
  }>({});

  const channel = supabase.channel("ledger", {
    config: { presence: { key: "global" } },
  });

  useEffect(() => {
    channel.subscribe(async (status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        await channel.track({
          id: user.id,
          photo: user.user_metadata.avatar_url,
          name: user.user_metadata.user_name,
        });
      }
    });
    channel.on("presence", { event: "sync" }, () => {
      setUsers(channel.presenceState().global);
    });
  }, []);

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
