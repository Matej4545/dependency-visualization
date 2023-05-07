import dynamic from "next/dynamic";

const NoSSRGraphWrapper = dynamic(() => import("./NoSSRGraph"), { ssr: false });

export default NoSSRGraphWrapper;
