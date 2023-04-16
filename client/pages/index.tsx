import { Button, Center, Checkbox, Input, VStack } from "@chakra-ui/react";
import {
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { isLoading, session } = useSessionContext();

  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [isLoading, session]);

  return (
    <Center py={8} px={5}>
      <VStack w="lg" align="start">
        <Checkbox>Search people with common interests</Checkbox>
        <Input placeholder="List your interests (comma separated)" />
        <Button w="full" as={Link} href="/call">
          Match
        </Button>
        <Button
          variant="outline"
          w="full"
          onClick={() => supabaseClient.auth.signOut()}
        >
          Logout
        </Button>
      </VStack>
    </Center>
  );
}
