import {
  changeZoom,
  clear,
  loadClipboard,
  randomize,
  saveClipboard,
  toDefaults,
  toggleLoop,
} from "../utils/sketch";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { Tab } from "@headlessui/react";

interface SketchControlsProps {}

const SketchControls: React.FC<SketchControlsProps> = () => {
  return (
    <div className="p-4 flex flex-col w-full">
      <h1 className="text-3xl xl:text-5xl">{"Conway's Game of Life"}</h1>
      <div className="m-2">
        <a
          href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
          className="text-orchid inline-block btn btn-effect"
        >
          {"What is Conway's Game of Life?"}
        </a>
      </div>
      <div className="my-5 flex-grow">
        <Tab.Group>
          <Tab.List className="flex justify-around">
            <Tab className="tab">Controls</Tab>
            <Tab className="tab">Colors</Tab>
            <Tab className="tab">Advanced</Tab>
          </Tab.List>
          <Tab.Panels className="bg-stone-800 p-5 rounded-b-lg">
            <Tab.Panel>
              <div className="flex flex-col gap-5">
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => clear()}
                >
                  Clear
                </button>
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => toDefaults()}
                >
                  Reset Position
                </button>
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => randomize()}
                >
                  Randomize
                </button>
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => toggleLoop()}
                >
                  Toggle Loop
                </button>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col gap-5"></div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col gap-5">
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => saveClipboard()}
                >
                  Save clipboard to file
                </button>
                <button
                  className="bg-stone-700 btn py-1 px-3 rounded"
                  onClick={() => loadClipboard()}
                >
                  Load clipboard from file
                </button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <div className="flex-shrink flex gap-x-3 flex-row-reverse">
        <button
          className="bg-stone-800 btn py-2 px-2 rounded"
          onClick={() => changeZoom(1, 0.5, 0.5)}
        >
          <BsZoomOut />
        </button>
        <button
          className="bg-stone-800 btn py-2 px-2 rounded"
          onClick={() => changeZoom(-1, 0.5, 0.5)}
        >
          <BsZoomIn />
        </button>
      </div>
    </div>
  );
};

export default SketchControls;
