import { useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import SignInPage from "./pages/SignIn";
import HomePage from "./pages/Home/Home";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice from "./store/userState";
import appSlice from "./store/appState";
import { MessageType, PubliPaths } from "./types";
import ControllerPage from "./pages/Controller";
import LogoLoader from "./components/shared/Loader/LogoLoader/LogoLoader";
import ProfilePage from "./pages/Profile";
import Page404 from "./components/shared/Page404/Page404";
import { IUserInitailState, Roles } from "./types/user";
import userReq from "./requests/user";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ControllerHeader from "./components/shared/Headers/ControllerHeader/ControllerHeader";

function UserRoute() {
  const { pathname } = useLocation();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`/signin?redirect=${pathname.slice(1)}`} replace />
  );
}

function AdminRoute() {
  const { pathname } = useLocation();
  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated)
    return <Navigate to={`/signin?redirect=${pathname.slice(1)}`} replace />;
  // check authorization
  return !roles.includes(Roles.User) ? <Outlet /> : <Page404 />;
}

function GetUser() {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isLoading = useAppSelector((state) => state.app.isLoading);

  const { resetUserState, setUserState } = userSlice.actions;
  const { setAppLoading, setNetworkError } = appSlice.actions;

  const publicPaths = Object.values(PubliPaths) as string[];
  useEffect(() => {
    (async () => {
      const user = await userReq.getUser();
      if (user) {
        dispatch(
          setUserState({
            ...(user as IUserInitailState),
            isAuthenticated: true,
          })
        );
        dispatch(setNetworkError(false));
      } else {
        dispatch(resetUserState());
      }
      dispatch(setAppLoading(false));
    })();

    return () => {
      dispatch(setAppLoading(true));
    };
  }, []);

  return !publicPaths.includes(pathname) && isLoading ? (
    <LogoLoader />
  ) : (
    <Outlet />
  );
}

function ErrorElement() {
  return <div>Error</div>;
}

function Routes() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<GetUser />} errorElement={<ErrorElement />}>
          <Route path={PubliPaths.Home} element={<HomePage />} />
          <Route path={PubliPaths.SignIn} element={<SignInPage />} />
          <Route element={<UserRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/controller/:pg?/:sec?" element={<ControllerPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
