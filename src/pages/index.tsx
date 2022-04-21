import type { NextPage } from "next";
import SketchComponent from "../components/SketchComponent";
import SketchControls from "../components/SketchControls";

const Home: NextPage = () => {
  return (
    <div className="flex">
      <SketchComponent />
      <SketchControls />
    </div>
  );
};

export default Home;
