import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useUser } from "@supabase/auth-helpers-react";
import {
  IconCamera,
  IconCameraOff,
  IconLogout,
  IconMicrophone,
  IconMicrophoneOff,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { authToken } from "../lib/videosdk";

function ParticipantView({ participantId }: { participantId: string }) {
  const micRef = useRef<HTMLMediaElement | null>(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div>
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn && (
        <Box rounded="xl" overflow="hidden" pos="relative">
          <Text
            pos="absolute"
            bottom={4}
            left={4}
            fontWeight="bold"
            color="white"
            zIndex={10}
          >
            {displayName}
          </Text>
          <Box
            pos="absolute"
            bottom={0}
            left={0}
            right={0}
            height="20%"
            bgGradient="linear(to-t, black, transparent)"
          />
          <ReactPlayer
            playsinline // very very imp prop
            pip={false}
            light={false}
            controls={false}
            muted={true}
            playing={true}
            url={videoStream}
            width="100%"
            onError={(err) => {
              console.log(err, "participant video error");
            }}
          />
        </Box>
      )}
    </div>
  );
}
function Controls({ participantId }: { participantId: string }) {
  const [friends, setFriends] = useState(false);
  const { width, height } = useWindowSize();
  const { webcamOn, micOn } = useParticipant(participantId);
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  return (
    <HStack spacing={2}>
      <IconButton
        icon={<Icon as={IconLogout} boxSize={6} />}
        onClick={() => leave()}
        aria-label="leave"
        colorScheme="red"
        rounded="full"
      />
      <IconButton
        icon={
          micOn ? (
            <Icon as={IconMicrophone} boxSize={6} />
          ) : (
            <Icon as={IconMicrophoneOff} boxSize={6} />
          )
        }
        onClick={() => toggleMic()}
        aria-label="toggle mic"
        rounded="full"
      />
      <IconButton
        icon={
          webcamOn ? (
            <Icon as={IconCamera} boxSize={6} />
          ) : (
            <Icon as={IconCameraOff} boxSize={6} />
          )
        }
        onClick={() => toggleWebcam()}
        aria-label="toggle webcam"
        rounded="full"
      />
      {friends ? <Confetti width={width} height={height} /> : null}
      <Button
        onClick={() => setFriends(!friends)}
        leftIcon={
          <Icon as={friends ? IconUserMinus : IconUserPlus} boxSize={6} />
        }
        rounded="full"
        colorScheme={friends ? "green" : "gray"}
      >
        {friends ? "Remove" : "Add"} Friend
      </Button>
    </HStack>
  );
}

function MeetingView({ userId, meetingId, onMeetingLeave }: any) {
  const [joined, setJoined] = useState<string | null>(null);
  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants } = useMeeting({
    //callback for when meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when meeting is left
    onMeetingLeft: () => {
      onMeetingLeave();
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <Box>
      {joined && joined == "JOINED" ? (
        <VStack spacing={4}>
          <HStack spacing={4} align="start">
            {[...participants.keys()].map((participantId) => (
              <ParticipantView
                participantId={participantId}
                key={participantId}
              />
            ))}
          </HStack>
          <Controls participantId={userId} />
        </VStack>
      ) : joined && joined == "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <button onClick={joinMeeting}>Join</button>
      )}
    </Box>
  );
}

export function Meeting({
  receivedMeetingId,
  userId,
}: {
  receivedMeetingId: string | null;
  userId: string;
}) {
  const user = useUser();
  const [meetingId, setMeetingId] = useState(receivedMeetingId);

  // This will set Meeting Id to null when meeting is left or ended
  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId && user ? (
    <div>
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,

          name: user.user_metadata.full_name,
          participantId: user.id,
        }}
        token={authToken}
      >
        <MeetingView
          userId={userId}
          meetingId={meetingId}
          onMeetingLeave={onMeetingLeave}
        />
      </MeetingProvider>
    </div>
  ) : (
    <Center h="100vh">
      <Box textAlign="center">
        <Text>Meeting Over</Text>
        <Link href="/">
          <ChakraLink color="blue.500">Wanna find a new person?</ChakraLink>
        </Link>
      </Box>
    </Center>
  );
}
