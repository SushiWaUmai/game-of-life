import {
  changeZoom,
  clear,
  getDisabledHex,
  getEnabledHex,
  getGridHex,
  loadClipboard,
  randomize,
  saveClipboard,
  setDisabledColor,
  setEnabledColor,
  setGridColor,
  toDefaults,
  toggleLoop,
  toggleSelection,
} from "../utils/sketch";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { Tab } from "@headlessui/react";

interface SketchControlsProps {}

const PanelButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  return (
    <button className="bg-stone-700 btn py-1 px-3 rounded" onClick={onClick}>
      {children}
    </button>
  );
};

const PanelColor: React.FC<{
  children?: React.ReactNode;
  defaultValue: () => string;
  onChange: (val: string) => void;
}> = ({ children, onChange, defaultValue }) => {
  console.log(defaultValue);
  return (
    <div className="bg-stone-700 py-1 px-3 rounded flex justify-between">
      <div>{children}</div>
      <input
        type="color"
        defaultValue={defaultValue()}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

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
                <PanelButton onClick={clear}>Clear</PanelButton>
                <PanelButton onClick={toDefaults}>Reset Position</PanelButton>
                <PanelButton onClick={randomize}>Randomize</PanelButton>
                <PanelButton onClick={toggleLoop}>Toggle Loop</PanelButton>
                <PanelButton onClick={toggleSelection}>
                  Toggle Selection
                </PanelButton>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col gap-5">
                <PanelColor
                  defaultValue={getEnabledHex}
                  onChange={setEnabledColor}
                >
                  Enabled Color
                </PanelColor>
                <PanelColor
                  defaultValue={getDisabledHex}
                  onChange={setDisabledColor}
                >
                  Disabled Color
                </PanelColor>
                <PanelColor defaultValue={getGridHex} onChange={setGridColor}>
                  Grid Color
                </PanelColor>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col gap-5">
                <PanelButton onClick={saveClipboard}>
                  Save clipboard to file
                </PanelButton>
                <PanelButton onClick={loadClipboard}>
                  Load clipboard from file
                </PanelButton>
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
