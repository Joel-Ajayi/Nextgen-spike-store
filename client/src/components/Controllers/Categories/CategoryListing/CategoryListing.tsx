import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import controllerCatSlice from "../../../../store/controller/categories";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { IMessage, ITreeNode } from "../../../../types";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import Tree from "../../../shared/Tree/Tree";
import ControllerStyles from "../../controller.module.scss";
import Styles from "./catListing.module.scss";
import categoryReq from "../../../../requests/category";
import { CategoryMini, CategoryType } from "../../../../types/category";
import appSlice from "../../../../store/appState";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";

function CategoryListing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { updateCategory, setCategories } = controllerCatSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;
  const categories = useAppSelector(
    (state) => state.controller.category.categories
  );

  const [isLoading, setLoading] = useState(true);

  const treeContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!categories.length) {
        const cats = await categoryReq.getCategories();
        if ((cats as IMessage)?.msg) {
          dispatch(setCategories([]));
        } else {
          dispatch(setCategories(cats as CategoryMini[]));
        }
      }
      setLoading(false);
    })();
  }, []);

  const onMove = async (id: string, destId: string) => {
    const cat = await categoryReq.updateCatParent(id, destId);
    if ((cat as IMessage)?.msg) {
      dispatch(
        setBackgroundMsg({ msg: (cat as any).msg, type: (cat as any).type })
      );
    } else {
      const index = categories.findIndex((cat) => cat.name === id);
      dispatch(updateCategory({ index, cat: cat as CategoryMini }));
    }
  };

  const onAppend = (id: string) => {
    let type = CategoryType.SuperOrd;
    const parent = categories.find(({ name }) => name === id);

    if (!!parent) {
      type =
        parent.type === CategoryType.SuperOrd
          ? CategoryType.Basic
          : CategoryType.SubOrd;
    }

    let link = `/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}&type=${type}`;
    if (id) link += `&parent=${id}`;
    navigate(link, { replace: false });
  };

  const onEdit = (id: string) => {
    const cat = categories.find(({ name }) => name === id);
    navigate(
      `/controller?pg=${Pages.Categories}&sec=${PageSections.UpdateCat}&cat_id=${id}&type=${cat?.type}`,
      { replace: false }
    );
  };

  const tree = useMemo(() => {
    if (isLoading) return null;
    const width = window?.innerWidth || 500;
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
          .map(({ name, type }) => {
            height += 55;
            return {
              name,
              id: name,
              level,
              moveable: type !== CategoryType.SuperOrd,
              appendable: type !== CategoryType.SubOrd,
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
        nodeWidth={110}
        nodeHeight={30}
        onAppend={onAppend}
        onMove={onMove}
        onEdit={onEdit}
      />
    );
  }, [isLoading, categories]);

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.title}>Category Listings</div>
        <div>
          <Button
            value="ADD NEW CATEGORY"
            type="button"
            className={Styles.all_cat_button}
            link={`/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}&type=${CategoryType.SuperOrd}`}
          />
        </div>
      </div>
      <div className={Styles.content} ref={treeContainer}>
        {isLoading ? <SpinLoader brandColor /> : tree}
      </div>
    </div>
  );
}

export default CategoryListing;
