import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import RouteGuard from "@/components/RouteGuard";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <RouteGuard>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </RouteGuard>
  );
}
