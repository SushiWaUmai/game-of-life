import React from "react";
import sketch from "../utils/sketch";
import dynamic from "next/dynamic";
import { P5WrapperProps } from "react-p5-wrapper";

const ReactP5Wrapper = dynamic(
  () => import("react-p5-wrapper").then((mod) => mod.ReactP5Wrapper as any),
  {
    ssr: false,
  }
) as unknown as React.NamedExoticComponent<P5WrapperProps>;

interface SketchComponentProps {}

const SketchComponent: React.FC<SketchComponentProps> = () => {
  return <ReactP5Wrapper sketch={sketch} />;
};

export default SketchComponent;
