import { useEffect, useRef } from "react";
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
import HomePage from "./pages/Home";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice from "./store/userState";
import appSlice from "./store/appState";
import { Paths, PublicPaths } from "./types";
import ControllerPage from "./pages/Controller";
import LogoLoader from "./components/shared/Loader/LogoLoader/LogoLoader";
import ProfilePage from "./pages/Profile";
import Page404 from "./components/shared/Page404/Page404";
import { ControllerRoles, IUserInitailState } from "./types/user";
import userReq from "./requests/user";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import cartSlice from "./store/cart";

function ProtectedRoute() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`/signin?redirect=${pathname.slice(1)}`} replace />
  );
}

function AdminProtectedRoute() {
  const { pathname } = useLocation();
  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  // check authentication
  if (!isAuthenticated)
    return <Navigate to={`/signin?redirect=${pathname.slice(1)}`} replace />;
  // check authorization
  const hasControllerRole = !!roles.find((r) => ControllerRoles.includes(r));

  return hasControllerRole ? <Outlet /> : <Page404 />;
}

function GetUser() {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isLoading = useAppSelector((state) => state.app.isLoading);

  const { resetUserState, setUserState } = userSlice.actions;
  const { setAppLoading, setNetworkError } = appSlice.actions;
  const isRendered = useRef(false);

  useEffect(() => {
    if (!isRendered.current) {
      isRendered.current = true;
      (async () => {
        dispatch(cartSlice.actions.setIsLoadingCart());

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
    }

    return () => {
      dispatch(setAppLoading(true));
    };
  }, []);

  return !(PublicPaths as string[]).includes(pathname) && isLoading ? (
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
          <Route path={Paths.Home} element={<HomePage />} />
          <Route path={Paths.SignIn} element={<SignInPage />} />
          <Route path={`${Paths.Catalog}/`} element={<Catalog />} />
          <Route path={`${Paths.Product}/:prd_id`} element={<Product />} />
          <Route path={Paths.Cart} element={<Cart />} />
          <Route element={<ProtectedRoute />}>
            <Route path={`${Paths.Profile}/:pg`} element={<ProfilePage />} />
          </Route>
          <Route element={<AdminProtectedRoute />}>
            <Route
              path={`${Paths.Controller}/:pg?/:sec?`}
              element={<ControllerPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Page404 />} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
