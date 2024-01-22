import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import controllerCatSlice from "../../../../store/controller/categories";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { ITreeNode } from "../../../../types";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import Tree from "../../../shared/Tree/Tree";
import ControllerStyles from "../../controller.module.scss";
import Styles from "./catListing.module.scss";
import categoryReq from "../../../../requests/category";
import { CategoryMini } from "../../../../types/category";
import appSlice from "../../../../store/appState";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";

function CategoryListing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { updateCategories: updateCategory, setCategories } =
    controllerCatSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;

  const categories = useAppSelector(
    (state) => state.controller.categories.categories
  );

  const [isLoading, setLoading] = useState(true);

  const treeContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!categories.length) {
        const { cats, msg } = await categoryReq.getCategories();
        if (msg.msg) dispatch(setBackgroundMsg(msg));
        if (cats) dispatch(setCategories(cats));
      }
      setLoading(false);
    })();
  }, []);

  const onMove = async (id: string, destId: string) => {
    const { cat, msg } = await categoryReq.updateCatParent(id, destId);
    if (msg) {
      dispatch(setBackgroundMsg(msg));
    }
    if (cat) {
      const index = categories.findIndex((cat) => cat.name === id);
      dispatch(updateCategory({ index, cat: cat as CategoryMini }));
    }
  };

  const onAppend = (id: string) => {
    let link = `/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`;
    if (id)
      link += id ? `&parent=${id.replace(/\s/g, "-").replace("&", "%26")}` : "";
    navigate(link, { replace: false });
  };

  const onEdit = (id: string) => {
    navigate(
      `/controller?pg=${Pages.Categories}&sec=${
        PageSections.UpdateCat
      }&cat_id=${id.replace(/\s/g, "-").replace("&", "%26")}`,
      { replace: false }
    );
  };

  const tree = useMemo(() => {
    if (isLoading) return null;
    const width = window?.innerWidth > 500 ? window?.innerWidth - 50 : 500;
    let height = 100;

    const rawTree: ITreeNode = {
      name: "Categories",
      id: "",
      level: 0,
      appendable: true,
      moveable: false,
      children: (function pushToTree(
        parent: string,
        level: number
      ): ITreeNode[] {
        return categories
          .filter((cat) => cat.parent === parent)
          .map(({ name }) => {
            height += 55;
            return {
              name,
              id: name,
              level,
              moveable: true,
              appendable: true,
              children: pushToTree(name, level + 1),
            };
          });
      })("", 1),
    };

    return (
      <Tree
        rawTree={rawTree}
        height={height}
        width={width}
        nodeWidth={130}
        nodeHeight={0}
        onAppend={onAppend}
        onMove={onMove}
        onEdit={onEdit}
      />
    );
  }, [isLoading, categories]);

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.header_content}>
          <div className={ControllerStyles.title}>Category Listings</div>
          <div>
            <Button
              value="ADD NEW CATEGORY"
              type="button"
              className={Styles.all_cat_button}
              link={`/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`}
            />
          </div>
        </div>
      </div>
      <div className={Styles.content} ref={treeContainer}>
        {isLoading ? <SpinLoader brandColor /> : tree}
      </div>
    </div>
  );
}

export default CategoryListing;
