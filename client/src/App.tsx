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
import HomePage from "./pages/Home";
import { getUser } from "./requests/user";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice from "./store/userState";
import appSlice from "./store/appState";
import { IError, IUserInitailState, Roles } from "./types";
import DashboardPage from "./pages/Dashboard";
import LogoLoader from "./components/shared/Loader/LogoLoader";

function UserRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

function AdminRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/seller/signin" replace />;
  // check authorization
  return role >= Roles.Admin ? <Outlet /> : <Navigate to="/404" replace />;
}

function SuperAdminRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/seller/signin" replace />;
  // check authorization
  return role === Roles.SuperAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/404" replace />
  );
}

function GetUser() {
  const dispatch = useAppDispatch();

  const { resetUserState, setUserState } = userSlice.actions;
  const { setAppLoading, setNetworkError } = appSlice.actions;

  const isLoading = useAppSelector((state) => state.app.isLoading);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user || (user as IError).message || (user as IError).code) {
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

function Routes() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<GetUser />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route element={<UserRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
