/**
 * Wrapper for react-force-graph - workaround for Next.js SSR rendering
 */
import dynamic from "next/dynamic";

const NoSSRGraphWrapper = dynamic(() => import("./NoSSRGraph"), { ssr: false });

export default NoSSRGraphWrapper;
