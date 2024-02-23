import { useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import SignInPage from "./pages/SignIn";
import HomePage from "./pages/Home/Home";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice from "./store/userState";
import appSlice from "./store/appState";
import { IError, IMessage, MessageType, Roles } from "./types";
import ControllerPage from "./pages/Controller";
import LogoLoader from "./components/shared/Loader/LogoLoader/LogoLoader";
import ProfilePage from "./pages/Profile";
import Page404 from "./components/shared/Page404/Page404";
import { IUserInitailState } from "./types/user";
import userReq from "./requests/user";

function UserRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

function AdminRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  // check authorization
  return role >= Roles.Admin ? <Outlet /> : <Page404 />;
}

function SuperAdminRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  // check authorization
  return role === Roles.SuperAdmin ? <Outlet /> : <Page404 />;
}

function GetUser() {
  const dispatch = useAppDispatch();

  const { resetUserState, setUserState } = userSlice.actions;
  const { setAppLoading, setNetworkError } = appSlice.actions;

  const isLoading = useAppSelector((state) => state.app.isLoading);

  useEffect(() => {
    (async () => {
      const { user, msg } = await userReq.getUser();
      if (msg?.type === MessageType.Error) {
        dispatch(resetUserState());
        dispatch(setNetworkError(true));
      } else {
        dispatch(
          setUserState({
            ...(user as IUserInitailState),
            isAuthenticated: true,
          })
        );
        dispatch(setNetworkError(false));
      }
      dispatch(setAppLoading(false));
    })();

    return () => {
      dispatch(setAppLoading(true));
    };
  }, []);

  return isLoading ? <LogoLoader /> : <Outlet />;
}

function ErrorElement() {
  return <div>Error</div>;
}

function Routes() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<GetUser />} errorElement={<ErrorElement />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route element={<UserRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/controller" element={<ControllerPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
