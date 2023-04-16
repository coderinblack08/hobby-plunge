export const getPostGISLocation = () => {
  if (typeof window !== "undefined") {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            `POINT(${position.coords.longitude}, ${position.coords.latitude})`
          );
        },
        (error) => reject(error)
      );
    });
  }
};
