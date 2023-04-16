//Auth token we will use to generate a meeting and connect to it
export const authToken = process.env.NEXT_PUBLIC_VIDEOSDK_AUTH_TOKEN;
// API call to create meeting
export const createMeeting = async ({ token }: { token: string }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  //Destructuring the roomId from the response
  const { roomId } = await res.json();
  return roomId;
};

export const getMeetingAndToken = async () => {
  return createMeeting({ token: authToken! });
};
