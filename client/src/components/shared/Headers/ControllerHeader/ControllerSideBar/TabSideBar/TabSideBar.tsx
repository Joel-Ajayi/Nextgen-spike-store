import React, { useLayoutEffect, useState } from "react";
import data, { DataType } from "../../data";
import Styles from "./tabSideBar.module.scss";
import { TiArrowBack } from "react-icons/ti";
import DropdownItem from "../../../../Dropdown/DropdownItem/DropdownItem";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import controllerStateSlice from "../../../../..//../store/controller/states";
import uniqId from "uniqid";

type SideBarProps = {
  isFixed: boolean;
};

function TabSideBar({ isFixed }: SideBarProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<{ [x: string]: DataType }>({});

  const { setActiveTabs } = controllerStateSlice.actions;
  const activeTabs = useAppSelector(
    (state) => state.controller.state.activeTabs
  );

  useLayoutEffect(() => {
    const currentTab = (function getCurrentsTabs(
      tabData: { [x: string]: DataType },
      lvl: number
    ): { [x: string]: DataType } {
      const dataItem = tabData[activeTabs[lvl]];
      const hasItems = !!Object.keys(dataItem?.items || {}).length;
      return hasItems ? getCurrentsTabs(dataItem.items, ++lvl) : tabData;
    })(data, 0);
    setActiveTab(currentTab);
  }, [activeTabs]);

  const handleReturn = () => {
    dispatch(
      setActiveTabs(activeTabs.filter((_, i, arr) => i < arr.length - 1))
    );
  };

  const handleSetTab = (tab: string) => {
    if (!activeTabs.includes(tab)) {
      const tabPath: string[] = [];

      (function findPath(
        data: {
          [x: string]: DataType;
        },
        path: string[]
      ) {
        Object.keys(data).forEach((dataKey) => {
          if (dataKey !== tab) {
            findPath(data[dataKey].items, [...path, dataKey]);
            return;
          }
          tabPath.push(...path, dataKey);
        });
      })(data, []);

      dispatch(setActiveTabs(tabPath));
    }
  };

  return (
    <>
      {isFixed && !!activeTabs.length && (
        <div className={Styles.return_button}>
          <TiArrowBack className={Styles.return_icon} onClick={handleReturn} />
        </div>
      )}
      <ul className={Styles.tabs}>
        {Object.values(activeTab).map((tab) => {
          const hasItems = !!Object.keys(tab.items).length;
          const link = !hasItems ? tab.link : () => "";
          const clickAction = hasItems ? () => handleSetTab(tab.id) : undefined;
          return (
            <DropdownItem
              title={tab.title}
              key={uniqId()}
              onClick={clickAction as any}
              link={link}
              highlight
            />
          );
        })}
      </ul>
    </>
  );
}

export default TabSideBar;
