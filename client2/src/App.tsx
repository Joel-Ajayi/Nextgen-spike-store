import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouteProps,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { getUser } from "./requests/user";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice from "./store/userState";

function UserRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/404" replace />;
}

function SellerRoute() {
  const user = useAppSelector((state) => state.user);
  return !user.isAuthenticated && user.role === 1 ? (
    <Outlet />
  ) : (
    <Navigate to="/404" replace />
  );
}

function GetUserWrapper() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { resetUserState, setUserState } = userSlice.actions;

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) {
        dispatch(resetUserState());
      } else {
        dispatch(setUserState({ ...user, isAuthenticated: true }));
      }
      setIsLoading(false);
    })();
  }, []);

  return isLoading ? <div>isLoading...</div> : <Outlet />;
}

function Routes() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<GetUserWrapper />}>
        <Route path="/" element={<div>hi</div>} />
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    )
  );
  return <RouterProvider router={routes} />;
}

export default Routes;
