import { useContext, useCallback, useState, useEffect } from "react";
import md5 from "md5";
import { __RouterContext as RouterContext } from "react-router";
import queryString from "query-string";
import pathToRegexp from "path-to-regexp";
export function compose(...fns) {
  return fns.reduceRight((a, b) => arg => b(a(arg)), value => value);
}
export function getGravatarImage(email) {
  return "https://www.gravatar.com/avatar/" + md5(email);
}
export function getUserPhotoOrGravatar(firebaseUser, size = 100, generator = "monsterid") {
  const {
    photoURL,
    email,
    emailVerified
  } = firebaseUser;
  if (photoURL) return photoURL;
  return getGravatarImage(emailVerified ? email : "") + "?d=" + generator + "&s=" + size;
}
export function indexToColor(i) {
  return "hsl(" + i * 50 + ", 100%, 50%)";
}
export function useRouter() {
  return useContext(RouterContext);
}
export function useParams() {
  const {
    match
  } = useRouter();
  return match.params;
}
export function useLocation() {
  const {
    location
  } = useRouter();
  return location;
}
export function useQueryString() {
  const {
    search
  } = useLocation();
  return queryString.parse(search);
}
export function useReplacePath() {
  const {
    match: {
      path,
      params
    }
  } = useRouter();
  const toPath = useCallback(pathToRegexp.compile(path), [path]);
  const modified = useCallback(paramsOverride => toPath({ ...params,
    ...paramsOverride
  }), [toPath, params]);
  return modified;
}
export function useConnectionStatus() {
  const [connection, setConnection] = useState(true);

  const setOnline = () => setConnection(true);

  const setOffline = () => setConnection(false);

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);
  return connection;
}
export function useWindowDimensions() {
  const [state, setState] = useState({});
  useEffect(() => {
    const refresh = () => setState({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    });

    refresh();
    window.addEventListener("resize", refresh);
    return () => window.removeEventListener("resize", refresh);
  }, [setState]);
  return state;
}
export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
export function explainFirebaseError(error) {
  var message = {
    "auth/user-not-found": "We could not find any user with that email address",
    "auth/wrong-password": "Wrong password. Try again.",
    "auth/too-many-requests": "Too many failed attempts. Please wait a short while and try again."
  }[error.code];
  if (!message) console.warn("Unmapped firebase error: ", error.code);
  return message || error.message;
}