import React, { useEffect, useRef } from 'react'
import Styles from './sidebar.module.scss';
import { HiBars3BottomLeft as SideBarIcon } from 'react-icons/hi2'
import { CONSTS } from '../../../../../const';
import TabSideBar from './TabSideBar/TabSideBar';
import controllerStateSlice from "../../../../../store/controller/states";
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';

type SideBarProp = {
    isFixed: boolean;
}

function ControllerSideBar({ isFixed }: SideBarProp) {
    const dispatch = useAppDispatch();
    const { showSideBar: showBar, sideBarWrapperStyle: wrapperStyle, sideBarStyle: style } = useAppSelector((state) => state.controller.state);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const { setSideBarState, setSideBarStyle, setSideBarWrapperStyle } = controllerStateSlice.actions;

    const handleToggle = (e: MouseEvent) => {
        if (showBar) {
            const paths = e.composedPath()
            const show = paths.findIndex(
                (el) => (el as any).id === CONSTS.ids.appSideBar
            ) !== -1;
            if (!show) {
                dispatch(setSideBarState(show));
                dispatch(setSideBarWrapperStyle({ backgroundColor: "transparent", left: 0 }));
                dispatch(setSideBarStyle({ left: "-100%" }));
                setTimeout(() => {
                    dispatch(setSideBarWrapperStyle({ left: "-100%" }));
                }, 200);
            }
        }
    };

    const handleBarAction = () => {
        dispatch(setSideBarWrapperStyle({ left: 0 }));
        dispatch(setSideBarStyle({ left: 0 }));
        dispatch(setSideBarState(true));
    }

    useEffect(() => {
        if (wrapperRef.current && isFixed) {
            wrapperRef.current.addEventListener("click", handleToggle);
        }
        return () => {
            if (wrapperRef.current) {
                wrapperRef.current.removeEventListener("click", handleToggle);
            }
        };
    }, [wrapperRef.current, style]);

    return (
        <div className={Styles.bar_wrapper}>
            <SideBarIcon className={Styles.icon} onClick={handleBarAction} />
            <div style={wrapperStyle} ref={wrapperRef} className={isFixed ? Styles.content_fixed : Styles.content}>
                <div className={Styles.bar} style={style} id={CONSTS.ids.appSideBar}>
                    <TabSideBar isFixed={isFixed} />
                </div>
            </div>
        </div>
    )
}

export default ControllerSideBar