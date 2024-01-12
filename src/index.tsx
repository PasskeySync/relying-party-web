import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
// @ts-ignore
import {createBrowserRouter, redirect, RouterProvider, useNavigation} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import {getUserInfo} from "./api/api_user";
import {AxiosError} from "axios";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
const router = createBrowserRouter([
    {
        path: "/",
        loader: async () => {
            return redirect("/user")
        }
    },
    {
        path: "/login",
        Component: LoginPage,
        loader: async () => {
            try {
                await getUserInfo()
                return redirect("/user");
            } catch (e) {
                return null
            }
        }
    },
    {
        path: "/user",
        Component: UserPage,
        loader: async () => {
            try {
                return await getUserInfo();
            } catch (e) {
                if (e instanceof AxiosError) {
                    console.log(e.response?.data)
                }
                throw redirect("/login")
            }
        }
    }
]);

root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
