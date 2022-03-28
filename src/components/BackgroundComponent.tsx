import React from "react";
import dynamic from "next/dynamic";
import { setup, draw } from "../utils/sketch";

// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

interface BackgroundComponentProps {}

const BackgroundComponent: React.FC<BackgroundComponentProps> = () => {
  return <Sketch setup={setup} draw={draw} />;
};

export default BackgroundComponent;
