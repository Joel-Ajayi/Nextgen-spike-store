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
import sellerSlice from "./store/sellerState";
import appSlice from "./store/appState";
import {
  IError,
  ISellerInitailState,
  IUserInitailState,
  SellerRoles,
} from "./types";
import SellerSignInPage from "./pages/Seller/SellerSignIn";
import SellerDashboardPage from "./pages/Seller/SellerDashboard";
import DashboardPage from "./pages/Dashboard";
import { getSeller } from "./requests/seller";
import LogoLoader from "./components/shared/Loader/LogoLoader";

function UserRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

function SellerRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.seller);
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/seller/signin" replace />
  );
}

function AdminSellerRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.seller);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/seller/signin" replace />;
  // check authorization
  return role >= SellerRoles.Admin ? (
    <Outlet />
  ) : (
    <Navigate to="/404" replace />
  );
}

function SuperAdminSellerRoute() {
  const { isAuthenticated, role } = useAppSelector((state) => state.seller);
  // check authentication
  if (!isAuthenticated) return <Navigate to="/seller/signin" replace />;
  // check authorization
  return role === SellerRoles.SuperAdmin ? (
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

function GetSeller() {
  const dispatch = useAppDispatch();
  const { resetSellerState, setSellerState } = sellerSlice.actions;
  const { setAppLoading, setNetworkError } = appSlice.actions;
  const isLoading = useAppSelector((state) => state.app.isLoading);

  useEffect(() => {
    (async () => {
      const seller = await getSeller();
      if (!seller || (seller as IError).message || (seller as IError).code) {
        dispatch(resetSellerState());
        dispatch(setNetworkError(true));
      } else {
        dispatch(
          setSellerState({
            ...(seller as ISellerInitailState),
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
        <Route element={<GetSeller />}>
          <Route element={<SellerRoute />}>
            <Route path="/seller" element={<SellerDashboardPage />} />
          </Route>
          <Route path="/seller/signin" element={<SellerSignInPage />} />
        </Route>
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
