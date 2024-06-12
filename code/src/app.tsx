import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";

export default function App() {
  return (
    <Router
      base={import.meta.env.SERVER_BASE_URL}
      root={(props) => (
        <>
          <MetaProvider>
            <Title>Pitch</Title>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
