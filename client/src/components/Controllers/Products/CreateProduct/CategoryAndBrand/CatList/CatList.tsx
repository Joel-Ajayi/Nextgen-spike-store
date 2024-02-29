import React, { useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import { useAppSelector } from "../../../../../../store/hooks";
import uniqId from "uniqid";
import { useDispatch } from "react-redux";
import controllerPrdSlice from "../../../../../../store/controller/products";
import { FaCaretRight as CaretIcon } from "react-icons/fa";
import categoryReq from "../../../../../../requests/category";
import Spinner from "../../../../../shared/Loader/SpinLoader/SpinLoader";
import { CategoryFeature } from "../../../../../../types/category";

type Props = {
  pathIndex?: number;
};

function CatList({ pathIndex = 0 }: Props) {
  const dispatch = useDispatch();

  const path = useAppSelector(
    (state) => state.controller.products.formData.categoriesPath
  );
  const categories = useAppSelector(
    (state) => state.controller.products.formData.categories
  );
  const initialProductFeatures = useAppSelector(
    (state) => state.controller.products.product.initFeatures
  );

  const setCategoryListPath = controllerPrdSlice.actions.setCategoryListPath;
  const setCategoryList = controllerPrdSlice.actions.setCategoryList;
  const setProductInput = controllerPrdSlice.actions.setProductInput;
  const setProductFormFeatures =
    controllerPrdSlice.actions.setProductFormFeatures;

  const pathVal = path[pathIndex];
  const hasChildrenInList = pathIndex < path.length - 1;

  const [isLoading, setIsLoading] = useState(false);

  const addPath = async (name: string, cId: number) => {
    if (name === path[path.length - 1]) return;
    setIsLoading(true);

    let newPath: string[] = [];

    let cats = await categoryReq.getCategories(name);
    if (!cats) cats = [];

    if (hasChildrenInList) {
      newPath = path.filter((_, i) => i <= pathIndex);
      const newCats = categories.filter(({ parent }) =>
        newPath.includes(parent)
      );
      newPath = [...newPath, name];
      dispatch(setCategoryList([...newCats, ...cats]));
    } else {
      dispatch(setCategoryList([...categories, ...cats]));
      newPath = [...path, name];
    }

    const features: CategoryFeature[] = [];
    categories.forEach((c) => {
      if (newPath.includes(c.name)) features.push(...c.features);
    });
    const featureIds = features.map((f) => f.id);

    const productFeatures = initialProductFeatures.filter((f) =>
      featureIds.includes(f.featureId)
    );

    dispatch(setProductInput({ value: cId, name: "cId" }));
    dispatch(setProductInput({ value: productFeatures, name: "features" }));
    dispatch(setCategoryListPath(newPath));
    dispatch(setProductFormFeatures(features));
    setIsLoading(false);
  };

  const items = useMemo(
    () =>
      categories
        .filter((cat) => cat.parent === pathVal)
        .map((cat) => (
          <div
            className={`${Styles.list_item} ${
              path.includes(cat.name) ? Styles.active : ""
            }`}
            onClick={() => addPath(cat.name, cat.cId)}
            key={uniqId()}
          >
            <li>
              <span>{cat.name}</span>
              {cat.banner?.image && <img src={cat.banner.image as string} />}
            </li>
          </div>
        )),
    [path]
  );

  return (
    <>
      {!!items.length && pathIndex !== 0 && (
        <div className={Styles.carret}>
          <CaretIcon className="svg-brand-fill" />
        </div>
      )}
      {!!items.length && <ul className={Styles.list}>{items}</ul>}
      {isLoading && (
        <div className={Styles.spinner}>
          <Spinner brandColor radius={10} />
        </div>
      )}
      {hasChildrenInList && !isLoading && <CatList pathIndex={pathIndex + 1} />}
    </>
  );
}

export default CatList;
