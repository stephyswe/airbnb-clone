import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, useMutation } from "@apollo/client";
import { Affix, Layout, Spin } from "antd";
import reportWebVitals from "./reportWebVitals";
import { AppHeaderSkeleton, AppHeader, Home, Host, Listing, Listings, Login, NotFound, User } from "./sections";
import { ErrorBanner } from "./lib/components";
import { LOG_IN } from "./lib/graphql/mutations";
import {
  LogIn as LogInData,
  LogInVariables,
} from "./lib/graphql/mutations/LogIn/__generated__/LogIn";
import { Viewer } from "./lib/types";
import "./styles/index.css";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "/api",
  headers: {
    "X-CSRF-TOKEN": sessionStorage.getItem("token") || "",
  },
});

const initialViewer: Viewer = {
  id: null,
  avatar: null,
  didRequest: false,
  hasWallet: null,
  token: null,
};


const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);

  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) {
          sessionStorage.setItem("token", data.logIn.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    },
  })

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <BrowserRouter>
      <Layout id="app">
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        {logInErrorBannerElement}
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/host" element={<Host />}></Route>
          <Route path="/listing/:id" element={<Listing />}></Route>
          <Route path="/listings/:location?" element={<Listings title="TinyHouse" />}></Route>
          <Route path="/login" element={<Login setViewer={setViewer} />}></Route>
          <Route path="/user/:id" element={<User />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();