import type { NextPage } from "next";
import SketchComponent from "../components/SketchComponent";
import SketchControls from "../components/SketchControls";

const Home: NextPage = () => {
  return (
    <div className="overflow-hidden flex flex-col lg:flex-row">
      <SketchComponent />
      <SketchControls />
    </div>
  );
};

export default Home;
