import { Center, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React from "react";

export default function Login() {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  async function signInWithGitHub() {
    await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: "http://localhost:3000" },
    });
  }

  return (
    <Center h="100vh">
      <Button onClick={signInWithGitHub}>Login With GitHub</Button>
    </Center>
  );
}
