import * as jwt_decode from 'jwt-decode'; // Use named import

function isTokenExpired(token) {
  if (!token) {
    return true;
  }

  try {
    const decodedToken = jwt_decode.default(token); // Use jwt_decode.default
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}

export default isTokenExpired;

