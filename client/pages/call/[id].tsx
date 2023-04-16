import { Box, Center } from "@chakra-ui/react";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
// import this dynamically nextjs { Meeting } from "../../components/Meeting";
const Meeting = dynamic(
  async () =>
    await import("../../components/Meeting").then((mod) => mod.Meeting),
  {
    ssr: false,
  }
);

export default function PrivateCall({
  meetingId,
  user,
}: {
  meetingId: string;
  user: User;
}) {
  return (
    <Center h="100vh">
      <Box p={5}>
        <Meeting userId={user.id} receivedMeetingId={meetingId} />
      </Box>
    </Center>
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
      meetingId: ctx.params!.id,
      user: session.user,
    },
  };
};
