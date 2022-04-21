import { changeZoom, clear, randomize, toDefaults, toggleLoop } from "../utils/sketch";

interface SketchControlsProps {}

const SketchControls: React.FC<SketchControlsProps> = () => {
  return (
    <div className="m-4">
      <h1 className="text-3xl">{"Conway's Game of Life"}</h1>
      <div className="my-5 flex gap-x-5">
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => clear()}
        >
          Clear
        </button>
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => toDefaults()}
        >
          Reset Position
        </button>
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => randomize()}
        >
          Randomize
        </button>
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => toggleLoop()}
        >
          Toggle Loop
        </button>
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => changeZoom(-1, 0.5, 0.5)}
        >
          Zoom In
        </button>
        <button
          className="bg-stone-800 btn py-1 px-3 rounded"
          onClick={() => changeZoom(1, 0.5, 0.5)}
        >
          Zoom Out
        </button>
      </div>
    </div>
  );
};

export default SketchControls;
